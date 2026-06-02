import { useMemo, useState } from 'react'
import {
  Search,
  Plus,
  Mail,
  Phone,
  Globe,
  Pencil,
  Download,
  X,
} from 'lucide-react'
import type { Category, Contact, Source } from '../types'
import { exportContactsCsv } from '../lib/csv'

interface ContactsViewProps {
  contacts: Contact[]
  onNew: () => void
  onEdit: (contact: Contact) => void
}

const SOURCE_STYLES: Record<string, string> = {
  LinkedIn: 'bg-blue-50 text-blue-700',
  Luma: 'bg-fuchsia-50 text-fuchsia-700',
  Manual: 'bg-slate-100 text-slate-600',
}

function sourceBadge(source: Source) {
  // merged sources look like "LinkedIn + Luma"
  return SOURCE_STYLES[source] || 'bg-emerald-50 text-emerald-700'
}

export default function ContactsView({
  contacts,
  onNew,
  onEdit,
}: ContactsViewProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'All'>('All')
  const [source, setSource] = useState<string>('All')
  const [tag, setTag] = useState<string>('All')

  const allTags = useMemo(() => {
    const set = new Set<string>()
    contacts.forEach((c) => c.tags.forEach((t) => set.add(t)))
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [contacts])

  const allSources = useMemo(() => {
    const set = new Set<string>()
    contacts.forEach((c) => set.add(c.source))
    return [...set].sort()
  }, [contacts])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return contacts
      .filter((c) => {
        if (category !== 'All' && c.category !== category) return false
        if (source !== 'All' && c.source !== source) return false
        if (tag !== 'All' && !c.tags.includes(tag)) return false
        if (!q) return true
        return (
          c.name.toLowerCase().includes(q) ||
          c.professionOrBusiness.toLowerCase().includes(q) ||
          c.collaborationNotes.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
        )
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [contacts, query, category, source, tag])

  const hasFilters =
    query || category !== 'All' || source !== 'All' || tag !== 'All'

  const clearFilters = () => {
    setQuery('')
    setCategory('All')
    setSource('All')
    setTag('All')
  }

  const selectClass =
    'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Contacts</h2>
          <p className="text-sm text-slate-500">
            {filtered.length} of {contacts.length} shown
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportContactsCsv(contacts)}
            disabled={!contacts.length}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={onNew}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus size={16} /> Add contact
          </button>
        </div>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, business, notes, tags..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <select
          className={selectClass}
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | 'All')}
        >
          <option value="All">All categories</option>
          <option value="Professional">Professional</option>
          <option value="Personal">Personal</option>
        </select>
        <select
          className={selectClass}
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          <option value="All">All sources</option>
          {allSources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        >
          <option value="All">All tags</option>
          {allTags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-slate-500 hover:text-slate-800"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {contacts.length === 0 ? (
        <EmptyState
          title="No contacts yet"
          body="Add a contact manually, or head to the Import tab to bring in your LinkedIn connections and Luma guest lists."
          action={
            <button
              onClick={onNew}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Add your first contact
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matches"
          body="No contacts match your current search and filters."
          action={
            <button
              onClick={clearFilters}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((c) => (
            <li
              key={c.id}
              className="group animate-fade-in rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-slate-900">
                    {c.name}
                  </h3>
                  {c.professionOrBusiness && (
                    <p className="truncate text-sm text-slate-500">
                      {c.professionOrBusiness}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onEdit(c)}
                  className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-indigo-600 group-hover:opacity-100"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    c.category === 'Professional'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {c.category}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${sourceBadge(
                    c.source,
                  )}`}
                >
                  {c.source}
                </span>
              </div>

              {(c.email || c.phone || c.website) && (
                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  {c.email && (
                    <a
                      href={`mailto:${c.email}`}
                      className="flex items-center gap-2 truncate hover:text-indigo-600"
                    >
                      <Mail size={14} className="shrink-0 text-slate-400" />
                      <span className="truncate">{c.email}</span>
                    </a>
                  )}
                  {c.phone && (
                    <p className="flex items-center gap-2 truncate">
                      <Phone size={14} className="shrink-0 text-slate-400" />
                      <span className="truncate">{c.phone}</span>
                    </p>
                  )}
                  {c.website && (
                    <a
                      href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 truncate hover:text-indigo-600"
                    >
                      <Globe size={14} className="shrink-0 text-slate-400" />
                      <span className="truncate">{c.website}</span>
                    </a>
                  )}
                </div>
              )}

              {c.collaborationNotes && (
                <p className="mt-3 line-clamp-3 whitespace-pre-line rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                  {c.collaborationNotes}
                </p>
              )}

              {c.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {c.tags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTag(t)}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-indigo-100 hover:text-indigo-700"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
