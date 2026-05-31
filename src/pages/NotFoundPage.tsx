import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { LABELS, routePaths } from '@/constants'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  return (
    <div className={styles.notFound}>
      <h1 className={styles.notFoundTitle}>{LABELS.notFoundTitle}</h1>
      <p className={styles.notFoundMessage}>{LABELS.notFoundMessage}</p>
      <Link to={routePaths.home()} className={styles.backLink}>
        <Button variant="primary">{LABELS.notFoundBack}</Button>
      </Link>
    </div>
  )
}
