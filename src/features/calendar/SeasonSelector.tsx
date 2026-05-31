import { Select } from '@/components/ui'
import { LABELS, type Season } from '@/constants'
import { useSeason } from '@/hooks/useSeason'
import styles from './SeasonSelector.module.css'

export function SeasonSelector() {
  const { season, setSeason, availableSeasons } = useSeason()

  const options = availableSeasons.map((year) => ({
    value: String(year),
    label: String(year),
  }))

  return (
    <div className={styles.wrapper}>
      <Select
        label={LABELS.seasonSelector}
        options={options}
        value={String(season)}
        onChange={(event) => setSeason(Number(event.target.value) as Season)}
        aria-label={LABELS.seasonSelector}
      />
    </div>
  )
}
