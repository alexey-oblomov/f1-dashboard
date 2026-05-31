import { RACE_STATUS } from '@/constants'
import type { Race } from '@/types'

export function getNextRace(races: Race[]): Race | null {
  const upcoming = races
    .filter((race) => race.status === RACE_STATUS.upcoming)
    .sort((a, b) => a.date.localeCompare(b.date) || a.round - b.round)

  return upcoming[0] ?? null
}

export function getLastCompletedRace(races: Race[]): Race | null {
  const completed = races
    .filter((race) => race.status === RACE_STATUS.completed)
    .sort((a, b) => b.date.localeCompare(a.date) || b.round - a.round)

  return completed[0] ?? null
}
