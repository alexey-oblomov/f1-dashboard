import { cn } from '@/lib/utils'
import styles from './Card.module.css'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

const paddingClass = {
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
} as const

export function Card({ children, className, padding = 'md' }: CardProps) {
  return <div className={cn(styles.card, paddingClass[padding], className)}>{children}</div>
}
