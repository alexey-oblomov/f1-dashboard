import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SummaryCard } from './SummaryCard'

describe('SummaryCard', () => {
  it('renders title, value and meta', () => {
    render(
      <SummaryCard title="Driver Leader" value="M. Verstappen" meta="437 pts · Red Bull" />,
    )

    expect(screen.getByText('Driver Leader')).toBeInTheDocument()
    expect(screen.getByText('M. Verstappen')).toBeInTheDocument()
    expect(screen.getByText('437 pts · Red Bull')).toBeInTheDocument()
  })
})
