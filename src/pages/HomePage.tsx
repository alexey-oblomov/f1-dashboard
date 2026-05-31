import { Button, Card, Skeleton } from '@/components/ui'
import { LatestResultsPreview, NextRaceCard, QuickLinksGrid } from '@/features/home'
import { LABELS } from '@/constants'
import { useRaceResults } from '@/hooks/useRaceResults'
import { useRaces } from '@/hooks/useRaces'
import { useSeason } from '@/hooks/useSeason'
import { getLastCompletedRace, getNextRace } from '@/lib/raceSchedule'
import styles from './HomePage.module.css'

function HomeSkeleton() {
  return (
    <div className={styles.grid}>
      <Skeleton height={200} />
      <Skeleton height={200} />
    </div>
  )
}

export function HomePage() {
  const { season } = useSeason()
  const { data: races, isLoading, isError, refetch } = useRaces(season)

  const nextRace = races ? getNextRace(races) : null
  const lastRace = races ? getLastCompletedRace(races) : null

  const {
    data: resultsData,
    isLoading: resultsLoading,
    isError: resultsError,
  } = useRaceResults(lastRace?.season ?? 0, lastRace?.round ?? 0)

  const results = lastRace ? (resultsData?.results ?? []) : []
  const subtitle = LABELS.homeSeasonOverview.replace('{season}', String(season))

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{LABELS.pageHome}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </header>

      {isLoading && <HomeSkeleton />}

      {isError && (
        <div className={styles.error}>
          <p>{LABELS.error}</p>
          <Button variant="secondary" onClick={() => refetch()}>
            {LABELS.retry}
          </Button>
        </div>
      )}

      {!isLoading && !isError && races && (
        <>
          <div className={styles.grid}>
            {nextRace ? (
              <NextRaceCard race={nextRace} />
            ) : (
              <Card className={styles.emptyCard}>
                <h2 className={styles.cardTitle}>{LABELS.nextRaceTitle}</h2>
                <p>{LABELS.noUpcomingRace}</p>
              </Card>
            )}

            {lastRace ? (
              <LatestResultsPreview
                race={lastRace}
                results={results}
                isLoading={resultsLoading}
                isError={resultsError}
              />
            ) : (
              <Card className={styles.emptyCard}>
                <h2 className={styles.cardTitle}>{LABELS.latestResultsTitle}</h2>
                <p>{LABELS.noCompletedRace}</p>
              </Card>
            )}
          </div>

          <QuickLinksGrid season={season} />
        </>
      )}
    </div>
  )
}
