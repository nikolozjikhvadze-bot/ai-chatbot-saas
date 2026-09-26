import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

// ---------------------------------------------------------------------------
// Gemini კლიენტი — lazy singleton, შექმნილია მხოლოდ request-ის დამუშავებისას.
// ---------------------------------------------------------------------------

let cachedClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY გარემოს ცვლადი სერვერზე არ არის განსაზღვრული.');
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey });
  }
  return cachedClient;
}

// ---------------------------------------------------------------------------
// მოთხოვნის ვალიდაცია
// ---------------------------------------------------------------------------

type ChatRole = 'user' | 'assistant';
type IncomingMessage = { role: ChatRole; content: string };

function isValidMessage(value: unknown): value is IncomingMessage {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (v.role === 'user' || v.role === 'assistant') &&
    typeof v.content === 'string' &&
    v.content.trim().length > 0
  );
}

const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_MESSAGES = 20;

// ---------------------------------------------------------------------------
// POST /api/ai/chat
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'არ ხართ ავტორიზებული' }, { status: 401 });
    }

    let body: { message?: unknown; history?: unknown; projectContext?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'მოთხოვნის ტანი არ არის სწორი JSON.' }, { status: 400 });
    }

    const currentMessage = typeof body.message === 'string' ? body.message.trim() : '';
    if (!currentMessage) {
      return NextResponse.json({ success: false, error: 'შეტყობინება ცარიელია' }, { status: 400 });
    }
    if (currentMessage.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ success: false, error: 'შეტყობინება ძალიან გრძელია.' }, { status: 400 });
    }

    const rawHistory = Array.isArray(body.history) ? body.history : [];
    const validHistory = rawHistory.filter(isValidMessage).slice(-MAX_HISTORY_MESSAGES);
    const projectContext = typeof body.projectContext === 'string' ? body.projectContext : '';

    const historyForModel = [...validHistory];
    while (historyForModel[0]?.role === 'assistant') historyForModel.shift();

    const conversation =
      historyForModel.length > 0 ? historyForModel : [{ role: 'user' as const, content: currentMessage }];

    const formattedMessages = conversation.map((msg) => ({
      role: msg.role === 'user' ? ('user' as const) : ('model' as const),
      parts: [{ text: msg.content }],
    }));

    // ---------------------------------------------------------------------------
    // YourBot-ის სრული კონტექსტი და ინსტრუქცია AI ასისტენტისთვის
    // ---------------------------------------------------------------------------
    const systemInstruction = `
შენ ხარ "YourBot" პლატფორმის ოფიციალური AI ასისტენტი.
შენი მიზანია დაეხმარო მომხმარებლებს (დეველოპერებსა და ბიზნესებს) თავიანთ ვებსაიტებზე AI ჩათბოტის მარტივად და ავტომატურად ინტეგრირებაში.

YourBot პლატფორმის შესახებ:
1. რა არის YourBot?
   - YourBot არის AI ავტომატიზაციის პლატფორმა დეველოპერებისთვის.
   - მომხმარებელს საშუალებას აძლევს ატვირთოს თავისი პროექტის საქაღალდე (ფოლდერი).
   - AI ავტომატურად აანალიზებს ატვირთულ კოდს და ამზადებს ჩათბოტის ინტეგრაციისთვის საჭირო ფაილებსა და კოდს.

2. მთავარი ფუნქციონალი:
   - "პროექტის ატვირთვა & AI ავტომატიზაცია": მომხმარებელი ირჩევს თავისი პროექტის ფოლდერს.
   - კოდის ავტომატური ანალიზი: AI სწავლობს პროექტის სტრუქტურას, ფაილებსა და შინაარსს.
   - ჩათბოტის ფაილების გენერაცია: AI აგენერირებს გამზადებულ ჩათბოტის ფაილებს, რომლებსაც მომხმარებელი ჩასვამს თავის პროექტში.

3. კომუნიკაციის წესები:
   - უპასუხე ყოველთვის გამართული, პროფესიონალური და მეგობრული ქართულით.
   - თუ მომხმარებელი გკითხავს "ეს საიტი რას აკეთებს?" ან მსგავს კითხვას, დეტალურად აუხსენი YourBot-ის შესაძლებლობები.

დამატებითი დინამიური კონტექსტი მომხმარებლის მიმდინარე პროექტიდან:
${projectContext || 'დამატებითი პროექტის კონტექსტი მითითებული არ არის.'}
`;

    const ai = getGeminiClient();
    const model = process.env.GEMINI_CHAT_MODEL || 'gemini-flash-latest';

    const response = await ai.models.generateContent({
      model,
      contents: formattedMessages,
      config: { systemInstruction },
    });

    const reply = response.text;
    if (!reply) {
      return NextResponse.json(
        { success: false, error: 'მოდელმა ტექსტური პასუხი ვერ დააგენერირა. სცადეთ კითხვის სხვაგვარად ჩამოყალიბება.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error('Chat API Error:', error);
    const message = error instanceof Error ? error.message : 'სერვერზე მოხდა შეცდომა.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}