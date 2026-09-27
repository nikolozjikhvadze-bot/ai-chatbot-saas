/**
 * მარტივი, სიმბოლო-დაფუძნებული chunker ბრტყელი ტექსტის/კოდის ფაილებისთვის
 * (განსხვავებით ingest/chunk.ts-ის chunkPage-ისგან, რომელიც ვებ-გვერდის
 * სტრუქტურირებულ sections-ებზეა აგებული).
 */
const CHUNK_SIZE = 1500; // სიმბოლო
const CHUNK_OVERLAP = 200;

export function chunkText(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= CHUNK_SIZE) return [trimmed];

  const chunks: string[] = [];
  let start = 0;
  while (start < trimmed.length) {
    const end = Math.min(start + CHUNK_SIZE, trimmed.length);
    chunks.push(trimmed.slice(start, end));
    if (end === trimmed.length) break;
    start = end - CHUNK_OVERLAP;
  }
  return chunks;
}

/** მხოლოდ ტექსტური/კოდის გაფართოებები — ბინარულის embed-ვის აზრი არ აქვს. */
const TEXT_EXTENSIONS = new Set([
  "ts", "tsx", "js", "jsx", "mjs", "cjs",
  "md", "mdx", "txt", "json", "css", "scss",
  "html", "yml", "yaml",
]);

const MAX_FILE_BYTES = 200_000; // ~200KB — უფრო დიდი ფაილები (lock ფაილები და ა.შ.) გამოვტოვოთ

export function isEmbeddableFile(filename: string, size: number): boolean {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return TEXT_EXTENSIONS.has(ext) && size > 0 && size <= MAX_FILE_BYTES;
}