import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { LABELS, MEDIA_QUERIES } from '@/constants'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const isMobile = useMediaQuery(MEDIA_QUERIES.mdDown)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)
  const isMenuVisible = isMobile && isMenuOpen

  return (
    <div className={styles.layout}>
      <Header
        isMobile={isMobile}
        isMenuOpen={isMenuVisible}
        onMenuToggle={() => setIsMenuOpen((open) => !open)}
      />
      <div className={styles.body}>
        <Sidebar isMobile={isMobile} isOpen={isMenuVisible} onNavigate={closeMenu} />
        {isMenuVisible && (
          <button
            type="button"
            className={styles.backdrop}
            aria-label={LABELS.menuClose}
            onClick={closeMenu}
          />
        )}
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
