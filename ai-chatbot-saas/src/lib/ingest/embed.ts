import {
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL,
  getGemini,
  withRetry,
} from "@/lib/gemini";

/**
 * Gemini Embedding 2 (გამოსავალი: 1536 განზომილება, DB: vector(1536)).
 *
 * gemini-embedding-2-ში task_type პარამეტრი არ არის: დავალება პრომპტის პრეფიქსით
 * მიეთითება, ამიტომ დოკუმენტებსა და მოთხოვნებს სხვადასხვა ფორმატი აქვთ (asymmetric retrieval).
 * ფორმატი უნდა იყოს თანმიმდევრული: ინდექსაციისას და ძიებისას ერთი და იგივე.
 */
const BATCH_SIZE = 16;

export type EmbedDoc = { title?: string; text: string };

export const formatDocument = ({ title, text }: EmbedDoc): string =>
  `title: ${title?.trim() || "none"} | text: ${text}`;

export const formatQuery = (query: string): string =>
  `task: question answering | query: ${query}`;

async function embedContents(texts: string[]): Promise<number[][]> {
  const ai = getGemini();
  const out: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    // ყოველი ტექსტი ცალკე Content ობიექტშია: სხვაგვარად gemini-embedding-2
    // ყველა მათგანს ერთ აგრეგირებულ ვექტორად აქცევს.
    const res = await withRetry(() =>
      ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: batch.map((text) => ({ parts: [{ text }] })),
        config: { outputDimensionality: EMBEDDING_DIMENSIONS },
      }),
    );

    const vectors = (res.embeddings ?? []).map((e) => e.values ?? []);
    if (
      vectors.length !== batch.length ||
      vectors.some((v) => v.length !== EMBEDDING_DIMENSIONS)
    ) {
      throw new Error(
        `Unexpected embedding response: got ${vectors.length} vectors for ${batch.length} inputs`,
      );
    }
    out.push(...vectors);
  }

  return out;
}

/** chunk-ების ინდექსაციისთვის. აბრუნებს ვექტორებს იმავე თანმიმდევრობით. */
export function embedDocuments(docs: EmbedDoc[]): Promise<number[][]> {
  return embedContents(docs.map(formatDocument));
}

/** მომხმარებლის კითხვის ემბედინგი ძიებისთვის. */
export async function embedQuery(query: string): Promise<number[]> {
  const [vector] = await embedContents([formatQuery(query)]);
  return vector;
}