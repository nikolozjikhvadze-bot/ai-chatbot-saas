import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { CHAT_MODEL } from "@/lib/gemini";
import { retrieveContext, formatContextForPrompt } from "@/core/retrieval";
import { checkRateLimits, getClientIp, rateLimitResponse } from "@/lib/rate-limits";

export const runtime = "nodejs";
export const maxDuration = 30;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/** origin-ს ინარჩუნებს მხოლოდ schema+host+port-ს, query/path-ის გარეშე. */
function normalizeOrigin(origin: string | null): string | null {
  if (!origin) return null;
  try {
    const u = new URL(origin);
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

function corsHeaders(allowedOrigin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": allowedOrigin ?? "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export async function OPTIONS(
  req: NextRequest,
  { params }: { params: Promise<{ botId: string }> },
) {
  const origin = normalizeOrigin(req.headers.get("origin"));
  const rateLimit = await checkRateLimits([
    { policy: "preflight", key: getClientIp(req) },
  ]);
  if (!rateLimit.success) return rateLimitResponse(rateLimit.retryAfter, corsHeaders(origin));

  const { botId } = await params;
  const isLocalhost = origin?.includes("localhost") || origin?.includes("127.0.0.1");

  if (z.string().uuid().safeParse(botId).success) {
    const { data: bot } = await supabaseAdmin
      .from("bots")
      .select("allowed_origin")
      .eq("id", botId)
      .maybeSingle();

    if (bot?.allowed_origin && bot.allowed_origin !== origin && !isLocalhost) {
      return new NextResponse(null, { status: 403 });
    }
  }

  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

const Body = z.object({
  message: z.string().min(1).max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      }),
    )
    .max(20)
    .default([]),
}).superRefine((body, context) => {
  const totalChars = body.message.length + body.history.reduce(
    (total, entry) => total + entry.content.length,
    0,
  );
  if (totalChars > 20_000) {
    context.addIssue({ code: "custom", message: "conversation is too long", path: ["history"] });
  }
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ botId: string }> },
) {
  const origin = normalizeOrigin(req.headers.get("origin"));
  const { botId } = await params;

  if (!botId || typeof botId !== "string") {
    return NextResponse.json(
      { error: "invalid bot id" },
      { status: 400, headers: corsHeaders(origin) },
    );
  }
  const ip = getClientIp(req);
  const ipLimit = await checkRateLimits([
    { policy: "relayIp", key: ip },
  ]);
  if (!ipLimit.success) return rateLimitResponse(ipLimit.retryAfter, corsHeaders(origin));

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid request body" },
      { status: 400, headers: corsHeaders(origin) },
    );
  }
  const { message, history } = parsed.data;

  const rateLimit = await checkRateLimits([
    { policy: "relayClient", key: `${botId}:${ip}` },
    { policy: "relayBot", key: botId },
  ]);
  if (!rateLimit.success) return rateLimitResponse(rateLimit.retryAfter, corsHeaders(origin));

  const { data: bot, error: botError } = await supabaseAdmin
    .from("bots")
    .select("id, is_active, system_prompt, allowed_origin")
    .eq("id", botId)
    .maybeSingle();

  if (botError || !bot) {
    return NextResponse.json(
      { error: "bot not found" },
      { status: 404, headers: corsHeaders(origin) },
    );
  }
  if (!bot.is_active) {
    return NextResponse.json(
      { error: "ეს ბოტი დროებით მიუწვდომელია (გამოწერა შეჩერებულია ან პაუზაზეა)." },
      { status: 403, headers: corsHeaders(origin) },
    );
  }

  // --- Origin-ის შემოწმება (localhost-ის სრული მხარდაჭერით) ---
  // --- Origin-ის შემოწმება (ლოკალის სრული პריორიტეტით) ---
  const isLocalhost = origin?.includes("localhost") || origin?.includes("127.0.0.1");

  if (isLocalhost) {
    // თუ ლოკალური ჰოსტია, საერთოდ არ ვამოწმებთ ბაზაში ჩაწერილ დომენს და ვუშვებთ!
    console.log(`[relay] Localhost request allowed: ${origin}`);
  } else {
    if (bot.allowed_origin && bot.allowed_origin !== origin) {
      console.warn(`[relay] origin mismatch for bot ${botId}: expected ${bot.allowed_origin}, got ${origin}`);
      return NextResponse.json(
        { error: "ეს ბოტი ამ დომენიდან წვდომისთვის არ არის ავტორიზებული." },
        { status: 403, headers: corsHeaders(origin) },
      );
    } else if (origin && !bot.allowed_origin) {
      await supabaseAdmin.from("bots").update({ allowed_origin: origin }).eq("id", botId);
    }
  }

  try {
    const chunks = await retrieveContext(message, { botId }, supabaseAdmin);
    const contextBlock = formatContextForPrompt(chunks);

    const systemInstruction = [
      bot.system_prompt || "შენ ხარ დამხმარე ასისტენტი.",
      contextBlock
        ? `\n\nქვემოთ მოცემულია რელევანტური კონტექსტი კომპანიის ცოდნის ბაზიდან. გამოიყენე ეს ინფორმაცია პასუხის გასაცემად, თუ რელევანტურია:\n\n${contextBlock}`
        : "",
    ].join("");

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${CHAT_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [
            ...history.map((h) => ({
              role: h.role === "assistant" ? "model" : "user",
              parts: [{ text: h.content }],
            })),
            { role: "user", parts: [{ text: message }] },
          ],
        }),
      },
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text().catch(() => "");
      console.error("[relay] Gemini API error", geminiRes.status, errBody);

      if (geminiRes.status === 429) {
        return NextResponse.json(
          { error: "სერვისი დროებით გადატვირთულია. სცადეთ ცოტა ხანში." },
          { status: 503, headers: corsHeaders(origin) },
        );
      }
      return NextResponse.json(
        { error: "პასუხის გენერაცია ვერ მოხერხდა." },
        { status: 502, headers: corsHeaders(origin) },
      );
    }

    const data = await geminiRes.json();
    const reply: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return NextResponse.json(
        { error: "ცარიელი პასუხი მოვიდა მოდელისგან." },
        { status: 502, headers: corsHeaders(origin) },
      );
    }

    return NextResponse.json({ reply }, { headers: corsHeaders(origin) });
  } catch (err) {
    console.error("[relay] unexpected error", err);
    return NextResponse.json(
      { error: "სერვერის შეცდომა." },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}