import { Button, Skeleton, Tabs, TabsList, TabsTrigger, TabsPanel } from '@/components/ui'
import { LABELS, STANDINGS_TAB } from '@/constants'
import { useConstructorStandings } from '@/hooks/useConstructorStandings'
import { useDriverStandings } from '@/hooks/useDriverStandings'
import { useStandingsTab } from '@/hooks/useStandingsTab'
import { ConstructorStandingsTable } from './ConstructorStandingsTable'
import { DriverStandingsTable } from './DriverStandingsTable'
import styles from './StandingsTabs.module.css'

interface StandingsTabsProps {
  season: number
}

function StandingsSkeleton() {
  return (
    <div className={styles.skeleton}>
      {Array.from({ length: 10 }, (_, index) => (
        <Skeleton key={index} height={40} />
      ))}
    </div>
  )
}

export function StandingsTabs({ season }: StandingsTabsProps) {
  const { tab, setTab } = useStandingsTab()

  const driversQuery = useDriverStandings(season, tab === STANDINGS_TAB.drivers)
  const constructorsQuery = useConstructorStandings(
    season,
    tab === STANDINGS_TAB.constructors,
  )

  const activeQuery = tab === STANDINGS_TAB.drivers ? driversQuery : constructorsQuery
  const { data, isLoading, isError, refetch } = activeQuery

  return (
    <Tabs value={tab} onChange={(value) => setTab(value as typeof tab)}>
      <TabsList>
        <TabsTrigger value={STANDINGS_TAB.drivers}>{LABELS.standingsTabDrivers}</TabsTrigger>
        <TabsTrigger value={STANDINGS_TAB.constructors}>
          {LABELS.standingsTabConstructors}
        </TabsTrigger>
      </TabsList>

      {isLoading && <StandingsSkeleton />}

      {isError && (
        <div className={styles.error}>
          <p>{LABELS.error}</p>
          <Button variant="secondary" onClick={() => refetch()}>
            {LABELS.retry}
          </Button>
        </div>
      )}

      {!isLoading && !isError && data?.length === 0 && (
        <p className={styles.empty}>{LABELS.noStandings}</p>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <>
          <TabsPanel value={STANDINGS_TAB.drivers} activeValue={tab}>
            <DriverStandingsTable standings={driversQuery.data ?? []} />
          </TabsPanel>

          <TabsPanel value={STANDINGS_TAB.constructors} activeValue={tab}>
            <ConstructorStandingsTable standings={constructorsQuery.data ?? []} />
          </TabsPanel>
        </>
      )}
    </Tabs>
  )
}
