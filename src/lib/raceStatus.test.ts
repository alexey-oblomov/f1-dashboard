import { describe, it, expect } from 'vitest'
import { RACE_STATUS } from '@/constants'
import { getRaceStatus } from './raceStatus'

describe('getRaceStatus', () => {
  it('returns completed for past date', () => {
    expect(getRaceStatus('2020-01-01')).toBe(RACE_STATUS.completed)
  })

  it('returns upcoming for future date', () => {
    expect(getRaceStatus('2099-12-31')).toBe(RACE_STATUS.upcoming)
  })
})
