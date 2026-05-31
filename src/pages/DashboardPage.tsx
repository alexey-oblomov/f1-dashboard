import { Button, Skeleton } from '@/components/ui'
import {
  ConstructorPointsChart,
  DriverPointsChart,
  SummaryCardsGrid,
} from '@/features/dashboard'
import { LABELS } from '@/constants'
import { useConstructorStandings } from '@/hooks/useConstructorStandings'
import { useDriverStandings } from '@/hooks/useDriverStandings'
import { useRaceResults } from '@/hooks/useRaceResults'
import { useRaces } from '@/hooks/useRaces'
import { useSeason } from '@/hooks/useSeason'
import { mapConstructorChartData, mapDriverChartData } from '@/lib/chartData'
import { getLastCompletedRace, getNextRace } from '@/lib/raceSchedule'
import { getRaceWinner } from '@/lib/raceWinner'
import styles from './DashboardPage.module.css'

function DashboardSkeleton() {
  return (
    <div className={styles.skeleton}>
      <Skeleton height={100} />
      <Skeleton height={100} />
      <Skeleton height={100} />
      <Skeleton height={100} />
      <Skeleton height={300} />
      <Skeleton height={300} />
    </div>
  )
}

export function DashboardPage() {
  const { season } = useSeason()

  const racesQuery = useRaces(season)
  const driversQuery = useDriverStandings(season)
  const constructorsQuery = useConstructorStandings(season)

  const races = racesQuery.data
  const nextRace = races ? getNextRace(races) : null
  const lastRace = races ? getLastCompletedRace(races) : null

  const resultsQuery = useRaceResults(lastRace?.season ?? 0, lastRace?.round ?? 0)
  const raceWinner = lastRace ? getRaceWinner(resultsQuery.data?.results ?? []) : null

  const driverChartData = driversQuery.data ? mapDriverChartData(driversQuery.data) : []
  const constructorChartData = constructorsQuery.data
    ? mapConstructorChartData(constructorsQuery.data)
    : []

  const isInitialLoading =
    racesQuery.isLoading && driversQuery.isLoading && constructorsQuery.isLoading

  const hasError =
    racesQuery.isError || driversQuery.isError || constructorsQuery.isError

  const refetchAll = () => {
    void racesQuery.refetch()
    void driversQuery.refetch()
    void constructorsQuery.refetch()
    void resultsQuery.refetch()
  }

  const subtitle = LABELS.dashboardSeasonSummary.replace('{season}', String(season))

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{LABELS.pageDashboard}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </header>

      {isInitialLoading && <DashboardSkeleton />}

      {hasError && (
        <div className={styles.error}>
          <p>{LABELS.error}</p>
          <Button variant="secondary" onClick={refetchAll}>
            {LABELS.retry}
          </Button>
        </div>
      )}

      {!isInitialLoading && !hasError && (
        <>
          <SummaryCardsGrid
            driverLeader={driversQuery.data?.[0] ?? null}
            constructorLeader={constructorsQuery.data?.[0] ?? null}
            nextRace={nextRace}
            lastRace={lastRace}
            raceWinner={raceWinner}
            isDriverLoading={driversQuery.isLoading}
            isConstructorLoading={constructorsQuery.isLoading}
            isRacesLoading={racesQuery.isLoading}
            isWinnerLoading={!!lastRace && resultsQuery.isLoading}
          />

          <div className={styles.charts}>
            <DriverPointsChart data={driverChartData} isLoading={driversQuery.isLoading} />
            <ConstructorPointsChart
              data={constructorChartData}
              isLoading={constructorsQuery.isLoading}
            />
          </div>
        </>
      )}
    </div>
  )
}
