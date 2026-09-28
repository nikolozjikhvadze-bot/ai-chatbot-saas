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
  | { type: "done" }
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

    // 3. ბაზიდან წამოვიღებთ ბოტის პარამეტრებს (telegram_chat_id-ს ჩათვლით)
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

    // 5. RAG Search (კონტექსტის ამოღება pgvector / hybrid_search-ით)
    const { chunks } = await retrieve(supabase, input.botId, input.text);

    // 6. System Prompt-ის აგება
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
      telegramChatId: (input.metadata?.telegram_chat_id as string) || bot.telegram_chat_id,
      metadata: input.metadata,
    };

    // 7. Gemini API-ის გამოძახება systemInstruction-ით
    const responseStream = await ai.models.generateContentStream({
      model: CHAT_MODEL,
      contents: [
        {
          role: "user",
          parts: [{ text: input.text }],
        },
      ],
      config: {
        systemInstruction: systemInstruction,
        tools: toolsDefinition as any,
      },
    });

    let fullAssistantResponse = "";

    // 8. Streaming & Function Calling
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
            // ოპერატორის მოთხოვნისას ჩატის სტატუსი გადაგვყავს HUMAN_MODE-ში
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

    // 9. ასისტენტის პასუხის შენახვა ბაზაში
    if (conversationId && fullAssistantResponse.trim()) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender: "assistant",
        content: fullAssistantResponse,
      });
    }

    yield { type: "done" };
  } catch (err: any) {
    console.error("handleMessage Error:", err);
    yield {
      type: "error",
      message: err?.message || "შეცდომა შეტყობინების დამუშავებისას",
    };
  }
}