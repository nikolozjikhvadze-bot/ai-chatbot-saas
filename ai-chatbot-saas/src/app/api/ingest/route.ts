import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { assertPublicUrl } from "@/lib/ingest/ssrf";
import { crawl } from "@/lib/ingest/crawl";
import { chunkPage } from "@/lib/ingest/chunk";
import { embedDocuments } from "@/lib/ingest/embed";
import { isQuotaError } from "@/lib/gemini";
import { IngestError } from "@/lib/ingest/errors";

export const runtime = "nodejs";
// MVP: ინგესტი სინქრონულია. ფაზა 1-ში გადაიტანე ფონურ job-ში (Inngest),
// როცა საიტები 60 წამზე დიდს მოითხოვს.
export const maxDuration = 60;

const DEFAULT_PAGES = 5;
const MAX_PAGES = 20;
const MAX_CHUNKS = 500; // საწყისი ლიმიტი ერთ წყაროზე (მოგვიანებით — გეგმის მიხედვით)
const CRAWL_BUDGET_MS = 35_000;
const INSERT_BATCH = 50;

const Body = z.object({
  botId: z.string().uuid(),
  url: z.string().url().max(2048),
  maxPages: z.number().int().min(1).max(MAX_PAGES).default(DEFAULT_PAGES),
});

export async function POST(req: Request) {
  // 1) Input ვალიდაცია
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "არასწორი მოთხოვნა",
        details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      },
      { status: 400 },
    );
  }
  const { botId, url, maxPages } = parsed.data;

  // 2) ავტორიზაცია + ბოტის კუთვნილება (RLS: სხვის ბოტს ვერ დაინახავს)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "საჭიროა ავტორიზაცია" }, { status: 401 });
  }

  const { data: bot } = await supabase
    .from("bots")
    .select("id")
    .eq("id", botId)
    .maybeSingle();
  if (!bot) {
    return NextResponse.json({ error: "ბოტი ვერ მოიძებნა" }, { status: 404 });
  }

  // 3) URL-ის უსაფრთხოების შემოწმება (SSRF)
  try {
    await assertPublicUrl(url);
  } catch (err) {
    const message = err instanceof IngestError ? err.message : "არასწორი URL";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // 4) წყაროს შექმნა (დეშბორდი სტატუსს აჩვენებს)
  const { data: source, error: sourceError } = await supabase
    .from("sources")
    .insert({ bot_id: botId, type: "url", url, status: "processing" })
    .select("id")
    .single();
  if (sourceError || !source) {
    console.error("[ingest] source insert failed", sourceError);
    return NextResponse.json({ error: "წყაროს შექმნა ვერ მოხერხდა" }, { status: 500 });
  }

  try {
    // 5) Crawl → ტექსტის ამოღება
    const pages = await crawl(url, {
      maxPages,
      deadline: Date.now() + CRAWL_BUDGET_MS,
    });
    if (pages.length === 0) {
      throw new IngestError("გვერდზე წაკითხვადი ტექსტი ვერ მოიძებნა (შესაძლოა საიტი JavaScript-ზეა დამოკიდებული)");
    }

    // 6) Chunking
    const chunks = pages.flatMap((p) => chunkPage(p)).slice(0, MAX_CHUNKS);
    if (chunks.length === 0) {
      throw new IngestError("კონტენტის დაყოფა ვერ მოხერხდა");
    }

    // 7) Embedding
    const embeddings = await embedDocuments(
      chunks.map((c) => ({ title: c.metadata.title, text: c.content })),
    );

    // 8) შენახვა ბაჩებად
    const rows = chunks.map((c, i) => ({
      bot_id: botId,
      source_id: source.id,
      chunk_index: i,
      content: c.content,
      metadata: c.metadata,
      token_count: c.tokenCount,
      embedding: embeddings[i],
    }));

    for (let i = 0; i < rows.length; i += INSERT_BATCH) {
      const { error } = await supabase.from("documents").insert(rows.slice(i, i + INSERT_BATCH));
      if (error) throw new Error(`documents insert failed: ${error.message}`);
    }

    const contentHash = createHash("sha256")
      .update(chunks.map((c) => c.content).join("\n"))
      .digest("hex");

    await supabase
      .from("sources")
      .update({
        status: "ready",
        title: pages[0].title,
        chunk_count: rows.length,
        content_hash: contentHash,
        last_synced_at: new Date().toISOString(),
        error: null,
      })
      .eq("id", source.id);

    return NextResponse.json({
      sourceId: source.id,
      pages: pages.length,
      chunks: rows.length,
    });
  } catch (err) {
    // ნაწილობრივ ჩაწერილი chunk-ების გასუფთავება და სტატუსის განახლება
    await supabase.from("documents").delete().eq("source_id", source.id);

    const userFacing = err instanceof IngestError;
    if (!userFacing) console.error("[ingest] failed", err);
    const message = userFacing
      ? err.message
      : isQuotaError(err)
        ? "Gemini API-ს უფასო ლიმიტი ამოიწურა. სცადე რამდენიმე წუთში (ან შეამცირე maxPages)."
        : "ინგესტი ვერ დასრულდა. სცადე თავიდან.";

    await supabase
      .from("sources")
      .update({ status: "failed", error: message.slice(0, 500) })
      .eq("id", source.id);

    return NextResponse.json({ error: message }, { status: 422 });
  }
}