// Core domain types for the Daily Decision Desk.

export type Quadrant = 'inbox' | 'do' | 'decide' | 'delegate' | 'delete'

export interface Task {
  id: string // crypto.randomUUID()
  title: string
  note?: string
  quadrant: Quadrant // new tasks start in 'inbox'
  done: boolean
  createdAt: number
}

// Static metadata describing each of the four matrix quadrants.
export interface QuadrantMeta {
  key: Exclude<Quadrant, 'inbox'>
  title: string
  verb: string
  subtitle: string
  accent: string
  focus: boolean // part of today's focus?
}

export const QUADRANTS: QuadrantMeta[] = [
  {
    key: 'do',
    title: 'Do',
    verb: 'Act now',
    subtitle: 'Important · Urgent',
    accent: '#b14a3b',
    focus: true,
  },
  {
    key: 'decide',
    title: 'Decide',
    verb: 'Schedule it',
    subtitle: 'Important · Not urgent',
    accent: '#2f6b54',
    focus: true,
  },
  {
    key: 'delegate',
    title: 'Delegate',
    verb: 'Hand it off',
    subtitle: 'Not important · Urgent',
    accent: '#b3852a',
    focus: false,
  },
  {
    key: 'delete',
    title: 'Delete',
    verb: 'Let it go',
    subtitle: 'Not important · Not urgent',
    accent: '#8a8276',
    focus: false,
  },
]
