import type { ToolContext, ToolResult } from "./types";

export interface RequestHumanArgs {
  reason: string;
}

export async function requestHuman(
  args: RequestHumanArgs,
  ctx: ToolContext
): Promise<ToolResult> {
  try {
    const { error } = await ctx.supabase
      .from("conversations")
      .update({
        status: "needs_human",
        metadata: { handoff_reason: args.reason, handoff_at: new Date().toISOString() },
      })
      .eq("id", ctx.conversationId);

    if (error) {
      console.error("Human handoff-ის განახლება ვერ მოხერხდა:", error);
      return { success: false, message: "სტატუსის განახლება ვერ მოხერხდა" };
    }

    return { success: true, message: "მოთხოვნა ოპერატორზე გადაცემულია" };
  } catch (err) {
    console.error("requestHuman შეცდომა:", err);
    return { success: false, message: "დაფიქსირდა შეCentral შეცდომა" };
  }
}