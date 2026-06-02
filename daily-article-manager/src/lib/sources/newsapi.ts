import type { Source } from "@/lib/sources/types";
import type { TopicCandidate } from "@/lib/types";

interface NewsApiArticle {
  title: string | null;
  description: string | null;
  url: string;
  publishedAt: string | null;
  source?: { name?: string | null };
}

interface NewsApiResponse {
  status: string;
  articles?: NewsApiArticle[];
  message?: string;
}

/**
 * NewsAPI.org adapter (primary news provider for Phase 1).
 * Reads NEWSAPI_KEY and NEWS_QUERY from env. Pulls one batch per query term
 * via the /everything endpoint, sorted by recency.
 */
export class NewsApiSource implements Source {
  id = "newsapi";
  label = "NewsAPI.org";

  private get apiKey(): string {
    return process.env.NEWSAPI_KEY ?? "";
  }

  private get queries(): string[] {
    return (process.env.NEWS_QUERY ?? "")
      .split(",")
      .map((q) => q.trim())
      .filter(Boolean);
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0 && this.queries.length > 0;
  }

  async fetchTrending(): Promise<TopicCandidate[]> {
    if (!this.isConfigured()) return [];

    const from = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
    const out: TopicCandidate[] = [];

    for (const q of this.queries) {
      const url = new URL("https://newsapi.org/v2/everything");
      url.searchParams.set("q", q);
      url.searchParams.set("from", from);
      url.searchParams.set("sortBy", "publishedAt");
      url.searchParams.set("language", "en");
      url.searchParams.set("pageSize", "20");

      try {
        const res = await fetch(url.toString(), {
          headers: { "X-Api-Key": this.apiKey },
          cache: "no-store",
        });
        const data = (await res.json()) as NewsApiResponse;
        if (data.status !== "ok" || !data.articles) continue;

        for (const a of data.articles) {
          if (!a.title || !a.url) continue;
          out.push({
            title: a.title,
            summary: a.description ?? null,
            url: a.url,
            source: this.id,
            sourceName: a.source?.name ?? "NewsAPI",
            publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
            rawKeywords: [q],
          });
        }
      } catch {
        // Swallow per-query errors so one bad term doesn't kill the batch.
        continue;
      }
    }

    return out;
  }
}
