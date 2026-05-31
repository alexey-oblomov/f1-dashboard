import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DRIVER_STANDINGS_TABLE_COLUMNS } from '@/constants'
import type { DriverStanding } from '@/types'
import { DriverStandingsTable } from './DriverStandingsTable'

const mockStandings: DriverStanding[] = [
  {
    position: 1,
    driverName: 'M. Verstappen',
    constructor: 'Red Bull',
    points: 437,
    wins: 9,
  },
]

describe('DriverStandingsTable', () => {
  it('renders columns and standings row', () => {
    render(<DriverStandingsTable standings={mockStandings} />)

    expect(screen.getByText(DRIVER_STANDINGS_TABLE_COLUMNS.driver)).toBeInTheDocument()
    expect(screen.getByText('M. Verstappen')).toBeInTheDocument()
    expect(screen.getByText('437')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
  })
})
