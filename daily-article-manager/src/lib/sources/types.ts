import type { TopicCandidate } from "@/lib/types";

// Common contract every data source implements. New providers (trends,
// LinkedIn-signal intake, GNews, etc.) plug in by implementing this and
// registering in registry.ts — no changes to the core pipeline required.
export interface Source {
  /** Stable adapter id, e.g. "newsapi". */
  id: string;
  /** Human label for Settings/health UI. */
  label: string;
  /** Whether this source is currently usable (e.g. key present). */
  isConfigured(): boolean;
  /** Fetch trending candidates. Must never throw — return [] on failure. */
  fetchTrending(): Promise<TopicCandidate[]>;
}
