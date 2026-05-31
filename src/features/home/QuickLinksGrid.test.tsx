import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { QuickLinksGrid } from './QuickLinksGrid'

describe('QuickLinksGrid', () => {
  it('renders quick links with season param', () => {
    render(
      <MemoryRouter>
        <QuickLinksGrid season={2024} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /Calendar/i })).toHaveAttribute(
      'href',
      '/calendar?season=2024',
    )
    expect(screen.getByRole('link', { name: /Standings/i })).toHaveAttribute(
      'href',
      '/standings?season=2024',
    )
    expect(screen.getByRole('link', { name: /Dashboard/i })).toHaveAttribute(
      'href',
      '/dashboard?season=2024',
    )
  })
})
