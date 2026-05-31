import { cn } from '@/lib/utils'
import styles from './Table.module.css'

interface TableProps {
  children: React.ReactNode
  className?: string
}

export function Table({ children, className }: TableProps) {
  return <table className={cn(styles.table, className)}>{children}</table>
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className={styles.head}>{children}</thead>
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className={styles.body}>{children}</tbody>
}

interface TableRowProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  onKeyDown?: React.KeyboardEventHandler<HTMLTableRowElement>
  role?: React.AriaRole
  tabIndex?: number
}

export function TableRow({
  children,
  className,
  onClick,
  onKeyDown,
  role,
  tabIndex,
}: TableRowProps) {
  return (
    <tr
      className={cn(styles.row, className)}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={role}
      tabIndex={tabIndex}
    >
      {children}
    </tr>
  )
}

export function TableHeaderCell({ children }: { children: React.ReactNode }) {
  return <th className={styles.headerCell}>{children}</th>
}

export function TableCell({ children }: { children: React.ReactNode }) {
  return <td className={styles.cell}>{children}</td>
}
