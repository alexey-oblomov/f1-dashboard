import { describe, it, expect } from 'vitest'
import { RACE_STATUS } from '@/constants'
import type { Race } from '@/types'
import { getLastCompletedRace, getNextRace } from './raceSchedule'

const makeRace = (overrides: Partial<Race> & Pick<Race, 'round' | 'date' | 'status'>): Race => ({
  season: 2024,
  name: `GP ${overrides.round}`,
  country: 'Test',
  circuit: 'Test Circuit',
  ...overrides,
})

describe('getNextRace', () => {
  it('returns earliest upcoming race', () => {
    const races = [
      makeRace({ round: 1, date: '2024-03-01', status: RACE_STATUS.completed }),
      makeRace({ round: 2, date: '2024-03-10', status: RACE_STATUS.upcoming }),
      makeRace({ round: 3, date: '2024-03-24', status: RACE_STATUS.upcoming }),
    ]
    expect(getNextRace(races)?.round).toBe(2)
  })

  it('returns null when no upcoming races', () => {
    const races = [makeRace({ round: 1, date: '2024-03-01', status: RACE_STATUS.completed })]
    expect(getNextRace(races)).toBeNull()
  })

  it('returns null for empty array', () => {
    expect(getNextRace([])).toBeNull()
  })
})

describe('getLastCompletedRace', () => {
  it('returns most recent completed race', () => {
    const races = [
      makeRace({ round: 1, date: '2024-03-01', status: RACE_STATUS.completed }),
      makeRace({ round: 2, date: '2024-03-10', status: RACE_STATUS.completed }),
      makeRace({ round: 3, date: '2024-03-24', status: RACE_STATUS.upcoming }),
    ]
    expect(getLastCompletedRace(races)?.round).toBe(2)
  })

  it('returns null when no completed races', () => {
    const races = [makeRace({ round: 1, date: '2024-03-01', status: RACE_STATUS.upcoming })]
    expect(getLastCompletedRace(races)).toBeNull()
  })
})
