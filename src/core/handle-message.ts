import { ai, CHAT_MODEL } from "@/lib/gemini";
import type { SupabaseClient } from "@supabase/supabase-js";
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
  isOwner?: boolean;
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

    if (conversationId) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender: "user",
        content: input.text,
      });
    }

    const { data: bot, error: botErr } = await supabase
      .from("bots")
      .select("name, tone, system_prompt, telegram_chat_id")
      .eq("id", input.botId)
      .single();

    if (botErr || !bot) {
      throw new Error(`Bot not found: ${input.botId}`);
    }

    const { data: projectFiles } = await supabase
      .from("bot_files")
      .select("file_path, content")
      .eq("bot_id", input.botId);

    let filesContext = "";
    if (projectFiles && projectFiles.length > 0) {
      filesContext =
        "\n\nარსებული პროექტის ფაილები:\n" +
        projectFiles
          .map((f) => `--- ფაილი: ${f.file_path} ---\n${f.content}`)
          .join("\n\n");
    } else {
      filesContext = "\n\nპროექტში ჯერ ფაილები არ არის შექმნილი.";
    }

    const language = detectLanguage(input.text);
    const chunks: any[] = [];

    const baseSystemPrompt = buildSystemPrompt({
      botName: bot.name ?? "Assistant",
      tone: bot.tone ?? "helpful and professional",
      instructions: bot.system_prompt,
      language,
      chunks,
    });

    const systemInstruction = baseSystemPrompt + filesContext;

    const toolCtx = {
      botId: input.botId,
      conversationId: conversationId || "",
      supabase,
      userMessage: input.text,
      telegramChatId:
        (input.metadata?.telegram_chat_id as string) || bot.telegram_chat_id,
      metadata: input.metadata,
    };

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

        while (mapped.length > 0 && mapped[0].role !== "user") {
          mapped.shift();
        }

        if (mapped.length > 0) contents = mapped;
      }
    }

    // მფლობელისთვის activeTools-ის დინამიკურად დამატება (update_file + delete_file)
    const activeTools = [
      ...toolsDefinition,
      ...(input.isOwner
        ? [
            {
              functionDeclarations: [
                {
                  name: "update_file",
                  description:
                    "ფაილის კოდის განახლება ან შეცვლა პროექტში. გამოიყენე როცა მფლობელი გთხოვს კოდის შეცვლას ან ფაილის განახლებას.",
                  parameters: {
                    type: "OBJECT",
                    properties: {
                      filePath: {
                        type: "STRING",
                        description:
                          "ფაილის ზუსტი გზა და სახელი, მაგალითად: components/Header.tsx",
                      },
                      newContent: {
                        type: "STRING",
                        description: "ფაილის სრული ახალი კოდი",
                      },
                      reason: {
                        type: "STRING",
                        description: "ცვლილების მიზეზი",
                      },
                    },
                    required: ["filePath", "newContent", "reason"],
                  },
                },
                {
                  name: "delete_file",
                  description:
                    "ფაილის წაშლა პროექტიდან. გამოიყენე მხოლოდ მაშინ, როცა მფლობელი პირდაპირ ითხოვს კონკრეტული ფაილის წაშლას.",
                  parameters: {
                    type: "OBJECT",
                    properties: {
                      filePath: {
                        type: "STRING",
                        description: "წასაშლელი ფაილის ზუსტი გზა, მაგალითად: components/Old.tsx",
                      },
                      reason: {
                        type: "STRING",
                        description: "წაშლის მიზეზი",
                      },
                    },
                    required: ["filePath", "reason"],
                  },
                },
              ],
            },
          ]
        : []),
    ];

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
              tools: activeTools as any,
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
          } else if (name === "update_file") {
            const args = call.args as {
              filePath: string;
              newContent: string;
              reason: string;
            };
            if (args && args.filePath && args.newContent) {
              await supabase.from("bot_files").upsert(
                {
                  bot_id: input.botId,
                  file_path: args.filePath,
                  content: args.newContent,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "bot_id,file_path" }
              );
            }
          } else if (name === "delete_file") {
            const args = call.args as { filePath: string; reason: string };
            if (args && args.filePath) {
              await supabase
                .from("bot_files")
                .delete()
                .eq("bot_id", input.botId)
                .eq("file_path", args.filePath);
            }
          }
        }
      }
    }

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