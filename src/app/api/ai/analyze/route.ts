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
      return NextResponse.json({ error: "მონაცემები ძალიან დიდია." }, { status: 413 });
    }

    const formData = await req.formData();
    const title = (formData.get("title") as string | null)?.trim() || "New Project";
    const websiteUrl = (formData.get("websiteUrl") as string | null)?.trim();
    const businessType = (formData.get("businessType") as string | null) || "general";
    
    const fileEntries = formData.getAll("files");
    const uploadedFiles = fileEntries.filter((entry) => typeof entry !== "string") as File[];

    // უნდა არსებობდეს ან URL ან ფაილები
    if (!websiteUrl && uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: "გთხოვთ მიუთითოთ ვებსაიტის ბმული ან ატვირთოთ ფაილები." },
        { status: 400 }
      );
    }

    const dbUserId = await requirePaidDbUserId(userId);
    const botId = await createBotForProject(dbUserId, title);

    let sourceInfo = "";

    // თუ მითითებულია ვებსაიტის URL
    if (websiteUrl) {
      try {
        const siteRes = await fetch(websiteUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        const htmlText = await siteRes.text();
        // ამოვჭრათ ტექსტი მარტივად ან მივაწოდოთ AI-ს
        sourceInfo = `ვებსაიტის ბმული: ${websiteUrl}\nსაიტის HTML/კონტენტი (ნაწილი): ${htmlText.slice(0, 15000)}`;
      } catch (e) {
        sourceInfo = `ვებსაიტის ბმული: ${websiteUrl} (ვერ მოხერხდა საიტის პირდაპირი წაკითხვა, გამოიყენე ზოგადი ცოდნა ამ ბიზნესზე).`;
      }
    } else if (uploadedFiles.length > 0) {
      if (
        uploadedFiles.length > MAX_UPLOAD_FILES ||
        uploadedFiles.reduce((total, file) => total + file.size, 0) > MAX_UPLOAD_BYTES
      ) {
        return NextResponse.json({ error: "ფაილების რაოდენობა ან ჯამური ზომა დასაშვებ ზღვარს აჭარბებს." }, { status: 413 });
      }
      const { chunksIngested } = await ingestUploadedFiles(botId, uploadedFiles);
      sourceInfo = uploadedFiles.map((file) => file.name).join("\n");
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL არ არის დაყენებული.");
    }

    const promptText = `შენ ხარ Senior Full-Stack Engineer და AI პროდუქტების არქიტექტორი.
შექმენი პროფესიონალური AI Chatbot ინტეგრაცია ბიზნესისთვის (${businessType}).

მონაცემთა წყარო / საიტი / ფაილები:
${sourceInfo}

პასუხი უნდა იყოს მხოლოდ და მხოლოდ ვალიდური JSON ობიექტი! 
არ გამოიყენო Markdown ტექსტი (\`\`\`json ... \`\`\`), არ დაწერო მოსალმება ან განმარტება JSON-ის გარეთ.

JSON სტრუქტურა ზუსტად ასეთი უნდა იყოს:
{
  "analysis": "მოკლე მიმოხილვა ბოტზე და ინტეგრაციაზე...",
  "terminalCommands": "npm install",
  "filesToCreate": [
    {
      "path": "components/Chatbot.tsx",
      "content": "ფაილის სრული კოდი"
    },
    {
      "path": "app/api/chat/route.ts",
      "content": "API როუტის სრული კოდი"
    }
  ]
}

მკაცრი მოთხოვნები:
1. შექმენი \`Chatbot.tsx\` კომპონენტი (მცურავი ჩათბოტი ქვედა მარჯვენა კუთხეში, გრადიენტებით, ბნელი თემით).
2. \`Chatbot.tsx\` კომპონენტის ვიჯეტის ბოლოში (input ველის ქვეშ, დისქლაიმერის ქვემოთ) აუცილებლად ჩაამატე ბრენდინგის ლინკი:
   <div style="text-align: center; padding: 4px 0; border-top: 1px solid rgba(255,255,255,0.05); font-family: sans-serif;">
     <a href="https://yourbot.site" target="_blank" style="font-size: 10px; color: #9ca3af; text-decoration: none;">
       Powered by <span style="font-weight: 600; color: #a78bfa;">YourBot.site</span>
     </a>
   </div>
3. შექმენი \`app/api/chat/route.ts\` რომელიც აგზავნის მოთხოვნას Relay მისამართზე: \`${appUrl}/api/relay/${botId}\`.
4. \`terminalCommands\` იყოს: "npm install";
5. \`content\` ველებში ჩაწერე სრული და მზა კოდი.`;

    const ai = getGemini();

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: CHAT_MODEL,
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            Type: Type.OBJECT,
            properties: {
              analysis: { type: Type.STRING },
              filesToCreate: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    path: { type: Type.STRING },
                    content: { type: Type.STRING },
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
      return NextResponse.json({ error: "Gemini-სგან ცარიელი პასუხი მოვიდა." }, { status: 500 });
    }

    const parsedData = JSON.parse(response.text);

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