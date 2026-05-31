import { Badge, Button, Card, Skeleton } from '@/components/ui'
import styles from './App.module.css'

function App() {
  return (
    <main className={styles.sandbox}>
      <h1>F1 Dashboard — UI Kit</h1>

      <Card padding="md">
        <Badge variant="accent">Upcoming</Badge>
        <p className={styles.cardText}>Card content</p>
        <Skeleton height={20} />
      </Card>

      <div className={styles.buttonRow}>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary" size="sm">
          Secondary
        </Button>
        <Button variant="ghost">Ghost</Button>
        <Button disabled>Disabled</Button>
      </div>

      <div className={styles.badgeRow}>
        <Badge variant="default">Default</Badge>
        <Badge variant="success">Completed</Badge>
        <Badge variant="warning">In Progress</Badge>
        <Badge variant="error">Retired</Badge>
      </div>
    </main>
  )
}

export default App
