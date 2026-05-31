import { cn } from '@/lib/utils'
import styles from './Badge.module.css'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'accent'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return <span className={cn(styles.badge, styles[variant], className)}>{children}</span>
}
