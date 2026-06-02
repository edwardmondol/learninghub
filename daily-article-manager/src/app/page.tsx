import { prisma } from "@/lib/db";
import { todayBucket } from "@/lib/types";
import RefreshButton from "./RefreshButton";

export const dynamic = "force-dynamic";

function timeAgo(date: Date | null): string {
  if (!date) return "—";
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default async function Home() {
  const fetchedDate = todayBucket();

  let topics: Awaited<ReturnType<typeof prisma.topic.findMany>> = [];
  let dbError = false;
  try {
    topics = await prisma.topic.findMany({
      where: { fetchedDate, dismissed: false },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });
  } catch {
    dbError = true;
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Daily Article Manager</h1>
          <p className="mt-1 text-sm text-slate-500">
            Today&rsquo;s trending topics · {fetchedDate} · {topics.length} items
          </p>
        </div>
        <RefreshButton />
      </header>

      {dbError ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-800">
          <p className="font-medium">Database not initialized.</p>
          <p className="mt-1 text-sm">
            Run <code className="rounded bg-amber-100 px-1">npm run db:push</code> to create the
            SQLite schema, then refresh.
          </p>
        </div>
      ) : topics.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-lg font-medium text-slate-700">No topics yet for today.</p>
          <p className="mt-2 text-sm text-slate-500">
            Click <span className="font-medium">Refresh now</span> to pull the morning batch from
            NewsAPI and your RSS feeds.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => {
            const keywords: string[] = (() => {
              try {
                return JSON.parse(t.rawKeywords);
              } catch {
                return [];
              }
            })();
            return (
              <article
                key={t.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate">{t.sourceName ?? t.source}</span>
                  <span>{timeAgo(t.publishedAt)}</span>
                </div>
                <h2 className="line-clamp-3 font-medium leading-snug">{t.title}</h2>
                {t.summary && (
                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">{t.summary}</p>
                )}
                {keywords.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {keywords.slice(0, 4).map((k) => (
                      <span
                        key={k}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                )}
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto pt-3 text-sm font-medium text-blue-600 hover:underline"
                >
                  Open source →
                </a>
              </article>
            );
          })}
        </div>
      )}

      <footer className="mt-10 text-center text-xs text-slate-400">
        Phase 1 · Ingestion + storage. Enrichment, filters, and saved view arrive in later phases.
      </footer>
    </main>
  );
}
