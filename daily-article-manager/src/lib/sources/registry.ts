import type { Source } from "@/lib/sources/types";
import { NewsApiSource } from "@/lib/sources/newsapi";
import { RssSource } from "@/lib/sources/rss";

// Central list of active sources. Add new providers here (trends, LinkedIn
// signal intake, GNews, etc.) — the pipeline iterates this registry generically.
export function getSources(): Source[] {
  return [new NewsApiSource(), new RssSource()];
}
