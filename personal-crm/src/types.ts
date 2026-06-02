export type Category = 'Personal' | 'Professional'
export type Source = 'LinkedIn' | 'Luma' | 'Manual'

export interface Contact {
  id: string
  name: string
  professionOrBusiness: string
  phone: string
  email: string
  website: string
  category: Category
  source: Source
  collaborationNotes: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

/** Shape used when adding/editing through the form (no system fields). */
export type ContactDraft = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>

/** Result of analysing an import batch against existing contacts. */
export interface ImportPreview {
  /** Brand new contacts that will be created. */
  newContacts: Contact[]
  /** Pairs of existing + incoming that will be merged. */
  merges: { existing: Contact; incoming: Contact; merged: Contact }[]
  /** Rows that could not be used (e.g. missing a name). */
  skipped: { row: Record<string, string>; reason: string }[]
}
