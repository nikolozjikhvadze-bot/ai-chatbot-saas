import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { CHAT_MODEL } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 30;

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ------------------------------------------------------------------
// მარტივი in-memory rate limiter. გაფრთხილება: serverless გარემოში
// (Vercel-ის მსგავს) თითოეულ ინსტანციას ცალკე მეხსიერება აქვს, ამიტომ
// ეს "საუკეთესო ძალისხმევის" (best-effort) დაცვაა, არა გარანტირებული.
// production-ისთვის რეკომენდირებულია Upstash Redis (@upstash/ratelimit).
// ------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20; // მოთხოვნა/წუთი, ერთი botId + IP-ს
const hits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// ------------------------------------------------------------------
// CORS: გენერირებული ჩატბოტები მომხმარებლების საკუთარ დომენებზეა
// ჩასმული, ამიტომ ეს endpoint cross-origin მისაწვდომი უნდა იყოს.
// უსაფრთხოებისთვის: production-ში სჯობს '*' ჩანაცვლდეს bot-ის
// დარეგისტრირებული დომენით (bots.allowed_origin), თუ ასეთი column გაქვთ.
// ------------------------------------------------------------------
function corsHeaders(origin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

const Body = z.object({
  message: z.string().min(1).max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        text: z.string(),
      }),
    )
    .max(20)
    .default([]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ botId: string }> },
) {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);
  const { botId } = await params;

  // 1) botId ფორმატის ვალიდაცია
  if (!z.string().uuid().safeParse(botId).success) {
    return NextResponse.json({ error: "invalid bot id" }, { status: 400, headers });
  }

  // 2) Body ვალიდაცია
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request body" }, { status: 400, headers });
  }
  const { message, history } = parsed.data;

  // 3) Rate limit (botId + caller IP)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`${botId}:${ip}`)) {
    return NextResponse.json(
      { error: "ძალიან ბევრი მოთხოვნა. სცადეთ მოგვიანებით." },
      { status: 429, headers },
    );
  }

  // 4) ბოტის არსებობა + subscription სტატუსი
  //    ⚠️ ვარაუდი: bots.status ('active' | 'suspended' | ...)
  //    შეცვალეთ თქვენი რეალური schema-ს მიხედვით.
  const { data: bot, error: botError } = await supabaseAdmin
    .from("bots")
    .select("id, status, system_prompt")
    .eq("id", botId)
    .maybeSingle();

  if (botError || !bot) {
    return NextResponse.json({ error: "bot not found" }, { status: 404, headers });
  }
  if (bot.status !== "active") {
    return NextResponse.json(
      { error: "ეს ბოტი დროებით მიუწვდომელია (გამოწერა შეჩერებულია ან პაუზაზეა)." },
      { status: 403, headers },
    );
  }

  try {
    const systemInstruction = bot.system_prompt || "შენ ხარ დამხმარე ასისტენტი.";

    // 5) Gemini REST API-ს პირდაპირი fetch-ით გამოძახება
    //    (არა @google/genai SDK — Relay-ის მოთხოვნის მიხედვით).
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${CHAT_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [
            ...history.map((h) => ({
              role: h.role,
              parts: [{ text: h.text }],
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
          { status: 503, headers },
        );
      }
      return NextResponse.json(
        { error: "პასუხის გენერაცია ვერ მოხერხდა." },
        { status: 502, headers },
      );
    }

    const data = await geminiRes.json();
    const reply: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return NextResponse.json(
        { error: "ცარიელი პასუხი მოვიდა მოდელისგან." },
        { status: 502, headers },
      );
    }

    return NextResponse.json({ reply }, { headers });
  } catch (err) {
    console.error("[relay] unexpected error", err);
    return NextResponse.json(
      { error: "სერვერის შეცდომა." },
      { status: 500, headers },
    );
  }
}