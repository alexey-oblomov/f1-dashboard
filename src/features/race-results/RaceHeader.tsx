import { LABELS } from '@/constants'
import { formatRaceDate } from '@/lib/formatters'
import type { RaceResultsData } from '@/types'
import styles from './RaceHeader.module.css'

interface RaceHeaderProps {
  race: Pick<RaceResultsData, 'season' | 'round' | 'raceName' | 'date'>
}

export function RaceHeader({ race }: RaceHeaderProps) {
  const title = LABELS.raceHeaderTitle
    .replace('{round}', String(race.round))
    .replace('{raceName}', race.raceName)
    .replace('{season}', String(race.season))

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.date}>{formatRaceDate(race.date)}</p>
    </header>
  )
}
