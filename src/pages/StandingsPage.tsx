import { StandingsTabs } from '@/features/standings'
import { LABELS } from '@/constants'
import { useSeason } from '@/hooks/useSeason'
import styles from './StandingsPage.module.css'

export function StandingsPage() {
  const { season } = useSeason()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{LABELS.pageStandings}</h1>
      <StandingsTabs season={season} />
    </div>
  )
}
