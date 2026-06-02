import { useMemo, useState } from 'react'
import { Sparkles, Users, ChevronDown } from 'lucide-react'
import type { Contact } from '../types'

interface CollaborationViewProps {
  contacts: Contact[]
  onEdit: (contact: Contact) => void
}

interface Cluster {
  tag: string
  members: Contact[]
}

export default function CollaborationView({
  contacts,
  onEdit,
}: CollaborationViewProps) {
  const [openTag, setOpenTag] = useState<string | null>(null)

  const clusters = useMemo<Cluster[]>(() => {
    const map = new Map<string, Contact[]>()
    for (const c of contacts) {
      for (const tag of c.tags) {
        const key = tag.toLowerCase()
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(c)
      }
    }
    return [...map.entries()]
      .map(([key, members]) => ({
        // use the first-seen original casing for display
        tag: members[0].tags.find((t) => t.toLowerCase() === key) ?? key,
        members,
      }))
      .filter((c) => c.members.length >= 2)
      .sort((a, b) => b.members.length - a.members.length)
  }, [contacts])

  const taggedCount = useMemo(
    () => contacts.filter((c) => c.tags.length > 0).length,
    [contacts],
  )

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Sparkles size={22} className="text-indigo-500" />
          Collaboration Opportunities
        </h2>
        <p className="text-sm text-slate-500">
          Contacts grouped by shared tags. Clusters of 2+ people surface
          potential collaborators around a common theme or project.
        </p>
      </header>

      {clusters.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h3 className="text-lg font-semibold text-slate-800">
            No clusters yet
          </h3>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            {taggedCount === 0
              ? 'Add tags to your contacts (e.g. "AI", "EdTech", "funding") to surface shared interests.'
              : 'No tag is shared by 2 or more contacts yet. Add the same tag to related contacts to form a cluster.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {clusters.map((cluster) => {
            const open = openTag === cluster.tag
            return (
              <div
                key={cluster.tag}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <button
                  onClick={() => setOpenTag(open ? null : cluster.tag)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-sm font-semibold text-indigo-700">
                      {cluster.tag}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <Users size={14} />
                      {cluster.members.length} contacts
                    </span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
                  />
                </button>

                {open && (
                  <ul className="grid grid-cols-1 gap-2 border-t border-slate-100 p-3 sm:grid-cols-2">
                    {cluster.members.map((c) => (
                      <li
                        key={c.id}
                        onClick={() => onEdit(c)}
                        className="cursor-pointer rounded-lg border border-slate-100 bg-slate-50 p-3 transition hover:border-indigo-200 hover:bg-white"
                      >
                        <p className="font-medium text-slate-800">{c.name}</p>
                        {c.professionOrBusiness && (
                          <p className="truncate text-xs text-slate-500">
                            {c.professionOrBusiness}
                          </p>
                        )}
                        {c.collaborationNotes && (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                            {c.collaborationNotes}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {c.tags.map((t) => (
                            <span
                              key={t}
                              className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                t.toLowerCase() === cluster.tag.toLowerCase()
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
