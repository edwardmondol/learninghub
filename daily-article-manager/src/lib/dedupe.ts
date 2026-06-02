import type { TopicCandidate } from "@/lib/types";

// Normalize a title to a comparable token signature.
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Stable dedupe key: normalized title (primary) — used for DB unique constraint.
export function dedupeKeyFor(candidate: TopicCandidate): string {
  return normalizeTitle(candidate.title);
}

function tokens(s: string): Set<string> {
  return new Set(normalizeTitle(s).split(" ").filter((w) => w.length > 2));
}

// Jaccard similarity over title tokens.
function similarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  const union = ta.size + tb.size - inter;
  return inter / union;
}

function canonicalUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname}`.replace(/\/$/, "").toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Remove near-identical stories within a single fetch batch.
 * Two candidates collide if URLs canonicalize equal OR title similarity >= threshold.
 * Keeps the first seen; merges rawKeywords from duplicates.
 */
export function dedupe(
  candidates: TopicCandidate[],
  threshold = 0.6,
): TopicCandidate[] {
  const kept: TopicCandidate[] = [];
  const seenUrls = new Map<string, number>();

  for (const c of candidates) {
    const cu = canonicalUrl(c.url);
    const urlHitIdx = seenUrls.get(cu);
    if (urlHitIdx !== undefined) {
      mergeKeywords(kept[urlHitIdx], c);
      continue;
    }

    let dupIdx = -1;
    for (let i = 0; i < kept.length; i++) {
      if (similarity(kept[i].title, c.title) >= threshold) {
        dupIdx = i;
        break;
      }
    }

    if (dupIdx >= 0) {
      mergeKeywords(kept[dupIdx], c);
      continue;
    }

    seenUrls.set(cu, kept.length);
    kept.push(c);
  }

  return kept;
}

function mergeKeywords(target: TopicCandidate, src: TopicCandidate): void {
  const set = new Set([...target.rawKeywords, ...src.rawKeywords]);
  target.rawKeywords = [...set];
}
