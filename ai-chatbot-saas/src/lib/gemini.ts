import { GoogleGenAI } from "@google/genai";

/**
 * ჩატის მოდელი. ნაგულისხმევი: gemini-3.5-flash-lite (უფასო გეგმაზე ხელმისაწვდომი).
 * ქართულის უკეთესი ხარისხისთვის სცადე gemini-3.8-flash.
 * მოდელების სახელები იცვლება/უქმდება: https://ai.google.dev/gemini-api/docs/deprecations
 */
export const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL ?? "gemini-3.5-flash-lite";

/**
 * ემბედინგის მოდელი განზრახ მუდმივაა და არა env: მისი შეცვლა ყველა არსებული
 * chunk-ის ხელახლა დაემბედინგებას მოითხოვს (სხვადასხვა მოდელის ვექტორული სივრცე შეუთავსებელია).
 * განზომილება უნდა ემთხვეოდეს DB-ს: vector(1536).
 */
export const EMBEDDING_MODEL = "gemini-embedding-2";
export const EMBEDDING_DIMENSIONS = 1536;

let client: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

function statusOf(err: unknown): number | undefined {
  const status = (err as { status?: unknown } | null)?.status;
  return typeof status === "number" ? status : undefined;
}

/** 429: უფასო გეგმის წუთობრივი/დღიური ლიმიტი ამოიწურა. */
export function isQuotaError(err: unknown): boolean {
  return statusOf(err) === 429;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * ავტომატური retry exponential backoff-ით 429/5xx შეცდომებზე.
 * უფასო გეგმაზე 429 ხშირია, განსაკუთრებით ინგესტის ბაჩებზე.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  { retries = 4, baseMs = 1500 }: { retries?: number; baseMs?: number } = {},
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const status = statusOf(err);
      const retryable = status === 429 || (status !== undefined && status >= 500);
      if (!retryable || attempt >= retries) throw err;
      await sleep(baseMs * 2 ** attempt + Math.random() * 300);
    }
  }
}
export const ai = getGemini();