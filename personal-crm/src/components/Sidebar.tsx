import { Users, Upload, Sparkles, Contact2 } from 'lucide-react'

export type View = 'contacts' | 'import' | 'collaboration'

interface SidebarProps {
  view: View
  onChange: (view: View) => void
  contactCount: number
}

const NAV: { id: View; label: string; icon: typeof Users }[] = [
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'import', label: 'Import', icon: Upload },
  { id: 'collaboration', label: 'Collaboration', icon: Sparkles },
]

export default function Sidebar({ view, onChange, contactCount }: SidebarProps) {
  return (
    <aside className="flex shrink-0 flex-col gap-1 border-b border-slate-200 bg-white px-4 py-4 md:h-screen md:w-64 md:border-b-0 md:border-r md:px-4 md:py-6">
      <div className="mb-2 flex items-center gap-2 px-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
          <Contact2 size={20} />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight text-slate-900">
            Personal CRM
          </h1>
          <p className="text-xs text-slate-500">{contactCount} contacts</p>
        </div>
      </div>

      <nav className="flex gap-1 md:mt-2 md:flex-col">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = view === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:flex-none ${
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      <p className="mt-auto hidden px-2 text-[11px] leading-relaxed text-slate-400 md:block">
        Data is stored locally in your browser. Use Import to add LinkedIn or
        Luma exports, and back up regularly.
      </p>
    </aside>
  )
}
