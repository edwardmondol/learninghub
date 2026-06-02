// Normalized shape every Source adapter must emit.
export interface TopicCandidate {
  title: string;
  summary: string | null;
  url: string;
  /** Adapter id, e.g. "newsapi" or "rss:https://..." */
  source: string;
  /** Human-friendly outlet/feed label. */
  sourceName: string | null;
  publishedAt: Date | null;
  rawKeywords: string[];
}

export interface SourceRunResult {
  source: string;
  ok: boolean;
  itemCount: number;
  error?: string;
  candidates: TopicCandidate[];
}

export function todayBucket(d: Date = new Date()): string {
  // YYYY-MM-DD in local time for daily batching.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
