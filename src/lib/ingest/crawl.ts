import { safeFetchHtml } from "./fetch";
import { extractPage, type ExtractedPage } from "./extract";

type CrawlOptions = {
  maxPages: number;
  /** Date.now()-ის შედარებადი დედლაინი (ms) — მის შემდეგ ახალ გვერდებს აღარ ვიღებთ */
  deadline: number;
  concurrency?: number;
};

function key(raw: string): string {
  const u = new URL(raw);
  u.hash = "";
  if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
    u.pathname = u.pathname.slice(0, -1);
  }
  return u.toString();
}

/**
 * იმავე დომენის მცირე BFS crawl. საწყისი გვერდის შეცდომა ვრცელდება გარეთ
 * (მომხმარებელმა უნდა იცოდეს, რომ URL არ მუშაობს); სხვა გვერდების შეცდომებს ვუშვებთ.
 */
export async function crawl(startUrl: string, opts: CrawlOptions): Promise<ExtractedPage[]> {
  const concurrency = opts.concurrency ?? 3;

  const { html, finalUrl } = await safeFetchHtml(startUrl); // აგდებს IngestError-ს
  const first = extractPage(html, finalUrl);

  const pages: ExtractedPage[] = [];
  const visited = new Set<string>([key(startUrl), key(finalUrl)]);
  const queue: string[] = [];

  const enqueue = (links: string[]) => {
    for (const link of links) {
      if (visited.size > 500) return; // ზედმეტად დიდი საიტის დაცვა
      const k = key(link);
      if (visited.has(k)) continue;
      visited.add(k);
      queue.push(link);
    }
  };

  if (first.sections.length) pages.push(first);
  enqueue(first.links);

  while (queue.length && pages.length < opts.maxPages && Date.now() < opts.deadline) {
    const batch = queue.splice(0, Math.min(concurrency, opts.maxPages - pages.length));

    const results = await Promise.allSettled(
      batch.map(async (u) => {
        const r = await safeFetchHtml(u);
        return extractPage(r.html, r.finalUrl);
      }),
    );

    for (const r of results) {
      if (r.status !== "fulfilled") continue;
      if (r.value.sections.length && pages.length < opts.maxPages) pages.push(r.value);
      enqueue(r.value.links);
    }
  }

  return pages;
}