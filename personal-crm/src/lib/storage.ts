import type { Contact } from '../types'

const STORAGE_KEY = 'personal-crm:contacts:v1'

export function loadContacts(): Contact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as Contact[]
  } catch (err) {
    console.error('Failed to load contacts from localStorage', err)
    return []
  }
}

export function saveContacts(contacts: Contact[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
  } catch (err) {
    console.error('Failed to save contacts to localStorage', err)
  }
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
