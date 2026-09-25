import * as cheerio from "cheerio";

export type Section = {
  /** სათაურების ჯაჭვი, მაგ. ["ფასები", "პრემიუმ გეგმა"] */
  headings: string[];
  paragraphs: string[];
};

export type ExtractedPage = {
  url: string;
  title: string;
  sections: Section[];
  /** იმავე დომენის ბმულები (crawl-ისთვის) */
  links: string[];
};

const SKIP_EXT =
  /\.(pdf|jpe?g|png|gif|webp|svg|ico|zip|rar|7z|mp[34]|avi|mov|docx?|xlsx?|pptx?|css|js|xml|json|txt)$/i;

// მნიშვნელოვანი: <form> და <header> არ ვშლით — ზოგ საიტზე მთელი კონტენტი მათშია.
const NOISE = [
  "script", "style", "noscript", "template", "svg", "canvas", "iframe",
  "nav", "footer", "aside", "input", "select", "textarea", "button",
  '[role="navigation"]', '[role="contentinfo"]', '[aria-hidden="true"]', "[hidden]",
  "#cookie-banner", "#cookie-notice", ".cookie-banner", ".cookie-notice",
  ".cc-window", "#onetrust-consent-sdk", "#CybotCookiebotDialog",
].join(",");

const BLOCK =
  "h1,h2,h3,h4,h5,h6,p,li,pre,blockquote,dt,dd,figcaption,tr,div,section,article";

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

export function extractPage(html: string, pageUrl: string): ExtractedPage {
  const $ = cheerio.load(html);
  const base = new URL(pageUrl);

  // 1) სათაური და ბმულები — DOM-ის გასუფთავებამდე
  const title =
    clean($("title").first().text()) ||
    clean($('meta[property="og:title"]').attr("content") ?? "") ||
    clean($("h1").first().text()) ||
    base.hostname;

  const links = new Set<string>();
  $("a[href]").each((_, a) => {
    const href = $(a).attr("href");
    if (!href || /^(mailto:|tel:|javascript:|#)/i.test(href)) return;
    try {
      const u = new URL(href, base);
      if (u.protocol !== "http:" && u.protocol !== "https:") return;
      if (u.host !== base.host) return;
      if (SKIP_EXT.test(u.pathname)) return;
      u.hash = "";
      links.add(u.toString());
    } catch {
      /* არასწორი href — გამოტოვე */
    }
  });

  // 2) ხმაურის მოშორება
  $(NOISE).remove();

  // 3) მთავარი კონტენტის არჩევა (root-ს ეძლევა any ტიპი TypeScript ერორის ასაცილებლად)
  let root: any = $("body");
  const candidates: [string, boolean][] = [
    ["main", true],
    ['[role="main"]', true],
    ["article", $("article").length === 1],
  ];
  for (const [selector, allowed] of candidates) {
    if (!allowed) continue;
    const el = $(selector).first();
    if (el.length && clean(el.text()).length >= 200) {
      root = el;
      break;
    }
  }

  // 4) დოკუმენტის თანმიმდევრობით გავლა: სათაურები ქმნიან სექციებს
  const sections: Section[] = [];
  let current: Section = { headings: [], paragraphs: [] };
  sections.push(current);
  const stack: { level: number; text: string }[] = [];
  const seenShort = new Set<string>();

  const addParagraph = (raw: string) => {
    const text = clean(raw);
    if (text.length < 2) return;
    if (text.length < 120) {
      if (seenShort.has(text)) return;
      seenShort.add(text);
    }
    current.paragraphs.push(text);
  };

  root.find(BLOCK).each((_: number, el: any) => {
    const $el = $(el);
    const tag = (el.tagName || el.name || $el.prop("tagName") || "").toLowerCase();

    if (tag !== "tr" && $el.closest("tr").length) return;

    if (/^h[1-6]$/.test(tag)) {
      const text = clean($el.text());
      if (!text) return;
      const level = Number(tag[1]);
      while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
      stack.push({ level, text });
      current = { headings: stack.map((s) => s.text), paragraphs: [] };
      sections.push(current);
      return;
    }

    if (tag === "tr") {
      const cells = $el
        .children("td,th")
        .map((_: number, c: any) => clean($(c).text()))
        .get()
        .filter(Boolean);
      if (cells.length) addParagraph(cells.join(" | "));
      return;
    }

    const hasBlockChild = $el.find(BLOCK).length > 0;
    if (hasBlockChild) {
      const own = $el
        .contents()
        .filter((_: number, n: any) => n.type === "text")
        .map((_: number, n: any) => $(n).text())
        .get()
        .join(" ");
      addParagraph(own);
    } else {
      addParagraph($el.text());
    }
  });

  return {
    url: pageUrl,
    title,
    sections: sections.filter((s) => s.paragraphs.length > 0),
    links: [...links],
  };
}