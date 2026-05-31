import { NavLink, useSearchParams } from 'react-router-dom'
import { NAV_ITEMS, ROUTES } from '@/constants'
import { cn } from '@/lib/utils'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const [searchParams] = useSearchParams()
  const searchString = searchParams.toString()
  const search = searchString ? `?${searchString}` : ''

  return (
    <nav className={styles.sidebar} aria-label="Main navigation">
      <ul className={styles.list}>
        {NAV_ITEMS.map((item) => (
          <li key={item.path}>
            <NavLink
              to={{ pathname: item.path, search }}
              className={({ isActive }) => cn(styles.link, isActive && styles.active)}
              end={item.path === ROUTES.home}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
