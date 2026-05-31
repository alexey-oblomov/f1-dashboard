import { LABELS } from '@/constants'
import styles from './page.module.css'

export function StandingsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{LABELS.pageStandings}</h1>
      <p className={styles.description}>{LABELS.pageStandingsDescription}</p>
    </div>
  )
}
