import { describe, it, expect } from 'vitest'
import { mapConstructorChartData, mapDriverChartData } from './chartData'

describe('mapDriverChartData', () => {
  it('returns top N drivers', () => {
    const standings = Array.from({ length: 15 }, (_, index) => ({
      position: index + 1,
      driverName: `Driver ${index + 1}`,
      constructor: 'Team',
      points: 100 - index,
      wins: 0,
    }))

    const result = mapDriverChartData(standings, 10)

    expect(result).toHaveLength(10)
    expect(result[0].points).toBe(100)
    expect(result[0].name).toBe('Driver 1')
  })
})

describe('mapConstructorChartData', () => {
  it('returns top N constructors', () => {
    const standings = Array.from({ length: 12 }, (_, index) => ({
      position: index + 1,
      name: `Team ${index + 1}`,
      points: 200 - index * 10,
      wins: index,
    }))

    const result = mapConstructorChartData(standings, 10)

    expect(result).toHaveLength(10)
    expect(result[0].name).toBe('Team 1')
    expect(result[0].points).toBe(200)
  })
})
