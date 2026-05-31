import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LABELS } from '@/constants'
import { DriverPointsChart } from './DriverPointsChart'

describe('DriverPointsChart', () => {
  it('renders empty state when no data', () => {
    render(<DriverPointsChart data={[]} />)

    expect(screen.getByText(LABELS.chartDriverPointsTitle)).toBeInTheDocument()
    expect(screen.getByText(LABELS.chartNoData)).toBeInTheDocument()
  })

  it('renders loading placeholder', () => {
    render(<DriverPointsChart data={[]} isLoading />)

    expect(screen.getByText(LABELS.chartDriverPointsTitle)).toBeInTheDocument()
    expect(screen.queryByText(LABELS.chartNoData)).not.toBeInTheDocument()
  })
})
