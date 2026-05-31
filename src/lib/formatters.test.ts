import { describe, it, expect } from 'vitest'
import { formatPoints, formatWins } from './formatters'

describe('formatPoints', () => {
  it('formats points with pts suffix', () => {
    expect(formatPoints(25)).toBe('25 pts')
    expect(formatPoints(0)).toBe('0 pts')
  })
})

describe('formatWins', () => {
  it('formats singular win', () => {
    expect(formatWins(1)).toBe('1 win')
  })

  it('formats plural wins', () => {
    expect(formatWins(6)).toBe('6 wins')
    expect(formatWins(0)).toBe('0 wins')
  })
})
