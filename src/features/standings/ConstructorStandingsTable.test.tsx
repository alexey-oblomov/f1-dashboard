import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CONSTRUCTOR_STANDINGS_TABLE_COLUMNS } from '@/constants'
import type { ConstructorStanding } from '@/types'
import { ConstructorStandingsTable } from './ConstructorStandingsTable'

const mockStandings: ConstructorStanding[] = [
  {
    position: 1,
    name: 'McLaren',
    points: 666,
    wins: 6,
  },
]

describe('ConstructorStandingsTable', () => {
  it('renders columns and standings row', () => {
    render(<ConstructorStandingsTable standings={mockStandings} />)

    expect(screen.getByText(CONSTRUCTOR_STANDINGS_TABLE_COLUMNS.team)).toBeInTheDocument()
    expect(screen.getByText('McLaren')).toBeInTheDocument()
    expect(screen.getByText('666')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
  })
})
