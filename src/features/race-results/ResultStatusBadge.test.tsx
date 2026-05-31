import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { RESULT_STATUS } from '@/constants'
import { ResultStatusBadge } from './ResultStatusBadge'

describe('ResultStatusBadge', () => {
  it('renders Finished status', () => {
    render(<ResultStatusBadge status={RESULT_STATUS.finished} />)
    expect(screen.getByText(RESULT_STATUS.finished)).toBeInTheDocument()
  })

  it('renders Retired status', () => {
    render(<ResultStatusBadge status={RESULT_STATUS.retired} />)
    expect(screen.getByText(RESULT_STATUS.retired)).toBeInTheDocument()
  })
})
