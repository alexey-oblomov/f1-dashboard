import { Card } from './Card'
import { cn } from '@/lib/utils'
import styles from './SummaryCard.module.css'

interface SummaryCardProps {
  title: string
  value: string
  meta?: string
  className?: string
}

export function SummaryCard({ title, value, meta, className }: SummaryCardProps) {
  return (
    <Card padding="md" className={cn(styles.card, className)}>
      <p className={styles.title}>{title}</p>
      <p className={styles.value}>{value}</p>
      {meta && <p className={styles.meta}>{meta}</p>}
    </Card>
  )
}
