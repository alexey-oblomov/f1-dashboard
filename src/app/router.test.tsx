import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LABELS, ROUTES } from '@/constants'
import { HomePage } from '@/pages/HomePage'

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

describe('routing', () => {
  it('renders HomePage at home route', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={[ROUTES.home]}>
        <Routes>
          <Route path={ROUTES.home} element={<HomePage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: LABELS.pageHome })).toBeInTheDocument()
  })
})
