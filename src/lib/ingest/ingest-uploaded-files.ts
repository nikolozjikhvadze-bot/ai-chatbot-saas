import { createClient } from "@supabase/supabase-js";
import { chunkText, isEmbeddableFile } from "./chunk-text";
import { embedDocuments } from "./embed";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const MAX_TOTAL_CHUNKS = 300; // ერთი ატვირთვის ჯამური ლიმიტი, ხარჯებისა და დროის დასაცავად
const INSERT_BATCH = 50;

/**
 * კითხულობს ატვირთული ფაილების შიგთავსს, ჭრის chunk-ებად, ემბედავს და
 * ინახავს documents ცხრილში ამ botId-ზე. ეს ავსებს RAG-ის მონაცემებს
 * Relay-ს retrieveContext-ისთვის.
 *
 * უსაფრთხო წარუმატებლობა: თუ ეს მთლიანად ჩავარდება, აგდებს ერორს
 * ზემოთ — ეს caller-ის გადასაწყვეტია, ჩავარდეს თუ არა მთელი request.
 */
export async function ingestUploadedFiles(
  botId: string,
  files: File[],
): Promise<{ chunksIngested: number }> {
  const { data: source, error: sourceError } = await supabaseAdmin
    .from("sources")
    .insert({ bot_id: botId, type: "text", status: "processing" })
    .select("id")
    .single();

  if (sourceError || !source) {
    throw new Error(`sources insert failed: ${sourceError?.message}`);
  }

  try {
    // ძველი, ამ ბოტისთვის აქამდე დაატვირთული chunk-ების წაშლა — ყოველი
    // ახალი ატვირთვა თავიდან ცვლის ცოდნის ბაზას, არ ემატება მას.
    await supabaseAdmin.from("documents").delete().eq("bot_id", botId);

    type PendingChunk = { path: string; text: string };
    const pending: PendingChunk[] = [];

    for (const file of files) {
      if (!isEmbeddableFile(file.name, file.size)) continue;
      const text = await file.text().catch(() => "");
      if (!text.trim()) continue;

      const filePath = (file as any).webkitRelativePath || file.name;
      for (const chunk of chunkText(text)) {
        pending.push({ path: filePath, text: chunk });
        if (pending.length >= MAX_TOTAL_CHUNKS) break;
      }
      if (pending.length >= MAX_TOTAL_CHUNKS) break;
    }

    if (pending.length === 0) {
      await supabaseAdmin
        .from("sources")
        .update({ status: "ready", chunk_count: 0 })
        .eq("id", source.id);
      return { chunksIngested: 0 };
    }

    const embeddings = await embedDocuments(
      pending.map((p) => ({ title: p.path, text: p.text })),
    );

    const rows = pending.map((p, i) => ({
      bot_id: botId,
      source_id: source.id,
      chunk_index: i,
      content: p.text,
      metadata: { path: p.path },
      token_count: Math.ceil(p.text.length / 4), // უხეში შეფასება
      embedding: embeddings[i],
    }));

    for (let i = 0; i < rows.length; i += INSERT_BATCH) {
      const { error } = await supabaseAdmin
        .from("documents")
        .insert(rows.slice(i, i + INSERT_BATCH));
      if (error) throw new Error(`documents insert failed: ${error.message}`);
    }

    await supabaseAdmin
      .from("sources")
      .update({ status: "ready", chunk_count: rows.length })
      .eq("id", source.id);

    return { chunksIngested: rows.length };
  } catch (err) {
    await supabaseAdmin
      .from("sources")
      .update({ status: "failed", error: String(err).slice(0, 500) })
      .eq("id", source.id);
    throw err;
  }
}