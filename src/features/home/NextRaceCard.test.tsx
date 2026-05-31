import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { LABELS, RACE_STATUS } from '@/constants'
import { NextRaceCard } from './NextRaceCard'

const race = {
  season: 2024,
  round: 2,
  name: 'Saudi Arabian Grand Prix',
  country: 'Saudi Arabia',
  circuit: 'Jeddah Corniche Circuit',
  date: '2099-01-01',
  status: RACE_STATUS.upcoming,
}

describe('NextRaceCard', () => {
  it('renders race info and calendar link', () => {
    render(
      <MemoryRouter>
        <NextRaceCard race={race} />
      </MemoryRouter>,
    )

    expect(screen.getByText(/Saudi Arabian Grand Prix/)).toBeInTheDocument()
    expect(screen.getByText(LABELS.nextRaceTitle)).toBeInTheDocument()
    expect(screen.getByText(LABELS.viewCalendar)).toBeInTheDocument()
    expect(screen.getByText('Jeddah Corniche Circuit')).toBeInTheDocument()
  })
})
