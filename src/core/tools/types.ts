import type { SupabaseClient } from "@supabase/supabase-js";

export interface ToolContext {
  botId: string;
  conversationId: string;
  supabase: SupabaseClient;
}

export interface ToolResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}