import { LABELS } from '@/constants'
import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          {LABELS.appLogo}
        </span>
        <span className={styles.title}>{LABELS.appTitle}</span>
      </div>

      <div className={styles.actions}>
        <label className={styles.seasonLabel}>
          <span>{LABELS.seasonSelector}</span>
          <select
            className={styles.seasonSelect}
            disabled
            defaultValue={LABELS.seasonSelectorPlaceholder}
            aria-label={LABELS.seasonSelector}
          >
            <option value={LABELS.seasonSelectorPlaceholder}>
              {LABELS.seasonSelectorPlaceholder}
            </option>
          </select>
        </label>
      </div>
    </header>
  )
}
