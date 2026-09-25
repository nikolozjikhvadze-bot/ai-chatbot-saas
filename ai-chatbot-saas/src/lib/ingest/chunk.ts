import { getEncoding } from "js-tiktoken";
import type { ExtractedPage } from "./extract";

// text-embedding-3-* იყენებს cl100k_base ტოკენიზატორს.
// ქართული ტექსტი ინგლისურზე გაცილებით მეტ ტოკენს იკავებს (~3–4x სიმბოლოზე),
// ამიტომ ~500 ტოკენი ქართულად მხოლოდ ერთი-ორი აბზაცია — ეს ნორმალურია.
const enc = getEncoding("cl100k_base");
export const countTokens = (text: string): number => enc.encode(text).length;

export type Chunk = {
  content: string;
  tokenCount: number;
  metadata: {
    source_url: string;
    title: string;
    heading_path: string[];
  };
};

type Unit = { text: string; tokens: number };

export type ChunkOptions = {
  /** სამიზნე ზომა ტოკენებში (prefix-ის გარეშე) */
  targetTokens?: number;
  /** ზომით გაჭრისას წინა chunk-იდან გადმოტანილი ტოკენები */
  overlapTokens?: number;
  /** ამაზე პატარა chunk-ს შემდეგ სექციასთან ვაერთიანებთ */
  minTokens?: number;
};

/** ზედმეტად გრძელი ერთეულის დაყოფა სიტყვებით (იშვიათი fallback). */
function splitByWords(text: string, target: number): Unit[] {
  const out: Unit[] = [];
  let buf: string[] = [];
  let bufTokens = 0;
  for (const word of text.split(" ")) {
    const wt = countTokens(word) + 1;
    if (bufTokens + wt > target && buf.length) {
      out.push({ text: buf.join(" "), tokens: bufTokens });
      buf = [];
      bufTokens = 0;
    }
    buf.push(word);
    bufTokens += wt;
  }
  if (buf.length) out.push({ text: buf.join(" "), tokens: bufTokens });
  return out;
}

/** აბზაცი → ერთეულ(ებ)ი, თითოეული target-ზე მეტი არ არის (თუ შესაძლებელია). */
function splitToFit(text: string, target: number): Unit[] {
  const tokens = countTokens(text);
  if (tokens <= target) return [{ text, tokens }];

  const out: Unit[] = [];
  for (const sentence of text.split(/(?<=[.!?…])\s+/)) {
    const st = countTokens(sentence);
    if (st <= target) out.push({ text: sentence, tokens: st });
    else out.push(...splitByWords(sentence, target));
  }
  return out;
}

export function chunkPage(page: ExtractedPage, options: ChunkOptions = {}): Chunk[] {
  const { targetTokens = 500, overlapTokens = 60, minTokens = 120 } = options;

  const chunks: Chunk[] = [];
  let units: Unit[] = [];
  let tokens = 0;
  let fresh = false; // შეიცავს თუ არა ახალ (არა-overlap) კონტენტს
  let startPath: string[] = [];

  const flush = (keepOverlap: boolean) => {
    if (fresh && units.length) {
      const body = units.map((u) => u.text).join("\n");
      const prefix = [page.title, startPath.join(" › ")].filter(Boolean).join("\n");
      const content = prefix ? `${prefix}\n\n${body}` : body;
      chunks.push({
        content,
        tokenCount: countTokens(content),
        metadata: {
          source_url: page.url,
          title: page.title,
          heading_path: startPath,
        },
      });
    }

    const tail: Unit[] = [];
    let tailTokens = 0;
    if (fresh && keepOverlap) {
      for (let i = units.length - 1; i >= 0; i--) {
        if (tailTokens + units[i].tokens > overlapTokens) break;
        tail.unshift(units[i]);
        tailTokens += units[i].tokens;
      }
    }
    units = tail;
    tokens = tailTokens;
    fresh = false;
  };

  const push = (unit: Unit, path: string[]) => {
    if (fresh && tokens + unit.tokens > targetTokens) flush(true);
    if (!fresh) startPath = path;
    units.push(unit);
    tokens += unit.tokens;
    fresh = true;
  };

  for (const section of page.sections) {
    // სექციის საზღვარი: საკმარისად დიდ chunk-ს ვხურავთ overlap-ის გარეშე
    if (fresh && tokens >= minTokens) flush(false);

    if (!fresh) {
      // წინა სექციის overlap ახალ თემაში არ გადავიტანოთ
      units = [];
      tokens = 0;
    } else {
      // პატარა სექცია ერწყმის წინას; სათაურს ტექსტში ვტოვებთ კონტექსტისთვის
      const heading = section.headings.at(-1);
      if (heading) push({ text: heading, tokens: countTokens(heading) }, section.headings);
    }

    for (const paragraph of section.paragraphs) {
      for (const unit of splitToFit(paragraph, targetTokens)) {
        push(unit, section.headings);
      }
    }
  }
  flush(false);

  return chunks;
}