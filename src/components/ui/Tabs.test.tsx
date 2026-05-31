import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Tabs, TabsList, TabsTrigger, TabsPanel } from './Tabs'

describe('Tabs', () => {
  it('shows active panel and calls onChange when trigger clicked', () => {
    const onChange = vi.fn()

    render(
      <Tabs value="a" onChange={onChange}>
        <TabsList>
          <TabsTrigger value="a">Tab A</TabsTrigger>
          <TabsTrigger value="b">Tab B</TabsTrigger>
        </TabsList>
        <TabsPanel value="a" activeValue="a">
          Content A
        </TabsPanel>
        <TabsPanel value="b" activeValue="a">
          Content B
        </TabsPanel>
      </Tabs>,
    )

    expect(screen.getByText('Content A')).toBeVisible()
    expect(screen.queryByText('Content B')).not.toBeVisible()

    fireEvent.click(screen.getByText('Tab B'))
    expect(onChange).toHaveBeenCalledWith('b')
  })
})
