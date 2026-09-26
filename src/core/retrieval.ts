import type { SupabaseClient } from "@supabase/supabase-js";
import { embedQuery } from "@/lib/ingest/embed";

export type RetrievedChunk = {
  id: string;
  source_id: string;
  content: string;
  metadata: {
    source_url?: string;
    title?: string;
    heading_path?: string[];
  };
  /** cosine similarity (0..1) — შესაბამისობის ბარიერისთვის */
  similarity: number;
  /** RRF score — დალაგებისთვის */
  score: number;
};

/**
 * ამ მნიშვნელობის ქვემოთ chunk "შესაბამისად" არ ითვლება.
 */
export const MIN_SIMILARITY = Number(process.env.RAG_MIN_SIMILARITY ?? 0.5);

export async function retrieve(
  sb: SupabaseClient,
  botId: string,
  query: string,
  matchCount = 8,
): Promise<{ chunks: RetrievedChunk[]; embedding: number[]; topSimilarity: number }> {
  const embedding = await embedQuery(query);

  const { data, error } = await sb.rpc("hybrid_search", {
    p_bot_id: botId,
    query_text: query,
    query_embedding: embedding,
    match_count: matchCount,
  });
  if (error) throw new Error(`hybrid_search failed: ${error.message}`);

  const chunks = (data ?? []) as RetrievedChunk[];
  const topSimilarity = chunks.reduce((max, c) => Math.max(max, c.similarity ?? 0), 0);
  return { chunks, embedding, topSimilarity };
}

/**
 * მარტივი დამხმარე ფუნქცია (Wrapper), რომელსაც API route იძახებს
 */
export async function retrieveContext(
  query: string,
  options: { botId: string },
  sb?: SupabaseClient
): Promise<RetrievedChunk[]> {
  if (!sb) return [];
  const { chunks } = await retrieve(sb, options.botId, query);
  return chunks.filter((c) => c.similarity >= MIN_SIMILARITY);
}

/**
 * ნაპოვნი კონტექსტის ტექსტად ფორმატირება AI პრომპტისთვის
 */
export function formatContextForPrompt(chunks: RetrievedChunk[]): string {
  if (!chunks || chunks.length === 0) return "";
  return chunks
    .map((chunk, i) => `[წყარო ${i + 1}]:\n${chunk.content}`)
    .join("\n\n");
}