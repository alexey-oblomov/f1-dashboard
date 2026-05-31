import { LABELS } from '@/constants'
import { SeasonSelector } from '@/features/calendar'
import styles from './Header.module.css'

interface HeaderProps {
  isMobile?: boolean
  isMenuOpen?: boolean
  onMenuToggle?: () => void
}

export function Header({ isMobile, isMenuOpen, onMenuToggle }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          {LABELS.appLogo}
        </span>
        <span className={styles.title}>{LABELS.appTitle}</span>
      </div>

      <div className={styles.actions}>
        {isMobile && (
          <button
            type="button"
            className={styles.menuButton}
            onClick={onMenuToggle}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? LABELS.menuClose : LABELS.menuOpen}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        )}
        <SeasonSelector />
      </div>
    </header>
  )
}
