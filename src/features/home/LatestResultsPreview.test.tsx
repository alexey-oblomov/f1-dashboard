import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { LABELS, RACE_STATUS } from '@/constants'
import type { RaceResult } from '@/types'
import { LatestResultsPreview } from './LatestResultsPreview'

const race = {
  season: 2024,
  round: 1,
  name: 'Bahrain Grand Prix',
  country: 'Bahrain',
  circuit: 'Bahrain International Circuit',
  date: '2024-03-02',
  status: RACE_STATUS.completed,
}

const results: RaceResult[] = [
  { position: 1, driverName: 'M. Verstappen', constructor: 'Red Bull', points: 25, status: 'Finished' },
  { position: 2, driverName: 'S. Pérez', constructor: 'Red Bull', points: 18, status: 'Finished' },
  { position: 3, driverName: 'C. Sainz', constructor: 'Ferrari', points: 15, status: 'Finished' },
]

describe('LatestResultsPreview', () => {
  it('renders top three results and full results link', () => {
    render(
      <MemoryRouter>
        <LatestResultsPreview race={race} results={results} />
      </MemoryRouter>,
    )

    expect(screen.getByText(LABELS.latestResultsTitle)).toBeInTheDocument()
    expect(screen.getByText(/Bahrain Grand Prix/)).toBeInTheDocument()
    expect(screen.getByText('M. Verstappen')).toBeInTheDocument()
    expect(screen.getByText('S. Pérez')).toBeInTheDocument()
    expect(screen.getByText('C. Sainz')).toBeInTheDocument()
    expect(screen.getByText(LABELS.viewFullResults)).toBeInTheDocument()
  })
})
