import { describe, it, expect } from 'vitest'
import { getRaceWinner } from './raceWinner'

describe('getRaceWinner', () => {
  it('returns position 1 driver', () => {
    const results = [
      {
        position: 1,
        driverName: 'M. Verstappen',
        constructor: 'Red Bull',
        points: 25,
        status: 'Finished',
      },
      {
        position: 2,
        driverName: 'L. Norris',
        constructor: 'McLaren',
        points: 18,
        status: 'Finished',
      },
    ]

    expect(getRaceWinner(results)?.driverName).toBe('M. Verstappen')
  })

  it('returns null when no winner', () => {
    expect(getRaceWinner([])).toBeNull()
  })
})
