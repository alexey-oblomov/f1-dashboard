import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LABELS } from '@/constants'
import { SummaryCardsGrid } from './SummaryCardsGrid'

describe('SummaryCardsGrid', () => {
  it('renders summary cards with leader data', () => {
    render(
      <SummaryCardsGrid
        driverLeader={{
          position: 1,
          driverName: 'M. Verstappen',
          constructor: 'Red Bull',
          points: 437,
          wins: 9,
        }}
        constructorLeader={{
          position: 1,
          name: 'McLaren',
          points: 666,
          wins: 6,
        }}
        nextRace={null}
        lastRace={null}
        raceWinner={null}
      />,
    )

    expect(screen.getByText(LABELS.summaryDriverLeader)).toBeInTheDocument()
    expect(screen.getByText('M. Verstappen')).toBeInTheDocument()
    expect(screen.getByText(LABELS.summaryConstructorLeader)).toBeInTheDocument()
    expect(screen.getByText('McLaren')).toBeInTheDocument()
  })
})
