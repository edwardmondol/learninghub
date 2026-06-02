import { prisma } from "@/lib/db";
import { getSources } from "@/lib/sources/registry";
import { dedupe, dedupeKeyFor } from "@/lib/dedupe";
import { todayBucket, type TopicCandidate, type SourceRunResult } from "@/lib/types";

export interface IngestSummary {
  fetchedDate: string;
  totalFetched: number;
  afterDedupe: number;
  inserted: number;
  skipped: number;
  sources: { source: string; ok: boolean; itemCount: number; error?: string }[];
}

/**
 * Phase 1 pipeline: fetch from every configured source (isolated failures) →
 * normalize → dedupe within batch → persist with today's fetchedDate.
 * DB unique([fetchedDate, dedupeKey]) prevents cross-run duplicates per day.
 */
export async function runIngestion(): Promise<IngestSummary> {
  const fetchedDate = todayBucket();
  const sources = getSources();
  const runResults: SourceRunResult[] = [];

  // Fetch all sources in parallel; each adapter must not throw, but guard anyway.
  await Promise.all(
    sources.map(async (s) => {
      if (!s.isConfigured()) {
        runResults.push({ source: s.id, ok: false, itemCount: 0, error: "not configured", candidates: [] });
        return;
      }
      try {
        const candidates = await s.fetchTrending();
        runResults.push({ source: s.id, ok: true, itemCount: candidates.length, candidates });
      } catch (err) {
        runResults.push({
          source: s.id,
          ok: false,
          itemCount: 0,
          error: err instanceof Error ? err.message : String(err),
          candidates: [],
        });
      }
    }),
  );

  // Record per-source health.
  await Promise.all(
    runResults.map((r) =>
      prisma.sourceRun
        .create({ data: { source: r.source, ok: r.ok, itemCount: r.itemCount, error: r.error ?? null } })
        .catch(() => undefined),
    ),
  );

  const all: TopicCandidate[] = runResults.flatMap((r) => r.candidates);
  const totalFetched = all.length;
  const deduped = dedupe(all);

  let inserted = 0;
  let skipped = 0;

  for (const c of deduped) {
    const dedupeKey = dedupeKeyFor(c);
    try {
      await prisma.topic.create({
        data: {
          title: c.title,
          summary: c.summary,
          url: c.url,
          source: c.source,
          sourceName: c.sourceName,
          publishedAt: c.publishedAt,
          rawKeywords: JSON.stringify(c.rawKeywords),
          fetchedDate,
          dedupeKey,
        },
      });
      inserted++;
    } catch {
      // Unique constraint hit (already ingested today) — skip silently.
      skipped++;
    }
  }

  return {
    fetchedDate,
    totalFetched,
    afterDedupe: deduped.length,
    inserted,
    skipped,
    sources: runResults.map((r) => ({ source: r.source, ok: r.ok, itemCount: r.itemCount, error: r.error })),
  };
}
