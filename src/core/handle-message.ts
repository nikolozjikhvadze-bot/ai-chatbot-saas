import { ai, CHAT_MODEL } from "@/lib/gemini";
import type { SupabaseClient } from "@supabase/supabase-js";
import { retrieve } from "./retrieval";
import { buildSystemPrompt } from "./prompt";
import { detectLanguage } from "./language";
import { logKnowledgeGap } from "./tools/log-knowledge-gap";
import { requestHuman } from "./tools/request-human";

export type ChatEvent =
  | { type: "text_delta"; text: string }
  | { type: "tool_call"; name: string; args: unknown }
  | { type: "done"; conversationId?: string }
  | { type: "error"; message: string };

interface MessageInput {
  botId: string;
  channel: string;
  externalUserId: string;
  text: string;
  conversationId?: string;
  metadata?: Record<string, unknown>;
}

const toolsDefinition = [
  {
    functionDeclarations: [
      {
        name: "log_knowledge_gap",
        description:
          "გამოიყენე ეს ინსტრუმენტი, როცა მომხმარებელი სვამს კითხვას, რომელზეც ცოდნის ბაზაში პასუხი არ მოიპოვება.",
        parameters: {
          type: "OBJECT",
          properties: {
            question: {
              type: "STRING",
              description: "მომხმარებლის უპასუხოდ დარჩენილი კითხვა",
            },
            category: {
              type: "STRING",
              description: "კითხვის კატეგორია (არასავალდებულო)",
            },
          },
          required: ["question"],
        },
      },
      {
        name: "request_human",
        description:
          "გამოიყენე ეს ინსტრუმენტი, როდესაც მომხმარებელი ითხოვს რეალურ ოპერატორთან / ადამიანთან დალაპარაკებას.",
        parameters: {
          type: "OBJECT",
          properties: {
            reason: {
              type: "STRING",
              description: "ოპერატორის ჩართვის მიზეზი",
            },
          },
          required: ["reason"],
        },
      },
    ],
  },
];

export async function* handleMessage(
  input: MessageInput,
  supabase: SupabaseClient,
  _signal?: AbortSignal
): AsyncGenerator<ChatEvent, void, unknown> {
  try {
    let conversationId = input.conversationId;

    // 1. კონვერსაციის შექმნა ან მოძიება
    if (!conversationId) {
      const { data: conv } = await supabase
        .from("conversations")
        .insert({
          bot_id: input.botId,
          channel: input.channel,
          external_user_id: input.externalUserId,
        })
        .select("id")
        .single();

      if (conv) conversationId = conv.id;
    }

    // 2. მომხმარებლის შეტყობინების შენახვა ბაზაში
    if (conversationId) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender: "user",
        content: input.text,
      });
    }

    // 3. ბოტის პარამეტრები
    const { data: bot, error: botErr } = await supabase
      .from("bots")
      .select("name, tone, system_prompt, telegram_chat_id")
      .eq("id", input.botId)
      .single();

    if (botErr || !bot) {
      throw new Error(`Bot not found: ${input.botId}`);
    }

    // 4. ენის დეტექცია
    const language = detectLanguage(input.text);

    // 5. RAG Search
    const { chunks, topSimilarity } = await retrieve(
      supabase,
      input.botId,
      input.text
    );

    // დროებითი დიაგნოსტიკა (პრობლემის მოგვარების შემდეგ წაშალე)
    console.log("RAG debug:", {
      botId: input.botId,
      query: input.text,
      chunkCount: chunks.length,
      topSimilarity,
    });

    // 6. System Prompt
    const systemInstruction = buildSystemPrompt({
      botName: bot.name ?? "Assistant",
      tone: bot.tone ?? "helpful and professional",
      instructions: bot.system_prompt,
      language,
      chunks,
    });

    const toolCtx = {
      botId: input.botId,
      conversationId: conversationId || "",
      supabase,
      userMessage: input.text,
      telegramChatId:
        (input.metadata?.telegram_chat_id as string) || bot.telegram_chat_id,
      metadata: input.metadata,
    };

    // 7. საუბრის ისტორია (ბოლო 12 შეტყობინება; მიმდინარე უკვე შენახულია)
    let contents: any[] = [{ role: "user", parts: [{ text: input.text }] }];

    if (conversationId) {
      const { data: history } = await supabase
        .from("messages")
        .select("sender, content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(12);

      if (history && history.length > 0) {
        const mapped = history.reverse().map((m: any) => ({
          role: m.sender === "user" ? "user" : "model",
          parts: [{ text: m.content as string }],
        }));

        // Gemini-სთვის საუბარი "user" შეტყობინებით უნდა იწყებოდეს
        while (mapped.length > 0 && mapped[0].role !== "user") {
          mapped.shift();
        }

        if (mapped.length > 0) contents = mapped;
      }
    }

    // 8. Gemini API-ის გამოძახება Fallback & Retry ლოგიკით
    const FALLBACK_MODEL = "gemini-2.0-flash";
    const modelsToTry = Array.from(new Set([CHAT_MODEL, FALLBACK_MODEL]));

    let responseStream: any = null;
    let lastError: any = null;

    modelLoop: for (const modelName of modelsToTry) {
      const retriesPerModel = 2;
      for (let attempt = 1; attempt <= retriesPerModel; attempt++) {
        try {
          responseStream = await ai.models.generateContentStream({
            model: modelName,
            contents,
            config: {
              systemInstruction: systemInstruction,
              tools: toolsDefinition as any,
            },
          });

          lastError = null;
          break modelLoop;
        } catch (err: any) {
          lastError = err;
          console.warn(
            `Gemini API error with model [${modelName}] (Attempt ${attempt}/${retriesPerModel}):`,
            err?.message
          );
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
    }

    if (!responseStream && lastError) {
      throw lastError;
    }

    let fullAssistantResponse = "";

    // 9. Streaming & Function Calling
    for await (const chunk of responseStream) {
      const candidates = chunk.candidates;
      if (!candidates || candidates.length === 0) continue;

      const parts = candidates[0].content?.parts || [];

      for (const part of parts) {
        if (part.text) {
          fullAssistantResponse += part.text;
          yield { type: "text_delta", text: part.text };
        }

        if (part.functionCall && part.functionCall.name) {
          const call = part.functionCall;
          const name = call.name as string;

          yield { type: "tool_call", name, args: call.args };

          if (name === "log_knowledge_gap") {
            await logKnowledgeGap(call.args as any, toolCtx);
          } else if (name === "request_human") {
            if (conversationId) {
              await supabase
                .from("conversations")
                .update({ status: "HUMAN_MODE" })
                .eq("id", conversationId);
            }
            await requestHuman(call.args as any, toolCtx);
          }
        }
      }
    }

    // 10. ასისტენტის პასუხის შენახვა ბაზაში
    if (conversationId && fullAssistantResponse.trim()) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender: "assistant",
        content: fullAssistantResponse,
      });
    }

    yield { type: "done", conversationId };
  } catch (err: any) {
    console.error("handleMessage Error:", err);
    yield {
      type: "error",
      message: err?.message || "შეცდომა შეტყობინების დამუშავებისას",
    };
  }
}