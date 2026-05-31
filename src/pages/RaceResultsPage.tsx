import { useParams } from 'react-router-dom'
import { LABELS } from '@/constants'
import styles from './page.module.css'

export function RaceResultsPage() {
  const { season, round } = useParams<{ season: string; round: string }>()

  const meta = LABELS.pageRaceResultsMeta
    .replace('{season}', season ?? '—')
    .replace('{round}', round ?? '—')

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{LABELS.pageRaceResults}</h1>
      <p className={styles.meta}>{meta}</p>
    </div>
  )
}
