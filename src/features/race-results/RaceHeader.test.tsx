import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { RaceHeader } from './RaceHeader'

describe('RaceHeader', () => {
  it('renders title from race data', () => {
    render(
      <RaceHeader
        race={{ season: 2024, round: 1, raceName: 'Bahrain Grand Prix', date: '2024-03-02' }}
      />,
    )
    expect(screen.getByRole('heading')).toHaveTextContent('Round 1 — Bahrain Grand Prix 2024')
  })
})
