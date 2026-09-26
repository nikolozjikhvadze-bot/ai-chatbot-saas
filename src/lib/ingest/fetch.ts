import { assertPublicUrl } from "./ssrf";
import { IngestError } from "./errors";

const MAX_BYTES = 2_000_000; // 2MB HTML-ზე მეტს არ ვკითხულობთ
const MAX_REDIRECTS = 5;
const TIMEOUT_MS = 10_000;

const USER_AGENT =
  process.env.CRAWLER_USER_AGENT ?? "ChatbotPlatformCrawler/1.0";

async function readLimited(res: Response, maxBytes: number, charset: string): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const parts: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel(); // ზედმეტს აღარ ვჩამოტვირთავთ
      break;
    }
    parts.push(value);
  }

  const buf = Buffer.concat(parts);
  try {
    return new TextDecoder(charset).decode(buf);
  } catch {
    return new TextDecoder("utf-8").decode(buf);
  }
}

/**
 * იღებს HTML-ს. ყოველ redirect-ს ხელით ვასრულებთ და თითოეულ ჰოპზე
 * ვამოწმებთ, რომ მისამართი საჯაროა (redirect-ით SSRF-ის შეზღუდვა).
 */
export async function safeFetchHtml(
  startUrl: string,
): Promise<{ html: string; finalUrl: string }> {
  let current = startUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicUrl(current);

    let res: Response;
    try {
      res = await fetch(current, {
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          "user-agent": USER_AGENT,
          accept: "text/html,application/xhtml+xml",
          "accept-language": "ka,en;q=0.8",
        },
      });
    } catch {
      throw new IngestError(`გვერდი ვერ ჩაიტვირთა: ${current}`);
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      await res.body?.cancel();
      if (!location) throw new IngestError("Redirect უმისამართოდ");
      current = new URL(location, current).toString();
      continue;
    }

    if (!res.ok) {
      await res.body?.cancel();
      throw new IngestError(`საიტმა დააბრუნა HTTP ${res.status}: ${current}`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
      await res.body?.cancel();
      throw new IngestError(`მხარდაუჭერელი ტიპი (${contentType || "უცნობი"}): ${current}`);
    }

    const charset = contentType.match(/charset=([^;]+)/i)?.[1]?.trim() ?? "utf-8";
    const html = await readLimited(res, MAX_BYTES, charset);
    return { html, finalUrl: current };
  }

  throw new IngestError("ძალიან ბევრი redirect");
}