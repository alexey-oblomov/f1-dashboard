import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LABELS, ROUTES } from '@/constants'
import { HomePage } from '@/pages/HomePage'

describe('routing', () => {
  it('renders HomePage at home route', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.home]}>
        <Routes>
          <Route path={ROUTES.home} element={<HomePage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: LABELS.pageHome })).toBeInTheDocument()
  })
})
