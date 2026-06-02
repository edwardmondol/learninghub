import { useState } from 'react'
import Sidebar, { type View } from './components/Sidebar'
import ContactsView from './components/ContactsView'
import ImportView from './components/ImportView'
import CollaborationView from './components/CollaborationView'
import ContactForm from './components/ContactForm'
import { useContacts } from './hooks/useContacts'
import type { Contact, ContactDraft } from './types'

export default function App() {
  const {
    contacts,
    addContact,
    updateContact,
    deleteContact,
    commitImport,
    replaceAll,
  } = useContacts()

  const [view, setView] = useState<View>('contacts')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)

  const openNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (contact: Contact) => {
    setEditing(contact)
    setFormOpen(true)
  }

  const handleSave = (draft: ContactDraft) => {
    if (editing) updateContact(editing.id, draft)
    else addContact(draft)
    setFormOpen(false)
    setEditing(null)
  }

  const handleDelete = () => {
    if (!editing) return
    if (
      window.confirm(
        `Delete "${editing.name}"? This cannot be undone.`,
      )
    ) {
      deleteContact(editing.id)
      setFormOpen(false)
      setEditing(null)
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar view={view} onChange={setView} contactCount={contacts.length} />

      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 md:h-screen">
        {view === 'contacts' && (
          <ContactsView
            contacts={contacts}
            onNew={openNew}
            onEdit={openEdit}
          />
        )}
        {view === 'import' && (
          <ImportView
            contacts={contacts}
            onCommit={commitImport}
            onReplaceAll={replaceAll}
          />
        )}
        {view === 'collaboration' && (
          <CollaborationView contacts={contacts} onEdit={openEdit} />
        )}
      </main>

      {formOpen && (
        <ContactForm
          contact={editing}
          onSave={handleSave}
          onDelete={editing ? handleDelete : undefined}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}
