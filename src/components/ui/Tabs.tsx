import { createContext, useContext } from 'react'
import { cn } from '@/lib/utils'
import styles from './Tabs.module.css'

interface TabsContextValue {
  value: string
  onChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within Tabs')
  }
  return context
}

interface TabsProps {
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function Tabs({ value, onChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div role="tablist" className={cn(styles.list, className)}>
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const { value: activeValue, onChange } = useTabsContext()
  const isActive = activeValue === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-active={isActive}
      className={cn(styles.trigger, className)}
      onClick={() => onChange(value)}
    >
      {children}
    </button>
  )
}

interface TabsPanelProps {
  value: string
  activeValue: string
  children: React.ReactNode
  className?: string
}

export function TabsPanel({ value, activeValue, children, className }: TabsPanelProps) {
  const isActive = value === activeValue

  return (
    <div role="tabpanel" hidden={!isActive} className={cn(styles.panel, className)}>
      {children}
    </div>
  )
}
