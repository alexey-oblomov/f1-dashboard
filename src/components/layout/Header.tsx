import { LABELS } from '@/constants'
import { SeasonSelector } from '@/features/calendar'
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
        <SeasonSelector />
      </div>
    </header>
  )
}
