import { SummaryCard } from '@/components/ui'
import { LABELS } from '@/constants'
import { formatRaceDate } from '@/lib/formatters'
import type { ConstructorStanding, DriverStanding, Race, RaceResult } from '@/types'
import styles from './SummaryCardsGrid.module.css'

interface SummaryCardsGridProps {
  driverLeader: DriverStanding | null
  constructorLeader: ConstructorStanding | null
  nextRace: Race | null
  lastRace: Race | null
  raceWinner: RaceResult | null
  isDriverLoading?: boolean
  isConstructorLoading?: boolean
  isRacesLoading?: boolean
  isWinnerLoading?: boolean
}

export function SummaryCardsGrid({
  driverLeader,
  constructorLeader,
  nextRace,
  lastRace,
  raceWinner,
  isDriverLoading,
  isConstructorLoading,
  isRacesLoading,
  isWinnerLoading,
}: SummaryCardsGridProps) {
  const driverValue = driverLeader?.driverName ?? LABELS.noDriverLeader
  const driverMeta = driverLeader
    ? LABELS.summaryDriverMeta
        .replace('{points}', String(driverLeader.points))
        .replace('{constructor}', driverLeader.constructor)
    : undefined

  const constructorValue = constructorLeader?.name ?? LABELS.noConstructorLeader
  const constructorMeta = constructorLeader
    ? LABELS.summaryConstructorMeta
        .replace('{points}', String(constructorLeader.points))
        .replace('{wins}', String(constructorLeader.wins))
    : undefined

  const nextRaceValue = nextRace
    ? LABELS.summaryNextRaceRound
        .replace('{round}', String(nextRace.round))
        .replace('{raceName}', nextRace.name)
    : LABELS.noNextRace
  const nextRaceMeta = nextRace ? formatRaceDate(nextRace.date) : undefined

  const winnerValue = raceWinner?.driverName ?? LABELS.noLastRaceWinner
  const winnerMeta =
    lastRace && raceWinner
      ? LABELS.summaryLastRaceMeta
          .replace('{round}', String(lastRace.round))
          .replace('{raceName}', lastRace.name)
      : undefined

  return (
    <div className={styles.grid}>
      <SummaryCard
        title={LABELS.summaryDriverLeader}
        value={isDriverLoading ? '…' : driverValue}
        meta={!isDriverLoading ? driverMeta : undefined}
      />
      <SummaryCard
        title={LABELS.summaryConstructorLeader}
        value={isConstructorLoading ? '…' : constructorValue}
        meta={!isConstructorLoading ? constructorMeta : undefined}
      />
      <SummaryCard
        title={LABELS.summaryNextRace}
        value={isRacesLoading ? '…' : nextRaceValue}
        meta={!isRacesLoading ? nextRaceMeta : undefined}
      />
      <SummaryCard
        title={LABELS.summaryLastRaceWinner}
        value={isWinnerLoading ? '…' : winnerValue}
        meta={!isWinnerLoading ? winnerMeta : undefined}
      />
    </div>
  )
}
