import { useCallback, useEffect, useState } from 'react'
import type { Contact, ContactDraft, ImportPreview } from '../types'
import { loadContacts, newId, saveContacts } from '../lib/storage'
import { applyImport } from '../lib/csv'

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>(() => loadContacts())

  // Persist on every change.
  useEffect(() => {
    saveContacts(contacts)
  }, [contacts])

  const addContact = useCallback((draft: ContactDraft) => {
    const now = new Date().toISOString()
    const contact: Contact = {
      ...draft,
      id: newId(),
      createdAt: now,
      updatedAt: now,
    }
    setContacts((prev) => [...prev, contact])
    return contact
  }, [])

  const updateContact = useCallback((id: string, draft: ContactDraft) => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...draft, updatedAt: new Date().toISOString() }
          : c,
      ),
    )
  }, [])

  const deleteContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const commitImport = useCallback((preview: ImportPreview) => {
    setContacts((prev) => applyImport(prev, preview))
  }, [])

  const replaceAll = useCallback((next: Contact[]) => {
    setContacts(next)
  }, [])

  return {
    contacts,
    addContact,
    updateContact,
    deleteContact,
    commitImport,
    replaceAll,
  }
}
