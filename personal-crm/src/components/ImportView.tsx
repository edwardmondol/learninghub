import { useRef, useState } from 'react'
import {
  Linkedin,
  CalendarDays,
  FileUp,
  Check,
  GitMerge,
  Ban,
  Database,
  Save,
  Upload,
} from 'lucide-react'
import type { Contact, ImportPreview } from '../types'
import {
  buildImportPreview,
  exportContactsJson,
  mapLinkedInRow,
  mapLumaRow,
  parseBackupJson,
  parseCsvFile,
  parseLinkedInFile,
} from '../lib/csv'

interface ImportViewProps {
  contacts: Contact[]
  onCommit: (preview: ImportPreview) => void
  onReplaceAll: (contacts: Contact[]) => void
}

type Pending = {
  kind: 'LinkedIn' | 'Luma'
  fileName: string
  preview: ImportPreview
}

export default function ImportView({
  contacts,
  onCommit,
  onReplaceAll,
}: ImportViewProps) {
  const [pending, setPending] = useState<Pending | null>(null)
  const [message, setMessage] = useState<string>('')
  const [error, setError] = useState<string>('')
  const linkedInRef = useRef<HTMLInputElement>(null)
  const lumaRef = useRef<HTMLInputElement>(null)
  const jsonRef = useRef<HTMLInputElement>(null)

  const reset = (el: HTMLInputElement | null) => {
    if (el) el.value = ''
  }

  const handleLinkedIn = async (file: File) => {
    setError('')
    setMessage('')
    try {
      const rows = await parseLinkedInFile(file)
      buildPreview(rows.map(mapLinkedInRow), rows, 'LinkedIn', file.name)
    } catch (err) {
      setError(`Could not parse LinkedIn file: ${(err as Error).message}`)
    }
  }

  const handleLuma = async (file: File) => {
    setError('')
    setMessage('')
    try {
      const rows = await parseCsvFile(file)
      buildPreview(rows.map(mapLumaRow), rows, 'Luma', file.name)
    } catch (err) {
      setError(`Could not parse Luma file: ${(err as Error).message}`)
    }
  }

  const buildPreview = (
    mapped: (Contact | null)[],
    rows: Record<string, string>[],
    kind: 'LinkedIn' | 'Luma',
    fileName: string,
  ) => {
    const incoming: Contact[] = []
    const skipped: { row: Record<string, string>; reason: string }[] = []
    mapped.forEach((c, i) => {
      if (c) incoming.push(c)
      else skipped.push({ row: rows[i] ?? {}, reason: 'Missing name' })
    })
    if (incoming.length === 0) {
      setError('No usable rows found in that file. Check the column headers.')
      return
    }
    const preview = buildImportPreview(incoming, contacts, skipped)
    setPending({ kind, fileName, preview })
  }

  const commit = () => {
    if (!pending) return
    const { newContacts, merges } = pending.preview
    onCommit(pending.preview)
    setMessage(
      `Imported ${pending.fileName}: ${newContacts.length} added, ${merges.length} merged, ${pending.preview.skipped.length} skipped.`,
    )
    setPending(null)
  }

  const handleJson = async (file: File) => {
    setError('')
    setMessage('')
    try {
      const text = await file.text()
      const parsed = parseBackupJson(text)
      if (
        !window.confirm(
          `Restore ${parsed.length} contacts from backup? This REPLACES your current ${contacts.length} contacts.`,
        )
      )
        return
      onReplaceAll(parsed)
      setMessage(`Restored ${parsed.length} contacts from backup.`)
    } catch (err) {
      setError(`Invalid backup file: ${(err as Error).message}`)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Import & Backup</h2>
        <p className="text-sm text-slate-500">
          Bring in connections from LinkedIn and Luma. Duplicates are detected
          by email, then name, and merged automatically.
        </p>
      </header>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ImportCard
          icon={<Linkedin size={20} />}
          accent="text-blue-600 bg-blue-50"
          title="LinkedIn connections"
          body='Upload "Connections.csv" from your LinkedIn data export.'
          onClick={() => linkedInRef.current?.click()}
        />
        <ImportCard
          icon={<CalendarDays size={20} />}
          accent="text-fuchsia-600 bg-fuchsia-50"
          title="Luma guest list"
          body="Upload a guest-list CSV exported from a Luma event."
          onClick={() => lumaRef.current?.click()}
        />
      </div>

      <input
        ref={linkedInRef}
        type="file"
        accept=".csv"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleLinkedIn(f)
          reset(linkedInRef.current)
        }}
      />
      <input
        ref={lumaRef}
        type="file"
        accept=".csv"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleLuma(f)
          reset(lumaRef.current)
        }}
      />

      {pending && (
        <PreviewPanel
          pending={pending}
          onCommit={commit}
          onCancel={() => setPending(null)}
        />
      )}

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <Database size={18} className="text-slate-500" />
          <h3 className="font-semibold text-slate-800">Data backup</h3>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Your data lives in this browser's localStorage. Download a JSON backup
          regularly so you don't lose it if the browser is cleared.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportContactsJson(contacts)}
            disabled={!contacts.length}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Save size={16} /> Download backup JSON
          </button>
          <button
            onClick={() => jsonRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Upload size={16} /> Import backup JSON
          </button>
          <input
            ref={jsonRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleJson(f)
              reset(jsonRef.current)
            }}
          />
        </div>
      </section>
    </div>
  )
}

function ImportCard({
  icon,
  accent,
  title,
  body,
  onClick,
}: {
  icon: React.ReactNode
  accent: string
  title: string
  body: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-start rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-indigo-300 hover:shadow-sm"
    >
      <span className={`grid h-10 w-10 place-items-center rounded-lg ${accent}`}>
        {icon}
      </span>
      <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{body}</p>
      <span className="mt-3 flex items-center gap-1.5 text-sm font-medium text-indigo-600">
        <FileUp size={16} /> Choose CSV
      </span>
    </button>
  )
}

function PreviewPanel({
  pending,
  onCommit,
  onCancel,
}: {
  pending: Pending
  onCommit: () => void
  onCancel: () => void
}) {
  const { newContacts, merges, skipped } = pending.preview
  return (
    <section className="mt-6 animate-fade-in rounded-xl border border-indigo-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">
            Preview: {pending.fileName}
          </h3>
          <p className="text-sm text-slate-500">
            Review before saving. Nothing is stored until you confirm.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={onCommit}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Confirm import
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3 text-center">
        <Stat icon={<Check size={16} />} label="New" value={newContacts.length} color="text-emerald-600" />
        <Stat icon={<GitMerge size={16} />} label="Merged" value={merges.length} color="text-indigo-600" />
        <Stat icon={<Ban size={16} />} label="Skipped" value={skipped.length} color="text-slate-400" />
      </div>

      <div className="max-h-72 space-y-4 overflow-y-auto pr-1">
        {newContacts.length > 0 && (
          <PreviewGroup title="New contacts">
            {newContacts.map((c) => (
              <Row key={c.id} primary={c.name} secondary={c.email || c.professionOrBusiness} badge="new" />
            ))}
          </PreviewGroup>
        )}
        {merges.length > 0 && (
          <PreviewGroup title="Merged with existing">
            {merges.map((m) => (
              <Row
                key={m.existing.id}
                primary={m.merged.name}
                secondary={`${m.existing.source} + new → ${m.merged.source}`}
                badge="merge"
              />
            ))}
          </PreviewGroup>
        )}
        {skipped.length > 0 && (
          <PreviewGroup title="Skipped rows">
            {skipped.map((s, i) => (
              <Row key={i} primary={s.row.name || '(no name)'} secondary={s.reason} badge="skip" />
            ))}
          </PreviewGroup>
        )}
      </div>
    </section>
  )
}

function Stat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 py-3">
      <div className={`flex items-center justify-center gap-1.5 ${color}`}>
        {icon}
        <span className="text-xl font-bold">{value}</span>
      </div>
      <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
    </div>
  )
}

function PreviewGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h4>
      <ul className="space-y-1">{children}</ul>
    </div>
  )
}

const BADGE_STYLE: Record<string, string> = {
  new: 'bg-emerald-50 text-emerald-700',
  merge: 'bg-indigo-50 text-indigo-700',
  skip: 'bg-slate-100 text-slate-500',
}

function Row({
  primary,
  secondary,
  badge,
}: {
  primary: string
  secondary?: string
  badge: 'new' | 'merge' | 'skip'
}) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-800">{primary}</p>
        {secondary && <p className="truncate text-xs text-slate-500">{secondary}</p>}
      </div>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${BADGE_STYLE[badge]}`}>
        {badge}
      </span>
    </li>
  )
}
