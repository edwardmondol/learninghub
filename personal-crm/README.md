# Personal CRM

A lightweight, browser-only Contact Relationship Manager. It consolidates your
network from **LinkedIn connections** and **Luma guest lists** into one
searchable list, focused on surfacing future collaboration opportunities.

No backend, no auth — all data persists in your browser via `localStorage`.

## Tech stack

- Vite + React + TypeScript
- Tailwind CSS
- PapaParse (CSV parsing)
- `localStorage` for persistence

## Getting started

```bash
npm install
npm run dev
```

Then open the printed URL (default http://localhost:5173).

To build for production:

```bash
npm run build
npm run preview
```

## Features

- **Contacts** — add / edit / delete, full-text search (name, business, notes,
  tags) and filters by category, source, and tag.
- **Import**
  - LinkedIn: upload `Connections.csv` (handles the "Notes" header lines that
    LinkedIn prepends to the export).
  - Luma: upload an event guest-list CSV.
  - Duplicate detection by **email first, then normalized full name**. Matches
    are **merged** (most complete values kept, notes combined, tags unioned,
    both sources retained) instead of duplicated.
  - An **import preview** (new / merged / skipped) is shown before anything is
    saved.
- **Collaboration Opportunities** — contacts grouped by shared tags into
  clusters (2+ people) to surface common themes/projects.
- **Backup** — export the full list to CSV, download a JSON backup, and restore
  from a JSON backup so you don't lose data if the browser is cleared.

## Data model

Contacts are stored as a JSON array under the `personal-crm:contacts:v1`
localStorage key.

```ts
interface Contact {
  id: string
  name: string                  // required
  professionOrBusiness: string  // job title, profession, OR business/company
  phone: string
  email: string
  website: string
  category: 'Personal' | 'Professional'   // required
  source: 'LinkedIn' | 'Luma' | 'Manual'  // merged records show e.g. "LinkedIn + Luma"
  collaborationNotes: string
  tags: string[]
  createdAt: string  // ISO
  updatedAt: string  // ISO
}
```

## CSV column mapping

| Model field           | LinkedIn columns            | Luma columns                         |
| --------------------- | --------------------------- | ------------------------------------ |
| name                  | First Name + Last Name      | name / full name / first+last        |
| professionOrBusiness  | Position @ Company          | title / role @ company / organization|
| email                 | Email Address               | email / email address                |
| phone                 | —                           | phone / phone number                 |
| website               | URL                         | website / url / linkedin             |

Header matching is case-insensitive and whitespace-tolerant.
