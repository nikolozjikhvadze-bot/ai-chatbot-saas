import type { ToolContext, ToolResult } from "./types";

export interface LogKnowledgeGapArgs {
  question: string;
  category?: string;
}

export async function logKnowledgeGap(
  args: LogKnowledgeGapArgs,
  ctx: ToolContext
): Promise<ToolResult> {
  try {
    const { error } = await ctx.supabase.from("knowledge_gaps").insert({
      bot_id: ctx.botId,
      conversation_id: ctx.conversationId,
      question: args.question,
      category: args.category || "general",
      status: "unresolved",
    });

    if (error) {
      console.error("Knowledge gap-ის შენახვა ვერ მოხერხდა:", error);
      return { success: false, message: "ბაზაში ჩაწერა ვერ მოხერხდა" };
    }

    return { success: true, message: "ცოდნის დანაკლისი წარმატებით დარეგისტრირდა" };
  } catch (err) {
    console.error("logKnowledgeGap შეცდომა:", err);
    return { success: false, message: "დაფიქსირდა შეცდომა" };
  }
}