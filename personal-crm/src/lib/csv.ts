import Papa from 'papaparse'
import type { Category, Contact, ImportPreview, Source } from '../types'
import { newId } from './storage'

type Row = Record<string, string>

/* ----------------------------- helpers ----------------------------- */

const clean = (v: unknown): string => (v == null ? '' : String(v).trim())

/** Case/whitespace-insensitive header lookup. Returns first matching column value. */
function pick(row: Row, candidates: string[]): string {
  const keys = Object.keys(row)
  for (const cand of candidates) {
    const want = cand.toLowerCase().replace(/\s+/g, ' ').trim()
    const hit = keys.find(
      (k) => k.toLowerCase().replace(/\s+/g, ' ').trim() === want,
    )
    if (hit && clean(row[hit])) return clean(row[hit])
  }
  return ''
}

export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function parseTags(raw: string): string[] {
  return raw
    .split(/[,;|]/)
    .map((t) => t.trim())
    .filter(Boolean)
}

function uniqueTags(tags: string[]): string[] {
  const seen = new Map<string, string>()
  for (const t of tags) {
    const key = t.toLowerCase()
    if (!seen.has(key)) seen.set(key, t)
  }
  return [...seen.values()]
}

/* --------------------------- CSV parsing ---------------------------- */

export function parseCsvFile(file: File): Promise<Row[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim(),
      complete: (results) => resolve(results.data as Row[]),
      error: (err) => reject(err),
    })
  })
}

/* LinkedIn "Connections.csv" sometimes has 2–3 "Notes" lines before the header.
   PapaParse with header:true would mis-read those. We strip leading junk first. */
export function preprocessLinkedInText(text: string): string {
  const lines = text.split(/\r?\n/)
  const idx = lines.findIndex((l) => /first name/i.test(l) && /last name/i.test(l))
  if (idx > 0) return lines.slice(idx).join('\n')
  return text
}

export function parseLinkedInFile(file: File): Promise<Row[]> {
  return file.text().then((text) => {
    const cleaned = preprocessLinkedInText(text)
    const results = Papa.parse<Row>(cleaned, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim(),
    })
    return results.data as Row[]
  })
}

/* ----------------------- row -> Contact mapping --------------------- */

function makeContact(partial: Partial<Contact>): Contact {
  const now = new Date().toISOString()
  return {
    id: newId(),
    name: '',
    professionOrBusiness: '',
    phone: '',
    email: '',
    website: '',
    category: 'Professional',
    source: 'Manual',
    collaborationNotes: '',
    tags: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

export function mapLinkedInRow(row: Row): Contact | null {
  const first = pick(row, ['First Name', 'firstname'])
  const last = pick(row, ['Last Name', 'lastname'])
  const name = `${first} ${last}`.trim()
  if (!name) return null

  const company = pick(row, ['Company'])
  const position = pick(row, ['Position', 'Title'])
  const professionOrBusiness = [position, company].filter(Boolean).join(' @ ')

  return makeContact({
    name,
    professionOrBusiness,
    email: pick(row, ['Email Address', 'Email']),
    website: pick(row, ['URL', 'Profile URL']),
    category: 'Professional',
    source: 'LinkedIn',
  })
}

export function mapLumaRow(row: Row): Contact | null {
  const name =
    pick(row, ['name', 'full name', 'attendee name']) ||
    `${pick(row, ['first name'])} ${pick(row, ['last name'])}`.trim()
  if (!name) return null

  const company = pick(row, ['company', 'organization', 'organisation'])
  const title = pick(row, ['title', 'job title', 'role', 'position'])
  const professionOrBusiness = [title, company].filter(Boolean).join(' @ ')

  return makeContact({
    name,
    professionOrBusiness,
    email: pick(row, ['email', 'email address']),
    phone: pick(row, ['phone', 'phone number']),
    website: pick(row, ['website', 'url', 'linkedin']),
    category: 'Professional',
    source: 'Luma',
  })
}

/* --------------------------- merge logic ---------------------------- */

/** Prefer the longer / non-empty value when merging two records. */
function mostComplete(a: string, b: string): string {
  if (!a) return b
  if (!b) return a
  return b.length > a.length ? b : a
}

function combineNotes(a: string, b: string): string {
  if (!a) return b
  if (!b) return a
  if (a.includes(b)) return a
  if (b.includes(a)) return b
  return `${a}\n${b}`
}

/** Merge an incoming contact into an existing one, keeping the most complete data. */
export function mergeContacts(existing: Contact, incoming: Contact): Contact {
  const sources = new Set<Source>()
  ;(existing.source ? existing.source.split(' + ') : []).forEach((s) =>
    sources.add(s.trim() as Source),
  )
  sources.add(incoming.source)
  const source = [...sources].join(' + ') as Source

  return {
    ...existing,
    name: mostComplete(existing.name, incoming.name),
    professionOrBusiness: mostComplete(
      existing.professionOrBusiness,
      incoming.professionOrBusiness,
    ),
    phone: mostComplete(existing.phone, incoming.phone),
    email: existing.email || incoming.email,
    website: mostComplete(existing.website, incoming.website),
    collaborationNotes: combineNotes(
      existing.collaborationNotes,
      incoming.collaborationNotes,
    ),
    tags: uniqueTags([...existing.tags, ...incoming.tags]),
    source,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Build an import preview against the current contacts.
 * Dedup priority: email match first, then normalized full name.
 * Incoming rows are also deduped against each other within the batch.
 */
export function buildImportPreview(
  incoming: Contact[],
  existing: Contact[],
  skipped: { row: Row; reason: string }[] = [],
): ImportPreview {
  const byEmail = new Map<string, Contact>()
  const byName = new Map<string, Contact>()
  for (const c of existing) {
    if (c.email) byEmail.set(normalizeEmail(c.email), c)
    byName.set(normalizeName(c.name), c)
  }

  const newContacts: Contact[] = []
  const merges: ImportPreview['merges'] = []

  for (const inc of incoming) {
    const emailKey = inc.email ? normalizeEmail(inc.email) : ''
    const nameKey = normalizeName(inc.name)
    const match =
      (emailKey && byEmail.get(emailKey)) || byName.get(nameKey) || null

    if (match) {
      const merged = mergeContacts(match, inc)
      merges.push({ existing: match, incoming: inc, merged })
      // keep maps pointing at the merged record so later rows merge too
      if (merged.email) byEmail.set(normalizeEmail(merged.email), merged)
      byName.set(normalizeName(merged.name), merged)
      // replace previous reference for subsequent matches
      const prevIdx = merges.findIndex((m) => m.existing.id === match.id)
      if (prevIdx !== -1) merges[prevIdx].merged = merged
    } else {
      newContacts.push(inc)
      if (inc.email) byEmail.set(emailKey, inc)
      byName.set(nameKey, inc)
    }
  }

  return { newContacts, merges, skipped }
}

/** Apply a committed preview to the existing list, returning the new full list. */
export function applyImport(
  existing: Contact[],
  preview: ImportPreview,
): Contact[] {
  const mergedById = new Map<string, Contact>()
  for (const m of preview.merges) mergedById.set(m.existing.id, m.merged)

  const updated = existing.map((c) => mergedById.get(c.id) ?? c)
  return [...updated, ...preview.newContacts]
}

/* ----------------------------- export ------------------------------- */

const EXPORT_COLUMNS: (keyof Contact)[] = [
  'id',
  'name',
  'professionOrBusiness',
  'phone',
  'email',
  'website',
  'category',
  'source',
  'collaborationNotes',
  'tags',
  'createdAt',
  'updatedAt',
]

export function contactsToCsv(contacts: Contact[]): string {
  const rows = contacts.map((c) => ({
    ...c,
    tags: c.tags.join('; '),
  }))
  return Papa.unparse({ fields: EXPORT_COLUMNS as string[], data: rows })
}

export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportContactsCsv(contacts: Contact[]) {
  const stamp = new Date().toISOString().slice(0, 10)
  downloadFile(`contacts-${stamp}.csv`, contactsToCsv(contacts), 'text/csv')
}

export function exportContactsJson(contacts: Contact[]) {
  const stamp = new Date().toISOString().slice(0, 10)
  downloadFile(
    `crm-backup-${stamp}.json`,
    JSON.stringify(contacts, null, 2),
    'application/json',
  )
}

/** Parse + validate a backup JSON file into Contact[]. Throws on malformed data. */
export function parseBackupJson(text: string): Contact[] {
  const data = JSON.parse(text)
  if (!Array.isArray(data)) throw new Error('Backup must be a JSON array.')
  return data.map((d: Partial<Contact>) =>
    makeContact({
      ...d,
      category: (d.category as Category) || 'Professional',
      source: (d.source as Source) || 'Manual',
      tags: Array.isArray(d.tags) ? d.tags : [],
      id: d.id || newId(),
    }),
  )
}
