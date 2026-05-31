import { Link } from 'react-router-dom'
import { Card, Button } from '@/components/ui'
import { LABELS, routePaths, SEARCH_PARAMS } from '@/constants'
import { useCountdown } from '@/hooks/useCountdown'
import { formatCountdown, formatRaceDate } from '@/lib/formatters'
import type { Race } from '@/types'
import styles from './NextRaceCard.module.css'

interface NextRaceCardProps {
  race: Race
}

export function NextRaceCard({ race }: NextRaceCardProps) {
  const countdownParts = useCountdown(race.date, race.time)
  const countdown = formatCountdown(countdownParts)

  const calendarLink = `${routePaths.calendar()}?${SEARCH_PARAMS.season}=${race.season}`

  return (
    <Card className={styles.card}>
      <h2 className={styles.title}>{LABELS.nextRaceTitle}</h2>
      <p className={styles.raceName}>
        Round {race.round} — {race.name}
      </p>
      <p className={styles.meta}>{formatRaceDate(race.date)}</p>
      <p className={styles.meta}>{race.circuit}</p>
      <p className={styles.meta}>{race.country}</p>
      <p className={styles.countdown} aria-live="polite">
        {countdown}
      </p>
      <Link to={calendarLink}>
        <Button variant="secondary">{LABELS.viewCalendar}</Button>
      </Link>
    </Card>
  )
}
