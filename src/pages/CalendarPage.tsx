import { LABELS } from '@/constants'
import styles from './page.module.css'

export function CalendarPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{LABELS.pageCalendar}</h1>
      <p className={styles.description}>{LABELS.pageCalendarDescription}</p>
    </div>
  )
}
