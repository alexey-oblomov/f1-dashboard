import { describe, it, expect } from 'vitest'
import { parseRaceRouteParams } from './raceRouteParams'

describe('parseRaceRouteParams', () => {
  it('parses valid params', () => {
    expect(parseRaceRouteParams('2024', '1')).toEqual({ season: 2024, round: 1 })
  })

  it('returns null for missing season', () => {
    expect(parseRaceRouteParams(undefined, '1')).toBeNull()
  })

  it('returns null for missing round', () => {
    expect(parseRaceRouteParams('2024', undefined)).toBeNull()
  })

  it('returns null for invalid round', () => {
    expect(parseRaceRouteParams('2024', '0')).toBeNull()
  })

  it('returns null for non-numeric season', () => {
    expect(parseRaceRouteParams('foo', '1')).toBeNull()
  })

  it('returns null for season before 1950', () => {
    expect(parseRaceRouteParams('1949', '1')).toBeNull()
  })
})
