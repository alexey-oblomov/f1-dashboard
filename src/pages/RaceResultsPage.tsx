import { Link, useParams } from 'react-router-dom'
import { Button, Skeleton } from '@/components/ui'
import { RaceHeader, ResultsTable } from '@/features/race-results'
import { LABELS, routePaths, SEARCH_PARAMS } from '@/constants'
import { useRaceResults } from '@/hooks/useRaceResults'
import { parseRaceRouteParams } from '@/lib/raceRouteParams'
import styles from './RaceResultsPage.module.css'

function ResultsSkeleton() {
  return (
    <div className={styles.skeleton}>
      <Skeleton height={32} width="60%" />
      <Skeleton height={20} width="30%" />
      {Array.from({ length: 10 }, (_, index) => (
        <Skeleton key={index} height={36} />
      ))}
    </div>
  )
}

export function RaceResultsPage() {
  const { season, round } = useParams<{ season: string; round: string }>()
  const params = parseRaceRouteParams(season, round)
  const { data, isLoading, isError, refetch } = useRaceResults(
    params?.season ?? 0,
    params?.round ?? 0,
  )

  if (!params) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>{LABELS.invalidRaceParams}</p>
        <Link to={routePaths.calendar()}>
          <Button variant="secondary">{LABELS.backToCalendar}</Button>
        </Link>
      </div>
    )
  }

  const calendarLink = `${routePaths.calendar()}?${SEARCH_PARAMS.season}=${params.season}`

  return (
    <div className={styles.page}>
      <Link to={calendarLink} className={styles.backLink}>
        {LABELS.backToCalendar}
      </Link>

      {isLoading && <ResultsSkeleton />}

      {isError && (
        <div className={styles.errorBlock}>
          <p>{LABELS.error}</p>
          <Button variant="secondary" onClick={() => refetch()}>
            {LABELS.retry}
          </Button>
        </div>
      )}

      {data && (
        <>
          <RaceHeader race={data} />
          {data.results.length === 0 ? (
            <p className={styles.empty}>{LABELS.noResults}</p>
          ) : (
            <ResultsTable results={data.results} />
          )}
        </>
      )}
    </div>
  )
}
