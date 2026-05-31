import { Link } from 'react-router-dom'
import { Card, Button, Skeleton } from '@/components/ui'
import { LABELS, routePaths } from '@/constants'
import type { Race, RaceResult } from '@/types'
import styles from './LatestResultsPreview.module.css'

interface LatestResultsPreviewProps {
  race: Race
  results: RaceResult[]
  isLoading?: boolean
  isError?: boolean
}

export function LatestResultsPreview({
  race,
  results,
  isLoading,
  isError,
}: LatestResultsPreviewProps) {
  const header = LABELS.latestResultsHeader
    .replace('{round}', String(race.round))
    .replace('{raceName}', race.name)

  const resultsLink = routePaths.raceResults(race.season, race.round)
  const topThree = results.slice(0, 3)

  return (
    <Card className={styles.card}>
      <h2 className={styles.title}>{LABELS.latestResultsTitle}</h2>
      <p className={styles.header}>{header}</p>

      {isLoading && (
        <div className={styles.skeleton}>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} height={24} />
          ))}
        </div>
      )}

      {isError && <p className={styles.empty}>{LABELS.noLatestResults}</p>}

      {!isLoading && !isError && topThree.length === 0 && (
        <p className={styles.empty}>{LABELS.noLatestResults}</p>
      )}

      {!isLoading && !isError && topThree.length > 0 && (
        <ol className={styles.list}>
          {topThree.map((result) => (
            <li key={result.position} className={styles.item}>
              <span className={styles.position}>{result.position}.</span>
              <span className={styles.driver}>{result.driverName}</span>
              <span className={styles.points}>{result.points} pts</span>
            </li>
          ))}
        </ol>
      )}

      {!isLoading && !isError && topThree.length > 0 && (
        <Link to={resultsLink}>
          <Button variant="secondary">{LABELS.viewFullResults}</Button>
        </Link>
      )}
    </Card>
  )
}
