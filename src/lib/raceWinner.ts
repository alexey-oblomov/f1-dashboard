import type { RaceResult } from '@/types'

export function getRaceWinner(results: RaceResult[]): RaceResult | null {
  return results.find((result) => result.position === 1) ?? null
}
