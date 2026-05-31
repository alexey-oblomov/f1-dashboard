import { LABELS } from '@/constants'
import styles from './page.module.css'

export function HomePage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{LABELS.pageHome}</h1>
      <p className={styles.description}>{LABELS.pageHomeDescription}</p>
    </div>
  )
}
