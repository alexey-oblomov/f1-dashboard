import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LABELS } from '@/constants'
import { Header } from './Header'

vi.mock('@/features/calendar', () => ({
  SeasonSelector: () => <div>SeasonSelector</div>,
}))

describe('Header', () => {
  it('renders menu button with open label when menu is open', () => {
    const onMenuToggle = vi.fn()

    render(<Header isMobile isMenuOpen onMenuToggle={onMenuToggle} />)

    const menuButton = screen.getByRole('button', { name: LABELS.menuClose })
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(menuButton)
    expect(onMenuToggle).toHaveBeenCalled()
  })

  it('renders menu button with closed label when menu is closed', () => {
    render(<Header isMobile isMenuOpen={false} onMenuToggle={vi.fn()} />)

    expect(screen.getByRole('button', { name: LABELS.menuOpen })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })
})
