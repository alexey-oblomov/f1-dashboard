import { describe, it, expect } from 'vitest'
import { DEFAULT_SEASON } from '@/constants'
import { parseSeason, resolveSeason } from '@/lib/season'
import { formatRaceDate } from '@/lib/formatters'

describe('parseSeason', () => {
  it('returns season for valid value', () => {
    expect(parseSeason('2024')).toBe(2024)
  })

  it('returns null for invalid value', () => {
    expect(parseSeason('1999')).toBeNull()
  })

  it('returns null for empty value', () => {
    expect(parseSeason(null)).toBeNull()
  })
})

describe('resolveSeason', () => {
  it('falls back to default season', () => {
    expect(resolveSeason(null)).toBe(DEFAULT_SEASON)
  })
})

describe('formatRaceDate', () => {
  it('formats ISO date', () => {
    expect(formatRaceDate('2024-03-02')).toBe('2 Mar 2024')
  })
})
