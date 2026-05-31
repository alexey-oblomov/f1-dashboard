import { describe, it, expect } from 'vitest'
import { STANDINGS_TAB } from '@/constants'
import { resolveStandingsTab } from './standingsTab'

describe('resolveStandingsTab', () => {
  it('returns drivers by default', () => {
    expect(resolveStandingsTab(null)).toBe(STANDINGS_TAB.drivers)
  })

  it('returns constructors for valid param', () => {
    expect(resolveStandingsTab('constructors')).toBe(STANDINGS_TAB.constructors)
  })

  it('returns default for invalid param', () => {
    expect(resolveStandingsTab('invalid')).toBe(STANDINGS_TAB.drivers)
  })
})
