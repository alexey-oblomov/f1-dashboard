import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BADGE_LABELS, RACE_STATUS } from '@/constants'
import { RaceStatusBadge } from './RaceStatusBadge'

describe('RaceStatusBadge', () => {
  it('renders completed label', () => {
    render(<RaceStatusBadge status={RACE_STATUS.completed} />)
    expect(screen.getByText(BADGE_LABELS[RACE_STATUS.completed])).toBeInTheDocument()
  })

  it('renders upcoming label', () => {
    render(<RaceStatusBadge status={RACE_STATUS.upcoming} />)
    expect(screen.getByText(BADGE_LABELS[RACE_STATUS.upcoming])).toBeInTheDocument()
  })
})
