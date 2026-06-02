# Daily Article Manager

A personal content-intelligence dashboard. Each morning it aggregates trending
topics from multiple sources, (soon) enriches them with strategic content
metadata, and lets you save, dismiss, and export the best ones.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Prisma** ORM → **SQLite** by default (swappable to Supabase/Postgres)
- Anthropic Claude for enrichment (Phase 2)

## Phase 1 — what's built

Ingestion + storage:

- Pluggable `Source` interface (`src/lib/sources/types.ts`) with adapters:
  - **NewsAPI.org** (`newsapi.ts`) — primary news provider
  - **RSS feeds** (`rss.ts`) — user-editable list, parsed server-side
- Normalization into a `TopicCandidate` shape (`src/lib/types.ts`)
- Near-duplicate detection (URL canonicalization + title-similarity) in `src/lib/dedupe.ts`
- Persistence with a per-day `fetchedDate` bucket (`prisma/schema.prisma`)
- Ingestion pipeline with **isolated per-source failures** + health logging (`src/pipeline/ingest.ts`)
- **Manual "Refresh now"** button → `POST /api/refresh`
- **Daily cron** → `GET /api/cron/refresh` (protected by `CRON_SECRET`, wired via `vercel.json`)
- Today view with empty / error states (`src/app/page.tsx`)

## Setup

```bash
cd daily-article-manager
npm install
cp .env.example .env.local   # then edit values (Windows: copy .env.example .env.local)
npm run db:push              # create the SQLite schema (dev.db)
npm run dev                  # http://localhost:3000
```

### Keys to add to test Phase 1

- **`NEWSAPI_KEY`** — free at <https://newsapi.org/>. Without it, the NewsAPI
  source reports "not configured" and is skipped; **RSS still works with no key.**
- **`NEWS_QUERY`** — comma-separated search terms (a default niche set is provided).
- **`CRON_SECRET`** — any string; required to call the cron endpoint.

Then click **Refresh now** on the dashboard to pull today's batch.

## Switching to Supabase/Postgres

1. In `prisma/schema.prisma`, change `provider = "sqlite"` → `"postgresql"`.
2. Set `DATABASE_URL` to your Postgres/Supabase connection string in `.env.local`.
3. Run `npm run db:push`. No application code changes required.

## Cron (production)

`vercel.json` schedules `GET /api/cron/refresh` daily at 12:00 UTC. Vercel sends
`Authorization: Bearer $CRON_SECRET`; set `CRON_SECRET` in the Vercel project env.

## Roadmap

- **Phase 2** — Claude enrichment (category, subtopics, trendingScore, niche, credentials, angle, research sources)
- **Phase 3** — full dashboard (filters, save/dismiss, saved view, taxonomy + profile settings)
- **Phase 4** — "Draft from this" clipboard brief + Markdown/CSV export
