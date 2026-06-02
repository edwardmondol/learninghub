import { useEffect, useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import type { Category, Contact, ContactDraft, Source } from '../types'
import { parseTags } from '../lib/csv'

interface ContactFormProps {
  /** When provided, the form edits this contact; otherwise it creates a new one. */
  contact: Contact | null
  onSave: (draft: ContactDraft) => void
  onDelete?: () => void
  onClose: () => void
}

const EMPTY: ContactDraft = {
  name: '',
  professionOrBusiness: '',
  phone: '',
  email: '',
  website: '',
  category: 'Professional',
  source: 'Manual',
  collaborationNotes: '',
  tags: [],
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
const labelClass = 'mb-1 block text-xs font-semibold text-slate-600'

export default function ContactForm({
  contact,
  onSave,
  onDelete,
  onClose,
}: ContactFormProps) {
  const [draft, setDraft] = useState<ContactDraft>(EMPTY)
  const [tagsText, setTagsText] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (contact) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = contact
      setDraft(rest)
      setTagsText(contact.tags.join(', '))
    } else {
      setDraft(EMPTY)
      setTagsText('')
    }
    setError('')
  }, [contact])

  const set = <K extends keyof ContactDraft>(key: K, value: ContactDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.name.trim()) {
      setError('Name is required.')
      return
    }
    onSave({ ...draft, name: draft.name.trim(), tags: parseTags(tagsText) })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="my-8 w-full max-w-lg animate-fade-in rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {contact ? 'Edit contact' : 'New contact'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className={labelClass}>Name *</label>
            <input
              className={inputClass}
              value={draft.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Jane Doe"
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>Profession / Business</label>
            <input
              className={inputClass}
              value={draft.professionOrBusiness}
              onChange={(e) => set('professionOrBusiness', e.target.value)}
              placeholder="Founder @ Acme Inc."
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Email</label>
              <input
                className={inputClass}
                value={draft.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                className={inputClass}
                value={draft.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+1 ..."
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Website / Profile URL</label>
            <input
              className={inputClass}
              value={draft.website}
              onChange={(e) => set('website', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Category *</label>
              <select
                className={inputClass}
                value={draft.category}
                onChange={(e) => set('category', e.target.value as Category)}
              >
                <option value="Professional">Professional</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Source</label>
              <select
                className={inputClass}
                value={draft.source}
                onChange={(e) => set('source', e.target.value as Source)}
              >
                <option value="Manual">Manual</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Luma">Luma</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Tags (comma separated)</label>
            <input
              className={inputClass}
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="EdTech, AI, funding, Edmonton"
            />
          </div>

          <div>
            <label className={labelClass}>Collaboration notes</label>
            <textarea
              className={`${inputClass} min-h-[90px] resize-y`}
              value={draft.collaborationNotes}
              onChange={(e) => set('collaborationNotes', e.target.value)}
              placeholder="Shared interests, common ground, potential projects..."
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex items-center justify-between gap-3">
          {contact && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} /> Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              {contact ? 'Save changes' : 'Add contact'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
