import { Link } from 'react-router-dom'
import { Card } from '@/components/ui'
import { LABELS, QUICK_LINKS, SEARCH_PARAMS } from '@/constants'
import styles from './QuickLinksGrid.module.css'

interface QuickLinksGridProps {
  season: number
}

export function QuickLinksGrid({ season }: QuickLinksGridProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{LABELS.quickLinksTitle}</h2>
      <div className={styles.grid}>
        {QUICK_LINKS.map((link) => {
          const to = `${link.path}?${SEARCH_PARAMS.season}=${season}`

          return (
            <Link key={link.id} to={to} className={styles.link}>
              <Card padding="md" className={styles.card}>
                <span className={styles.label}>{link.label}</span>
                <span className={styles.description}>{link.description}</span>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
