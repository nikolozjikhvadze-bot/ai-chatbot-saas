import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleMessage, type ChatEvent } from "@/core/handle-message";
import { checkRateLimits, getClientIp, rateLimitResponse } from "@/lib/rate-limits";

export const runtime = "nodejs";
export const maxDuration = 60;

/** origin-ს ინარჩუნებს მხოლოდ schema+host+port-ს */
function normalizeOrigin(origin: string | null): string | null {
  if (!origin) return null;
  try {
    const u = new URL(origin);
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

/** CORS Headers საჯარო ვიჯეტისთვის */
function getCorsHeaders(origin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

/** Preflight მოთხოვნების მართვა ბრაუზერებისთვის */
export async function OPTIONS(req: Request) {
  const origin = normalizeOrigin(req.headers.get("origin"));
  const rateLimit = await checkRateLimits([
    { policy: "preflight", key: getClientIp(req) },
  ]);
  if (!rateLimit.success)
    return rateLimitResponse(rateLimit.retryAfter, getCorsHeaders(origin));

  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

const Body = z.object({
  botKey: z.string().min(8).max(80),
  message: z.string().trim().min(1).max(2000),
  visitorId: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),
  conversationId: z.string().uuid().optional(),
});

const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
  "Content-Encoding": "none",
};

export async function POST(req: Request) {
  const origin = normalizeOrigin(
    req.headers.get("origin") || req.headers.get("referer")
  );
  const cors = getCorsHeaders(origin);

  const ipLimit = await checkRateLimits([
    { policy: "publicChatIp", key: getClientIp(req) },
  ]);
  if (!ipLimit.success) return rateLimitResponse(ipLimit.retryAfter, cors);

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "არასწორი მოთხოვნა" },
      { status: 400, headers: cors }
    );
  }
  const { botKey, message, visitorId, conversationId } = parsed.data;

  const chatLimit = await checkRateLimits([
    { policy: "publicChatVisitor", key: `${botKey}:${visitorId}` },
    { policy: "publicChatBot", key: botKey },
  ]);
  if (!chatLimit.success) return rateLimitResponse(chatLimit.retryAfter, cors);

  const sb = createAdminClient();

  // ==========================================
  // ნაწილი 1: ბოტის მოძიება owner_id-სთან ერთად
  // ==========================================
  const { data: bot } = await sb
    .from("bots")
    .select("id, is_active, allowed_origin, allowed_domains, telegram_chat_id, owner_id")
    .eq("id", botKey)
    .maybeSingle();

  if (!bot || !bot.is_active) {
    return NextResponse.json(
      { error: "ბოტი ვერ მოიძებნა ან არააქტიურია" },
      { status: 404, headers: cors }
    );
  }

  // --- Origin / Domain შემოწმება (Localhost-ის სრული მხარდაჭერით) ---
  const isLocalhost =
    origin?.includes("localhost") || origin?.includes("127.0.0.1");

  if (!isLocalhost) {
    const allowedOrigin = bot.allowed_origin;
    const allowedDomains: string[] = bot.allowed_domains || [];

    const originMatches = allowedOrigin ? allowedOrigin === origin : true;
    const domainMatches =
      allowedDomains.length > 0
        ? allowedDomains.some((dom) => origin && origin.includes(dom))
        : true;

    if (!originMatches || !domainMatches) {
      return NextResponse.json(
        { error: "ეს ბოტი ამ დომენიდან წვდომისთვის არ არის ავტორიზებული." },
        { status: 403, headers: cors }
      );
    }
  }

  // ==========================================
  // ნაწილი 2: მფლობელის (Owner) შემოწმება
  // ==========================================
  const authHeader = req.headers.get("authorization");
  let isOwner = false;

  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await sb.auth.getUser(token);
    if (user && user.id === bot.owner_id) {
      isOwner = true;
    }
  }

  // 2. თუ conversationId არსებობს, ვამოწმებთ ხომ არ არის HUMAN_MODE-ში
  if (conversationId) {
    const { data: conv } = await sb
      .from("conversations")
      .select("status")
      .eq("id", conversationId)
      .maybeSingle();

    if (conv?.status === "HUMAN_MODE") {
      await sb.from("messages").insert({
        conversation_id: conversationId,
        sender: "user",
        content: message,
      });

      const encoder = new TextEncoder();
      const humanStream = new ReadableStream({
        start(controller) {
          const send = (event: ChatEvent) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
            );
          };
          send({
            type: "text_delta",
            text: "თქვენი შეტყობინება მიღებულია. ოპერატორი მალე გიპასუხებთ.",
          });
          send({ type: "done", conversationId });
          controller.close();
        },
      });

      return new Response(humanStream, {
        headers: { ...cors, ...SSE_HEADERS },
      });
    }
  }

  // ==========================================
  // ნაწილი 3: AI სტრიმი და handleMessage-ში isOwner-ის გადაცემა
  // ==========================================
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: ChatEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        } catch {
          /* კლიენტმა უკვე დახურა კავშირი */
        }
      };

      try {
        for await (const event of handleMessage(
          {
            botId: bot.id,
            channel: "web",
            externalUserId: visitorId,
            text: message,
            conversationId,
            isOwner, // <-- გადავცემთ მფლობელის ფლაგს
            metadata: {
              user_agent: req.headers.get("user-agent"),
              telegram_chat_id: bot.telegram_chat_id,
            },
          },
          sb,
          req.signal
        )) {
          send(event);
        }
      } finally {
        try {
          controller.close();
        } catch {
          /* უკვე დახურულია */
        }
      }
    },
  });

  return new Response(stream, {
    headers: { ...cors, ...SSE_HEADERS },
  });
}