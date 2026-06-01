import type { Quadrant } from './types'

// Pure helper implementing the Eisenhower model:
//   important + urgent      -> do
//   important + not urgent  -> decide
//   not important + urgent  -> delegate
//   neither                 -> delete
export function classify(important: boolean, urgent: boolean): Quadrant {
  if (important && urgent) return 'do'
  if (important && !urgent) return 'decide'
  if (!important && urgent) return 'delegate'
  return 'delete'
}
