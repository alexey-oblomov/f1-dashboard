import { describe, it, expect } from 'vitest'
import { RESULT_STATUS } from '@/constants'
import { getResultStatusVariant } from './resultStatus'

describe('getResultStatusVariant', () => {
  it('returns success for Finished', () => {
    expect(getResultStatusVariant(RESULT_STATUS.finished)).toBe('success')
  })

  it('returns error for Retired', () => {
    expect(getResultStatusVariant(RESULT_STATUS.retired)).toBe('error')
  })

  it('returns error for Disqualified', () => {
    expect(getResultStatusVariant(RESULT_STATUS.disqualified)).toBe('error')
  })

  it('returns warning for +1 Lap', () => {
    expect(getResultStatusVariant(RESULT_STATUS.plusLap)).toBe('warning')
  })

  it('returns warning for +2 Laps', () => {
    expect(getResultStatusVariant('+2 Laps')).toBe('warning')
  })

  it('returns default for unknown status', () => {
    expect(getResultStatusVariant('Unknown')).toBe('default')
  })
})
