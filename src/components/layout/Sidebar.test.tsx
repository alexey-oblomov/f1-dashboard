import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { LABELS } from '@/constants'
import { Sidebar } from './Sidebar'

describe('Sidebar', () => {
  it('calls onNavigate when link clicked', () => {
    const onNavigate = vi.fn()

    render(
      <MemoryRouter>
        <Sidebar isMobile isOpen onNavigate={onNavigate} />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('link', { name: LABELS.pageCalendar }))
    expect(onNavigate).toHaveBeenCalled()
  })
})
