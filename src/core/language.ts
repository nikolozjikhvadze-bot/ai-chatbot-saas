export type Lang = "ka" | "en" | "ru" | "und";

/**
 * მსუბუქი ენის აღმოჩენა დამწერლობით (LLM-ის გარეშე, ნულოვანი ხარჯი).
 * მას ვიყენებთ ანალიტიკისთვის (conversations.detected_language) და prompt-ის მინიშნებისთვის.
 * თავად პასუხის ენას მოდელი განსაზღვრავს მომხმარებლის შეტყობინებიდან.
 */
export function detectLanguage(text: string): Lang {
  let ka = 0;
  let latin = 0;
  let cyrillic = 0;

  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    if (
      (c >= 0x10a0 && c <= 0x10ff) || // ქართული (Asomtavruli + Mkhedruli)
      (c >= 0x1c90 && c <= 0x1cbf) // ქართული Mtavruli
    ) {
      ka++;
    } else if ((c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a)) {
      latin++;
    } else if (c >= 0x400 && c <= 0x4ff) {
      cyrillic++;
    }
  }

  if (ka + latin + cyrillic === 0) return "und";
  // ქართული ტექსტი ხშირად შეიცავს ლათინურ ბრენდებს — ტოლობისას ქართულს ვანიჭებთ უპირატესობას
  if (ka >= latin && ka >= cyrillic) return "ka";
  if (cyrillic > latin) return "ru";
  return "en";
}

export const LANGUAGE_NAMES: Record<Lang, string> = {
  ka: "Georgian",
  en: "English",
  ru: "Russian",
  und: "the same language as the user's latest message",
};