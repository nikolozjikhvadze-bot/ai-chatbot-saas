import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleMessage, type ChatEvent } from "@/core/handle-message";

export const runtime = "nodejs";
export const maxDuration = 60;

/** CORS Headers საჯარო ვიჯეტისთვის */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/** Preflight მოთხოვნების მართვა ბრაუზერებისთვის */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

const Body = z.object({
  botKey: z.string().min(8).max(80),
  message: z.string().trim().min(1).max(2000),
  visitorId: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),
  conversationId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "არასწორი მოთხოვნა" },
      { status: 400, headers: corsHeaders }
    );
  }
  const { botKey, message, visitorId, conversationId } = parsed.data;

  const sb = createAdminClient();
  const { data: bot } = await sb
    .from("bots")
    .select("id,is_active")
    .eq("public_key", botKey)
    .maybeSingle();

  if (!bot || !bot.is_active) {
    return NextResponse.json(
      { error: "ბოტი ვერ მოიძებნა ან არააქტიურია" },
      { status: 404, headers: corsHeaders }
    );
  }

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
            metadata: { user_agent: req.headers.get("user-agent") },
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
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Content-Encoding": "none",
    },
  });
}