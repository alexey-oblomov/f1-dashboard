import { describe, it, expect } from 'vitest'
import { LABELS } from '@/constants'
import { getCountdownParts } from './countdown'
import { formatCountdown } from './formatters'

describe('getCountdownParts', () => {
  it('returns isPast when target is in the past', () => {
    const target = new Date('2020-01-01T00:00:00')
    const now = new Date('2024-01-01T00:00:00')
    const parts = getCountdownParts(target, now)

    expect(parts.isPast).toBe(true)
  })

  it('returns isSoon when less than one hour remains', () => {
    const now = new Date('2024-01-01T10:00:00')
    const target = new Date('2024-01-01T10:30:00')
    const parts = getCountdownParts(target, now)

    expect(parts.isSoon).toBe(true)
    expect(parts.isPast).toBe(false)
  })

  it('calculates days hours and minutes', () => {
    const now = new Date('2024-01-01T00:00:00')
    const target = new Date('2024-01-06T03:20:00')
    const parts = getCountdownParts(target, now)

    expect(parts.days).toBe(5)
    expect(parts.hours).toBe(3)
    expect(parts.minutes).toBe(20)
    expect(parts.isPast).toBe(false)
    expect(parts.isSoon).toBe(false)
  })
})

describe('formatCountdown', () => {
  it('formats days hours and minutes', () => {
    const parts = {
      days: 5,
      hours: 3,
      minutes: 20,
      seconds: 0,
      isPast: false,
      isSoon: false,
    }
    expect(formatCountdown(parts)).toBe('5 days, 3 hours, 20 min')
  })

  it('returns countdownPast when race started', () => {
    expect(
      formatCountdown({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isPast: true,
        isSoon: false,
      }),
    ).toBe(LABELS.countdownPast)
  })

  it('returns countdownSoon when starting within an hour', () => {
    expect(
      formatCountdown({
        days: 0,
        hours: 0,
        minutes: 30,
        seconds: 0,
        isPast: false,
        isSoon: true,
      }),
    ).toBe(LABELS.countdownSoon)
  })
})
