import Parser from "rss-parser";
import type { Source } from "@/lib/sources/types";
import type { TopicCandidate } from "@/lib/types";
import { prisma } from "@/lib/db";

// Fallback feeds used if the DB has no user-defined feeds yet. Editable later
// via Settings (Phase 3). Kept broad across the user's niches.
export const DEFAULT_FEEDS: { url: string; label: string }[] = [
  { url: "https://www.theverge.com/rss/index.xml", label: "The Verge" },
  { url: "https://feeds.arstechnica.com/arstechnica/technology-lab", label: "Ars Technica" },
  { url: "https://www.technologyreview.com/feed/", label: "MIT Tech Review" },
  { url: "https://betakit.com/feed/", label: "BetaKit (Canadian Tech)" },
];

const parser = new Parser({ timeout: 10000 });

/**
 * Server-side RSS adapter. Reads enabled feeds from the DB (falls back to
 * DEFAULT_FEEDS) and normalizes items into TopicCandidate. Each feed failure
 * is isolated so one dead feed doesn't break the batch.
 */
export class RssSource implements Source {
  id = "rss";
  label = "RSS Feeds";

  isConfigured(): boolean {
    return true; // No key required.
  }

  private async resolveFeeds(): Promise<{ url: string; label: string | null }[]> {
    try {
      const rows = await prisma.rssFeed.findMany({ where: { enabled: true } });
      if (rows.length > 0) {
        return rows.map((r) => ({ url: r.url, label: r.label }));
      }
    } catch {
      // DB not ready — fall back to defaults.
    }
    return DEFAULT_FEEDS.map((f) => ({ url: f.url, label: f.label }));
  }

  async fetchTrending(): Promise<TopicCandidate[]> {
    const feeds = await this.resolveFeeds();
    const out: TopicCandidate[] = [];

    for (const feed of feeds) {
      try {
        const parsed = await parser.parseURL(feed.url);
        const label = feed.label ?? parsed.title ?? "RSS";
        for (const item of parsed.items ?? []) {
          if (!item.title || !item.link) continue;
          out.push({
            title: item.title,
            summary: item.contentSnippet ?? item.content ?? null,
            url: item.link,
            source: `rss:${feed.url}`,
            sourceName: label,
            publishedAt: item.isoDate ? new Date(item.isoDate) : null,
            rawKeywords: item.categories ?? [],
          });
        }
      } catch {
        continue;
      }
    }

    return out;
  }
}
