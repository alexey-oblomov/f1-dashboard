import { Button, Skeleton } from '@/components/ui'
import { RaceTable } from '@/features/calendar'
import { LABELS } from '@/constants'
import { useRaces } from '@/hooks/useRaces'
import { useSeason } from '@/hooks/useSeason'
import styles from './CalendarPage.module.css'

function CalendarSkeleton() {
  return (
    <div className={styles.skeleton}>
      {Array.from({ length: 8 }, (_, index) => (
        <Skeleton key={index} height={40} />
      ))}
    </div>
  )
}

export function CalendarPage() {
  const { season } = useSeason()
  const { data: races, isLoading, isError, refetch } = useRaces(season)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{LABELS.pageCalendar}</h1>

      {isLoading && <CalendarSkeleton />}

      {isError && (
        <div className={styles.error}>
          <p>{LABELS.error}</p>
          <Button variant="secondary" onClick={() => refetch()}>
            {LABELS.retry}
          </Button>
        </div>
      )}

      {!isLoading && !isError && races?.length === 0 && (
        <p className={styles.empty}>{LABELS.noRaces}</p>
      )}

      {!isLoading && !isError && races && races.length > 0 && <RaceTable races={races} />}
    </div>
  )
}
