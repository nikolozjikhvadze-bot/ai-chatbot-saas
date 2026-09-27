import { NextRequest, NextResponse } from "next/server";
import { Type } from "@google/genai";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { CHAT_MODEL, getGemini, withRetry, isQuotaError } from "@/lib/gemini";
import { requirePaidDbUserId, createBotForProject, NotPaidError } from "@/lib/bots";
import { ingestUploadedFiles } from "@/lib/ingest/ingest-uploaded-files";
import { checkRateLimits, rateLimitResponse } from "@/lib/rate-limits";

export const runtime = "nodejs";
export const maxDuration = 300;
const MAX_UPLOAD_BYTES = 20_000_000;
const MAX_UPLOAD_FILES = 100;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "საჭიროა ავტორიზაცია." }, { status: 401 });
  }

  const rateLimit = await checkRateLimits([
    { policy: "aiAnalyzeHour", key: userId },
    { policy: "aiAnalyzeDay", key: userId },
  ]);
  if (!rateLimit.success) return rateLimitResponse(rateLimit.retryAfter);

  try {
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "ატვირთული ფაილები ძალიან დიდია." }, { status: 413 });
    }

    const formData = await req.formData();
    const fileEntries = formData.getAll("files");
    if (fileEntries.some((entry) => typeof entry === "string")) {
      return NextResponse.json({ error: "ფაილის ფორმატი არასწორია." }, { status: 400 });
    }
    const uploadedFiles = fileEntries as File[];
    const title = (formData.get("title") as string | null)?.trim() || "New Project";

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: "ფაილები ვერ მოიძებნა." },
        { status: 400 }
      );
    }
    if (
      uploadedFiles.length > MAX_UPLOAD_FILES ||
      uploadedFiles.reduce((total, file) => total + file.size, 0) > MAX_UPLOAD_BYTES
    ) {
      return NextResponse.json({ error: "ფაილების რაოდენობა ან ჯამური ზომა დასაშვებ ზღვარს აჭარბებს." }, { status: 413 });
    }

    // paywall-შემოწმება (aგდებს NotPaidError-ს, თუ გამოწერა არააქტიურია)
    // და ახალი ბოტის შექმნა ამ კონკრეტული პროექტისთვის — ბოტები აღარ
    // არის "ერთი მომხმარებელზე ერთი", თითოეულ პროექტს თავისი, ცალკე
    // ინგესტირებული ცოდნის ბაზა და ჩატბოტი სჭირდება.
    const dbUserId = await requirePaidDbUserId(userId);
    const botId = await createBotForProject(dbUserId, title);

    // საიტის კოდის/კონტენტის ჩაშენება RAG-ისთვის — ეს ავსებს documents
    // ცხრილს, რომ Relay-ის უკვე არსებულმა retrieveContext-მა შეძლოს ამ
    // ინფორმაციის საფუძველზე პასუხის გაცემა (არა მხოლოდ ფაილების სახელები).
    const { chunksIngested } = await ingestUploadedFiles(botId, uploadedFiles);

    // Relay-ის მისამართი აუცილებლად env-იდან, არასდროს hardcode-ული —
    // იმავე NEXT_PUBLIC_APP_URL-ით, რასაც checkout/route.ts იყენებს
    // success_url/cancel_url-ისთვის.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL არ არის დაყენებული — Relay URL ვერ აიგება.");
    }

    const fileList = uploadedFiles.map((file) => file.name).join("\n");

    const promptText = `შენ ხარ Senior Full-Stack Engineer და UI/UX დიზაინერი.
გააანალიზე მომხმარებლის პროექტის ფაილების სტრუქტურა, შექმენი AI Chatbot-ის ინტეგრაციისთვის საჭირო ფაილები და **თვითონ ჩასვი ჩათბოტი პროექტის მთავარ გვერდზე**.

აი მომხმარებლის პროექტის ფაილების სტრუქტურა:
${fileList}

კრიტიკულად მნიშვნელოვანია: პასუხი უნდა იყოს მხოლოდ და მხოლოდ ვალიდური JSON ობიექტი! 
არ გამოიყენო Markdown ტექსტი (\`\`\`json ... \`\`\`), არ დაწერო მოსალმება ან განმარტება JSON-ის გარეთ.

JSON სტრუქტურა ზუსტად ასეთი უნდა იყოს:
{
  "analysis": "მოკლე მიმოხილვა პროექტზე...",
  "terminalCommands": "ტერმინალის ბრძანებები...",
  "filesToCreate": [
    {
      "path": "ფაილის/გზა/filename.tsx",
      "content": "ფაილის სრული კოდი"
    }
  ]
}

მკაცრი მოთხოვნები:

1. **ავტომატური ინტეგრაცია და კოდის უცვლელობა:** 
   - მოძებნე პროექტის მთავარი ფაილი (მაგალითად: \`app/page.tsx\`, \`app/layout.tsx\`, \`pages/index.tsx\`, \`pages/index.js\` ან \`pages/_app.tsx\`).
   - დააიმპორტირე მასში \`Chatbot\` კომპონენტი და ჩასვი იგი \`return\`-ში კომპონენტების ბოლოს.
   - **არ შეცვალო, არ წაშალო და არ დაამატო არაფერი სხვა არსებულ კოდში!** შეინარჩუნე ფაილის ორიგინალური შინაარსი ზუსტად ისე, როგორც იყო, მხოლოდ \`import\` და \`<Chatbot />\` დაამატე.

2. **JSON ESCAPING & კოდის ფორმატირება (ძალიან მნიშვნელოვანი):**
   - \`content\` ველში კოდი აუცილებლად ჩამოშალე სტანდარტულად ახალ ხაზებზე (\`\\n\` სიმბოლოებით) და გამოიყენე დაშორებები (indentation). **არასოდეს ჩაწორო მთლიანი კოდი ერთ ჰორიზონტალურ ხაზზე!**
   - რადგან პასუხი JSON-ია, კოდის შიგნით არსებული ყველა ორმაგი ბრჭყალი (\`"\`) და ახალი ხაზი აუცილებლად დაა-escape-ე პროგრესულად (\`\\"\` და \`\\n\`), რომ \`JSON.parse()\`-მა შეცდომა არ ამოაგდოს.

3. **API Route:** შექმენი ჩათბოტის API ენდპოინტი შესაბამის არქიტექტურაში (\`app/api/chat/route.ts\` App Router-ისთვის ან \`pages/api/chat.ts\` Pages Router-ისთვის).

4. **დიზაინი და სტილები:** \`Chatbot.tsx\` (ან \`.jsx\`) კომპონენტი იყოს ორიგინალური, თანამედროვე (Glassmorphism / Gradients) და ანიმაციური (smooth scale/fade, მბრუნავი ღილაკი, typing-ინდიკატორი). გამოიყენე Inline Style-ები (CSS-in-JS), რომ დიზაინმა უნაკლოდ და გარანტირებულად იმუშაოს მაშინაც კი, თუ მომხმარებლის Tailwind კონფიგურაცია ხარვეზიანია.

5. **სრული კოდი:** \`content\` ველში აუცილებლად ჩაწერე ფაილების სრული, მზა და ფუნქციური კოდი! არ დატოვო ცარიელი ადგილები და არ გამოიყენო კომენტარები მაგალითად "// code here".

6. **ტერმინალის ბრძანებები:** \`terminalCommands\` ველში ჩაწერე ზუსტად ეს ტერმინალის ბრძანებები:
"npm install --save-dev @types/react @types/react-dom @types/node typescript
npm install"

მოგვეცი JSON ობიექტი, სადაც იქნება:
1. \`analysis\` ველში პროექტის მოკლე მიმოხილვა (სადაც ახსნი, თუ რომელი მთავარი ფაილი დაარედაქტირე და რა ფაილები დაამატე).
2. \`filesToCreate\` მასივში შექმნილი და განახლებული ფაილების სრული გზები (\`path\`) და სრული დაფორმატებული კოდი (\`content\`).
3. \`terminalCommands\` ველში ტერმინალში გასაშვები ბრძანებები, რომლებიც ცალკე კოდის ფანჯარად გამოჩნდება.

## დამატებითი, აუცილებელი მოთხოვნა — ჩათბოტის დიზაინის ზუსტი რეპლიკაცია

გენერირებული \`Chatbot\` კომპონენტის UI და ფუნქციონალი ზუსტად უნდა იმეორებდეს ქვემოთ აღწერილ მცურავ ჩათბოტს — არ შექმნა განსხვავებული დიზაინი ან ლოგიკა:

- **განლაგება:** ეკრანის ქვედა მარჯვენა კუთხეში დამაგრებული (\`position: fixed; bottom: 24px; right: 24px\`), წრიული 56×56px ღილაკი, რომელიც ხსნის/კეტავს ჩატის ფანჯარას (💬 დახურულ მდგომარეობაში, ✕ გახსნისას).
- **ჩატის ფანჯარა:** დაახლოებით 380×520px, მომრგვალებული კუთხეები (border-radius ~24px), ბნელი თემა (ფონი მუქი, თითქმის შავი-იისფერი — მაგ. \`#0d0c14\`), ბუნდოვანი შუშის ეფექტი (backdrop-blur), თხელი ნათელი საზღვარი (\`border: 1px solid rgba(255,255,255,0.1)\`).
- **ფერები:** მთავარი აქცენტი — იისფერიდან ვარდისფერისკენ გრადიენტი (violet → fuchsia, მაგ. \`#7c3aed\` → \`#c026d3\`), რომელიც გამოიყენება მომხმარებლის შეტყობინებების ბუშტებზე, გაგზავნის ღილაკსა და მთავარ float ღილაკზე.
- **State-ები:** კომპონენტს უნდა ჰქონდეს ზუსტად ეს state-ები — \`isOpen\` (ან \`isChatOpen\`) ჩატის გახსნა/დახურვისთვის, \`messages\` მასივი ტიპით \`{ role: 'user' | 'assistant', content: string }[]\`, საწყისი მისალმების შეტყობინებით ასისტენტისგან, \`inputMessage\` string state ტექსტბოქსისთვის და \`isLoading\` (ან \`isChatLoading\`) ბულეანი.
- **Loading ინდიკატორი:** პასუხის მოლოდინში გამოჩნდეს პულსირებადი ტექსტი (მაგ. "იწერს..." ან "ასისტენტი აბრუნებს პასუხს..."), ასისტენტის შეტყობინების ბუშტის ადგილას.
- **ავტომატური სქროლი:** ახალი შეტყობინების დამატებისას ჩატის ფანჯარა ავტომატურად სქროლავდეს ბოლომდე (\`scrollIntoView({ behavior: 'smooth' })\` ან ექვივალენტი).
- **API გამოძახება:** ფორმის გაგზავნისას გამოიძახოს \`fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, history }) })\` — **ეს მისამართი ზუსტად უნდა ემთხვეოდეს იმ API Route-ის URL-ს, რომელსაც ამავე მოთხოვნის მე-3 პუნქტში ქმნი** (\`app/api/chat/route.ts\` → URL \`/api/chat\`, ან \`pages/api/chat.ts\` → იგივე URL). სადაც \`history\` არის მთელი \`messages\` მასივი (მათ შორის ახლახან დამატებული user შეტყობინება). პასუხი მოსალოდნელია \`{ success: boolean, reply?: string, error?: string }\` ფორმატში — \`reply\` ველი გამოჩნდეს როგორც ასისტენტის ახალი შეტყობინება.
- **სტილიზაცია:** გამოიყენე inline style ობიექტები (ან Tailwind კლასები, თუ პროექტში Tailwind უკვე დადასტურებულადაა კონფიგურირებული) ზუსტად ზემოთ აღწერილი ვიზუალის მისაღწევად — არ გამოიგონო ალტერნატიული ფერები, ზომები ან განლაგება.

## დამატებითი მოთხოვნა — Relay Endpoint-ის გამოყენება და მთავარი ფაილის დაცვა

1. **Relay Endpoint-ისადმი მიმართვა, არა Gemini API პირდაპირ:** გენერირებულმა API route-მა (\`app/api/chat/route.ts\` App Router-ისთვის ან \`pages/api/chat.js\` Pages Router-ისთვის) **არავითარ შემთხვევაში არ უნდა შეიცავდეს Gemini API-ის URL-ს, API Key-ს, ან \`fetch\`-ს \`generativelanguage.googleapis.com\`-ისკენ.** მის მაგივრად, route-მა უნდა გადააგზავნოს (proxy/relay) მომხმარებლის შეტყობინება ცენტრალურ Relay Endpoint-ზე, რომელიც ჩვენს სერვერზეა განთავსებული და უკვე მართავს Gemini-სთან კომუნიკაციას, API Key-ის დაცვას და გამოწერის სტატუსის შემოწმებას.

   გამოიძახე ზუსტად ასე (მოდელის, API key-ის ან Gemini-ის URL-ის ხსენების გარეშე):
   \`\`\`
   const RELAY_URL = "${appUrl}/api/relay/${botId}";

   const response = await fetch(RELAY_URL, {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ message, history }),
   });
   const data = await response.json();
   const reply = data.reply;
   \`\`\`
   (URL-ში უკვე ჩასმულია ჩვენი რეალური production დომენი — ეს არის ერთადერთი გარე endpoint, რომელსაც გენერირებული ჩატბოტი უნდა მიმართავდეს.)

   \`${botId}\` მნიშვნელობა უკვე კონკრეტული, ნამდვილი UUID-ია (არა placeholder) — ის ზუსტად ასეთი, უცვლელი სტრიქონის სახით უნდა ჩაიწეროს გენერირებულ კოდში.

   route-მა ასევე უნდა დაამუშაოს შეცდომების შემთხვევა (Relay-მ არასწორი სტატუსი დააბრუნა, ან ქსელური შეცდომა მოხდა) ისე, რომ ყოველთვის ვალიდური JSON დააბრუნოს ფორმატში \`{ success: boolean, reply?: string, error?: string }\`, არასდროს HTML ან გამოუმუშავებელი გამონაკლისი.

2. **მთავარი ფაილის სრული ხელუხლებლობა:** როცა \`filesToCreate\`-ში მთავარ ფაილს (\`index.js\`, \`index.tsx\`, \`app/page.tsx\`, \`pages/index.tsx\` და მისთანები) ამატებ, მისი \`content\` აუცილებლად უნდა შეიცავდეს ორიგინალის **ყველა** არსებულ სტრიქონს ზუსტად უცვლელად — არც ერთი კომპონენტი, ტექსტი, სტილი თუ ლოგიკის ნაწილი არ უნდა წაიშალოს, შეიცვალოს ან გადაეწეროს. ერთადერთი დასაშვები ცვლილება ორია: (ა) ერთი import-ის ხაზის დამატება ჩათბოტის კომპონენტისთვის (მაგ. \`import Chatbot from "../components/Chatbot";\` ან შესაბამისი ფარდობითი გზა), და (ბ) \`<Chatbot />\` კომპონენტის ჩამატება დაბრუნებული JSX-ის ყველაზე ბოლოში, არსებული ძირეული ტეგის დახურვის ჩანართის წინ (მაგალითად \`</main>\` ან საბოლოო \`</div>\`-ის წინ). თუ დარწმუნებული არ ხარ ზუსტად სად ჩასვა, გამოაქვეყნე მთავარი ფაილის სრული, უცვლელი შინაარსი და მხოლოდ ბოლოში დაამატე ეს ორი ცვლილება — არასდროს გადაწერო, შეამოკლო ან "გაასუფთავო" დანარჩენი ფაილი.`;

    const ai = getGemini();

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: CHAT_MODEL,
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: {
                type: Type.STRING,
                description: "პროექტის მოკლე ანალიზი და ჩატბოტის ინტეგრაციის აღწერა.",
              },
              filesToCreate: {
                type: Type.ARRAY,
                description: "ჩატბოტისთვის საჭირო ფაილების სია შიგთავსთან ერთად",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    path: {
                      type: Type.STRING,
                      description: "ფაილის გზა პროექტში (მაგ: components/Chatbot.tsx ან app/api/chat/route.ts)",
                    },
                    content: {
                      type: Type.STRING,
                      description: "ფაილის სრული მზა კოდი",
                    },
                  },
                  required: ["path", "content"],
                },
              },
            },
            required: ["analysis", "filesToCreate"],
          },
        },
      })
    );

    if (!response.text) {
      return NextResponse.json(
        { error: "Gemini-სგან ცარიელი პასუხი მოვიდა." },
        { status: 500 }
      );
    }

    const parsedData = JSON.parse(response.text);

    // ამ ატვირთვის პროექტად შენახვა Dashboard-ის სიისთვის.
    const { data: project, error: projectError } = await supabaseAdmin
      .from("projects")
      .insert({
        user_id: userId,
        bot_id: botId,
        title,
        ai_review: parsedData.analysis,
        generated_code: parsedData.filesToCreate || [],
      })
      .select("id")
      .single();

    if (projectError || !project) {
      throw new Error(`projects insert failed: ${projectError?.message}`);
    }

    return NextResponse.json({
      success: true,
      projectId: project.id,
      analysis: parsedData.analysis,
      filesToCreate: parsedData.filesToCreate || [],
    });

  } catch (error: any) {
    if (error instanceof NotPaidError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[analyze] Gemini Error:", error);
    const message = isQuotaError(error)
      ? "Gemini API-ს უფასო ლიმიტი ამოიწურა. სცადეთ რამდენიმე წუთში."
      : `სერვერის შეცდომა: ${error.message}`;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}