# F1 Dashboard — Фаза 6: Главная

> Подробный пошаговый план домашней страницы с обзором сезона.
>
> Связанные документы:
> - [project-description.md](./project-description.md) — раздел Home, компоненты и данные
> - [development-plan.md](./development-plan.md) — общий план MVP и все фазы
> - [phase-1-api-layer.md](./phase-1-api-layer.md) — API-слой, `getRaces`, `getRaceResults`
> - [phase-3-calendar.md](./phase-3-calendar.md) — `useSeason`, `useRaces`, `formatRaceDate`
> - [phase-4-race-results.md](./phase-4-race-results.md) — `useRaceResults`, `RaceResultsData`
> - [phase-5-standings.md](./phase-5-standings.md) — паттерн feature folder, loading/error/empty

**Оценка:** 2–3 часа  
**Цель фазы:** страница `/` показывает обзор выбранного сезона — ближайшая гонка с countdown, топ-3 последней завершённой гонки и quick links на основные разделы.

---

## Содержание

1. [Предварительные требования](#1-предварительные-требования)
2. [Обзор фазы](#2-обзор-фазы)
3. [Архитектура](#3-архитектура)
4. [6.0 — Константы](#60--константы)
5. [6.1 — Утилиты getNextRace / getLastCompletedRace](#61--утилиты-getnextrace--getlastcompletedrace)
6. [6.2 — Countdown: formatCountdown + useCountdown](#62--countdown-formatcountdown--usecountdown)
7. [6.3 — NextRaceCard](#63--nextracecard)
8. [6.4 — LatestResultsPreview](#64--latestresultspreview)
9. [6.5 — QuickLinksGrid](#65--quicklinksgrid)
10. [6.6 — HomePage](#66--homepage)
11. [6.7 — SeasonSelector (переиспользование)](#67--seasonselector-переиспользование)
12. [6.8 — Тесты](#68--тесты)
13. [6.9 — Проверка и приёмка фазы](#69--проверка-и-приёмка-фазы)
14. [Итоговая структура файлов](#итоговая-структура-файлов)
15. [Чеклист задач](#чеклист-задач)

---

## 1. Предварительные требования

Фазы 0–5 должны быть завершены:

| Критерий | Проверка |
|----------|----------|
| API `getRaces(season)` | `@/api/endpoints/races.ts` |
| API `getRaceResults(season, round)` | `@/api/endpoints/results.ts` |
| Типы `Race`, `RaceResult`, `RaceResultsData` | `@/types` |
| `RACE_STATUS`, `getRaceStatus` | `@/constants`, `@/lib/raceStatus.ts` |
| `useSeason`, `useRaces`, `useRaceResults` | `@/hooks` |
| `formatRaceDate` | `@/lib/formatters.ts` |
| UI `Card`, `Button`, `Skeleton` | `components/ui/` |
| `routePaths`, `SEARCH_PARAMS` | `@/constants` |
| Season selector в Header | `@/features/calendar/SeasonSelector` |
| Sidebar сохраняет query params | `Sidebar.tsx` |
| Маршрут `/` | `ROUTES.home` |
| `pnpm test` / `pnpm build` | проходят |

---

## 2. Обзор фазы

### Что делаем

| # | Задача | Результат |
|---|--------|-----------|
| 6.0 | Константы: `QUICK_LINKS`, home labels | Без magic strings |
| 6.1 | `getNextRace`, `getLastCompletedRace` | Pure functions + tests |
| 6.2 | `formatCountdown`, `useCountdown` | Live countdown до гонки |
| 6.3 | `NextRaceCard` | Карточка ближайшей гонки |
| 6.4 | `LatestResultsPreview` | Топ-3 последней гонки |
| 6.5 | `QuickLinksGrid` | Ссылки Calendar / Standings / Dashboard |
| 6.6 | `HomePage` | Сборка + loading / error / empty |

### Что **не** делаем

- Dashboard charts (Фаза 7)
- Summary cards с лидерами (Фаза 7 — переиспользует те же данные)
- Responsive hamburger (Фаза 8)
- Live timing / real-time race data
- Qualifying preview
- Driver/team detail pages

### UX — Home Page

```
┌─────────────────────────────────────────────────────────────┐
│  Home                                    [Season: 2024 ▼]   │
│  2024 Season Overview                                       │
│                                                             │
│  ┌─────────────────────────┐  ┌───────────────────────────┐ │
│  │ Next Race               │  │ Latest Results            │ │
│  │ Round 24 — Abu Dhabi GP │  │ Round 23 — Las Vegas GP   │ │
│  │ 8 Dec 2024              │  │ 1. M. Verstappen — 25 pts│ │
│  │ Yas Marina Circuit      │  │ 2. L. Norris — 18 pts    │ │
│  │ UAE                     │  │ 3. C. Leclerc — 15 pts   │ │
│  │                         │  │                           │ │
│  │ 12 days, 4 hours        │  │ [View Full Results →]     │ │
│  │ [View Calendar →]       │  │                           │ │
│  └─────────────────────────┘  └───────────────────────────┘ │
│                                                             │
│  Quick Links                                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Calendar  │  │ Standings  │  │ Dashboard  │             │
│  │  All races │  │  Points    │  │  Charts    │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

URL-пример: `/?season=2024`

### Блоки страницы

| Блок | Источник данных | Условие показа |
|------|-----------------|----------------|
| Next Race | `getRaces` → `getNextRace` | Есть upcoming гонка |
| Latest Results | `getRaces` → `getLastCompletedRace` → `getRaceResults` | Есть completed гонка + results |
| Quick Links | Статика + `season` из URL | Всегда (после загрузки races) |

---

## 3. Архитектура

### Поток данных

```
/?season=2024
  → useSeason() → season: 2024
  → useRaces(2024)
       → queryKey: ['races', 2024]
       → Race[]
  → getNextRace(races) → Race | null
  → getLastCompletedRace(races) → Race | null
  → useRaceResults(lastRace.season, lastRace.round, enabled: !!lastRace)
       → RaceResultsData
  → HomePage
       ├── NextRaceCard(nextRace)
       ├── LatestResultsPreview(lastRace, results.slice(0, 3))
       └── QuickLinksGrid(season)
```

### Feature folder

```
src/features/home/
├── NextRaceCard.tsx
├── NextRaceCard.module.css
├── LatestResultsPreview.tsx
├── LatestResultsPreview.module.css
├── QuickLinksGrid.tsx
├── QuickLinksGrid.module.css
└── index.ts
```

### Hooks / lib

```
src/lib/
├── raceSchedule.ts           # getNextRace, getLastCompletedRace
├── raceSchedule.test.ts
├── countdown.ts              # formatCountdown, getRaceDateTime
└── countdown.test.ts

src/hooks/
└── useCountdown.ts           # live tick каждую секунду
```

### Принципы

| Принцип | Решение |
|---------|---------|
| Сезон в URL | `?season=2026` через `useSeason` — как Calendar / Standings |
| Страница тонкая | `HomePage` — hooks + derived data + feature components |
| Утилиты чистые | `getNextRace` / `getLastCompletedRace` — без React, тестируемые |
| Статус гонки | Фильтрация через `RACE_STATUS.*`, не пересчёт дат |
| Results lazy | `useRaceResults` только если есть `lastCompletedRace` |
| Countdown | `useCountdown` с `setInterval` — обновление каждую секунду |
| Quick links | Ссылки с `?season={season}` для сохранения контекста |
| Карточки | UI `Card` из `components/ui/` |
| Empty states | Отдельные сообщения для «нет upcoming» / «нет completed» |

---

## 6.0 — Константы

### Новые / обновляемые файлы

```
src/constants/
├── quickLinks.ts       # NEW — QUICK_LINKS
├── labels.ts           # UPDATE — home labels
└── index.ts            # UPDATE
```

### `src/constants/quickLinks.ts`

```typescript
import { LABELS } from './labels'
import { ROUTES } from './routes'

export const QUICK_LINKS = [
  {
    id: 'calendar',
    label: LABELS.pageCalendar,
    description: LABELS.quickLinkCalendarDescription,
    path: ROUTES.calendar,
  },
  {
    id: 'standings',
    label: LABELS.pageStandings,
    description: LABELS.quickLinkStandingsDescription,
    path: ROUTES.standings,
  },
  {
    id: 'dashboard',
    label: LABELS.pageDashboard,
    description: LABELS.quickLinkDashboardDescription,
    path: ROUTES.dashboard,
  },
] as const

export type QuickLinkId = (typeof QUICK_LINKS)[number]['id']
```

### Дополнить `src/constants/labels.ts`

```typescript
export const LABELS = {
  // ...existing
  homeSeasonOverview: '{season} Season Overview',
  nextRaceTitle: 'Next Race',
  latestResultsTitle: 'Latest Results',
  latestResultsHeader: 'Round {round} — {raceName}',
  noUpcomingRace: 'No upcoming races this season.',
  noCompletedRace: 'No completed races yet.',
  noLatestResults: 'Results not available.',
  viewCalendar: 'View Calendar',
  viewFullResults: 'View Full Results',
  quickLinksTitle: 'Quick Links',
  quickLinkCalendarDescription: 'All races',
  quickLinkStandingsDescription: 'Driver & constructor points',
  quickLinkDashboardDescription: 'Charts & summary',
  countdownDays: '{days} days',
  countdownHours: '{hours} hours',
  countdownMinutes: '{minutes} min',
  countdownSoon: 'Starting soon',
  countdownPast: 'Race started',
} as const
```

> Countdown labels — шаблоны для сборки строки в `formatCountdown`.  
> Альтернатива: одна строка `countdownFormat: '{days} days, {hours} hours'` — проще для MVP.

**Рекомендация для MVP:** одна константа-шаблон:

```typescript
countdownFormat: '{days} days, {hours} hours, {minutes} min',
```

### Barrel — `src/constants/index.ts`

```typescript
export { QUICK_LINKS, type QuickLinkId } from './quickLinks'
```

### Критерий готовности

- [ ] Quick links — `QUICK_LINKS` с labels из `LABELS`
- [ ] Тексты карточек и empty states — в `LABELS`, не в JSX

---

## 6.1 — Утилиты getNextRace / getLastCompletedRace

### Файл: `src/lib/raceSchedule.ts`

```typescript
import { RACE_STATUS } from '@/constants'
import type { Race } from '@/types'

export function getNextRace(races: Race[]): Race | null {
  const upcoming = races
    .filter((race) => race.status === RACE_STATUS.upcoming)
    .sort((a, b) => a.date.localeCompare(b.date) || a.round - b.round)

  return upcoming[0] ?? null
}

export function getLastCompletedRace(races: Race[]): Race | null {
  const completed = races
    .filter((race) => race.status === RACE_STATUS.completed)
    .sort((a, b) => b.date.localeCompare(a.date) || b.round - a.round)

  return completed[0] ?? null
}
```

### Логика

| Функция | Фильтр | Сортировка | Результат |
|---------|--------|------------|-----------|
| `getNextRace` | `status === upcoming` | date ASC, round ASC | Ближайшая будущая |
| `getLastCompletedRace` | `status === completed` | date DESC, round DESC | Последняя прошедшая |

> Используем `race.status` из mapper (через `getRaceStatus`), а не пересчитываем даты — консистентно с Calendar.

### Edge cases

| Сценарий | `getNextRace` | `getLastCompletedRace` |
|----------|---------------|------------------------|
| Пустой массив | `null` | `null` |
| Все гонки completed (конец сезона) | `null` | последняя гонка |
| Сезон не начался (все upcoming) | первая гонка | `null` |
| Одна гонка сегодня (date === today) | upcoming (date >= today) | не completed |

### Unit-тесты — `src/lib/raceSchedule.test.ts`

```typescript
import { RACE_STATUS } from '@/constants'
import type { Race } from '@/types'
import { getNextRace, getLastCompletedRace } from './raceSchedule'

const makeRace = (overrides: Partial<Race> & Pick<Race, 'round' | 'date' | 'status'>): Race => ({
  season: 2024,
  name: `GP ${overrides.round}`,
  country: 'Test',
  circuit: 'Test Circuit',
  ...overrides,
})

describe('getNextRace', () => {
  it('returns earliest upcoming race', () => {
    const races = [
      makeRace({ round: 1, date: '2024-03-01', status: RACE_STATUS.completed }),
      makeRace({ round: 2, date: '2024-03-10', status: RACE_STATUS.upcoming }),
      makeRace({ round: 3, date: '2024-03-24', status: RACE_STATUS.upcoming }),
    ]
    expect(getNextRace(races)?.round).toBe(2)
  })

  it('returns null when no upcoming races', () => {
    const races = [
      makeRace({ round: 1, date: '2024-03-01', status: RACE_STATUS.completed }),
    ]
    expect(getNextRace(races)).toBeNull()
  })
})

describe('getLastCompletedRace', () => {
  it('returns most recent completed race', () => {
    const races = [
      makeRace({ round: 1, date: '2024-03-01', status: RACE_STATUS.completed }),
      makeRace({ round: 2, date: '2024-03-10', status: RACE_STATUS.completed }),
      makeRace({ round: 3, date: '2024-03-24', status: RACE_STATUS.upcoming }),
    ]
    expect(getLastCompletedRace(races)?.round).toBe(2)
  })
})
```

---

## 6.2 — Countdown: formatCountdown + useCountdown

### Файл: `src/lib/countdown.ts`

```typescript
export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
  isSoon: boolean
}

export function getRaceDateTime(date: string, time?: string): Date {
  if (time) {
    return new Date(`${date}T${time}`)
  }
  return new Date(`${date}T00:00:00`)
}

export function getCountdownParts(target: Date, now = new Date()): CountdownParts {
  const diffMs = target.getTime() - now.getTime()
  const isPast = diffMs <= 0
  const isSoon = !isPast && diffMs < 60 * 60 * 1000 // < 1 hour

  if (isPast) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, isSoon: false }
  }

  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, isPast: false, isSoon }
}
```

### `formatCountdown` — дополнить `src/lib/formatters.ts` или отдельный файл

```typescript
import { LABELS } from '@/constants'
import { getCountdownParts, type CountdownParts } from './countdown'

export function formatCountdown(parts: CountdownParts): string {
  if (parts.isPast) return LABELS.countdownPast
  if (parts.isSoon) return LABELS.countdownSoon

  return LABELS.countdownFormat
    .replace('{days}', String(parts.days))
    .replace('{hours}', String(parts.hours))
    .replace('{minutes}', String(parts.minutes))
}
```

### Файл: `src/hooks/useCountdown.ts`

```typescript
import { useEffect, useState } from 'react'
import { getCountdownParts, getRaceDateTime } from '@/lib/countdown'

export function useCountdown(date: string, time?: string) {
  const target = getRaceDateTime(date, time)

  const [parts, setParts] = useState(() => getCountdownParts(target))

  useEffect(() => {
    const tick = () => setParts(getCountdownParts(target))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [date, time])

  return parts
}
```

> `target` в dependency array через `date` + `time` — достаточно для MVP.

### Критерий готовности

- [ ] Countdown обновляется каждую секунду
- [ ] Прошедшая гонка → `LABELS.countdownPast`
- [ ] < 1 час → `LABELS.countdownSoon`

---

## 6.3 — NextRaceCard

### Файл: `src/features/home/NextRaceCard.tsx`

```typescript
import { Link } from 'react-router-dom'
import { Card, Button } from '@/components/ui'
import { LABELS, routePaths, SEARCH_PARAMS } from '@/constants'
import { useCountdown } from '@/hooks/useCountdown'
import { formatCountdown, formatRaceDate } from '@/lib/formatters'
import type { Race } from '@/types'
import styles from './NextRaceCard.module.css'

interface NextRaceCardProps {
  race: Race
}

export function NextRaceCard({ race }: NextRaceCardProps) {
  const countdownParts = useCountdown(race.date, race.time)
  const countdown = formatCountdown(countdownParts)

  const calendarLink = `${routePaths.calendar()}?${SEARCH_PARAMS.season}=${race.season}`

  return (
    <Card className={styles.card}>
      <h2 className={styles.title}>{LABELS.nextRaceTitle}</h2>
      <p className={styles.raceName}>
        Round {race.round} — {race.name}
      </p>
      <p className={styles.meta}>{formatRaceDate(race.date)}</p>
      <p className={styles.meta}>{race.circuit}</p>
      <p className={styles.meta}>{race.country}</p>
      <p className={styles.countdown} aria-live="polite">
        {countdown}
      </p>
      <Link to={calendarLink}>
        <Button variant="secondary">{LABELS.viewCalendar}</Button>
      </Link>
    </Card>
  )
}
```

> **Round в заголовке:** для MVP inline `Round {race.round}` допустимо; позже — шаблон `LABELS.nextRaceHeader` = `'Round {round} — {raceName}'`.

### Empty state — отдельный компонент или inline в HomePage

```typescript
// NextRaceCardEmpty.tsx — или prop empty в HomePage
<Card>
  <h2>{LABELS.nextRaceTitle}</h2>
  <p>{LABELS.noUpcomingRace}</p>
</Card>
```

### `NextRaceCard.module.css` (скетч)

```css
.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.title {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.raceName {
  font-size: var(--font-size-base);
  font-weight: 500;
}

.meta {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.countdown {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-accent);
  margin: var(--space-2) 0;
}
```

---

## 6.4 — LatestResultsPreview

### Файл: `src/features/home/LatestResultsPreview.tsx`

```typescript
import { Link } from 'react-router-dom'
import { Card, Button, Skeleton } from '@/components/ui'
import { LABELS, routePaths } from '@/constants'
import type { Race, RaceResult } from '@/types'
import styles from './LatestResultsPreview.module.css'

interface LatestResultsPreviewProps {
  race: Race
  results: RaceResult[]
  isLoading?: boolean
  isError?: boolean
}

export function LatestResultsPreview({
  race,
  results,
  isLoading,
  isError,
}: LatestResultsPreviewProps) {
  const header = LABELS.latestResultsHeader
    .replace('{round}', String(race.round))
    .replace('{raceName}', race.name)

  const resultsLink = routePaths.raceResults(race.season, race.round)
  const topThree = results.slice(0, 3)

  return (
    <Card className={styles.card}>
      <h2 className={styles.title}>{LABELS.latestResultsTitle}</h2>
      <p className={styles.header}>{header}</p>

      {isLoading && (
        <div className={styles.skeleton}>
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} height={24} />
          ))}
        </div>
      )}

      {isError && <p className={styles.empty}>{LABELS.noLatestResults}</p>}

      {!isLoading && !isError && topThree.length === 0 && (
        <p className={styles.empty}>{LABELS.noLatestResults}</p>
      )}

      {!isLoading && !isError && topThree.length > 0 && (
        <ol className={styles.list}>
          {topThree.map((result) => (
            <li key={result.position} className={styles.item}>
              <span className={styles.position}>{result.position}.</span>
              <span className={styles.driver}>{result.driverName}</span>
              <span className={styles.points}>{result.points} pts</span>
            </li>
          ))}
        </ol>
      )}

      {!isLoading && !isError && topThree.length > 0 && (
        <Link to={resultsLink}>
          <Button variant="secondary">{LABELS.viewFullResults}</Button>
        </Link>
      )}
    </Card>
  )
}
```

### Формат строки результата

```
1. M. Verstappen — 25 pts
```

Шаблон (опционально в constants):

```typescript
latestResultRow: '{position}. {driver} — {points} pts',
```

---

## 6.5 — QuickLinksGrid

### Файл: `src/features/home/QuickLinksGrid.tsx`

```typescript
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
```

### `QuickLinksGrid.module.css`

```css
.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.title {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.link {
  text-decoration: none;
  color: inherit;
}

.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  transition: border-color 0.15s;
}

.link:hover .card {
  border-color: var(--color-accent);
}

.label {
  font-weight: 600;
}

.description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
```

> Responsive `grid-template-columns: 1fr` на mobile — опционально (Фаза 8).

### Barrel — `src/features/home/index.ts`

```typescript
export { NextRaceCard } from './NextRaceCard'
export { LatestResultsPreview } from './LatestResultsPreview'
export { QuickLinksGrid } from './QuickLinksGrid'
```

---

## 6.6 — HomePage

### Файл: `src/pages/HomePage.tsx`

```typescript
import { Button, Card, Skeleton } from '@/components/ui'
import {
  LatestResultsPreview,
  NextRaceCard,
  QuickLinksGrid,
} from '@/features/home'
import { LABELS } from '@/constants'
import { useRaceResults } from '@/hooks/useRaceResults'
import { useRaces } from '@/hooks/useRaces'
import { useSeason } from '@/hooks/useSeason'
import { getLastCompletedRace, getNextRace } from '@/lib/raceSchedule'
import styles from './HomePage.module.css'

function HomeSkeleton() {
  return (
    <div className={styles.grid}>
      <Skeleton height={200} />
      <Skeleton height={200} />
    </div>
  )
}

export function HomePage() {
  const { season } = useSeason()
  const { data: races, isLoading, isError, refetch } = useRaces(season)

  const nextRace = races ? getNextRace(races) : null
  const lastRace = races ? getLastCompletedRace(races) : null

  const {
    data: resultsData,
    isLoading: resultsLoading,
    isError: resultsError,
  } = useRaceResults(lastRace?.season ?? 0, lastRace?.round ?? 0)

  const resultsEnabled = !!lastRace
  const results = resultsEnabled ? (resultsData?.results ?? []) : []

  const subtitle = LABELS.homeSeasonOverview.replace('{season}', String(season))

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{LABELS.pageHome}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </header>

      {isLoading && <HomeSkeleton />}

      {isError && (
        <div className={styles.error}>
          <p>{LABELS.error}</p>
          <Button variant="secondary" onClick={() => refetch()}>
            {LABELS.retry}
          </Button>
        </div>
      )}

      {!isLoading && !isError && races && (
        <>
          <div className={styles.grid}>
            {nextRace ? (
              <NextRaceCard race={nextRace} />
            ) : (
              <Card className={styles.emptyCard}>
                <h2 className={styles.cardTitle}>{LABELS.nextRaceTitle}</h2>
                <p>{LABELS.noUpcomingRace}</p>
              </Card>
            )}

            {lastRace ? (
              <LatestResultsPreview
                race={lastRace}
                results={results}
                isLoading={resultsLoading}
                isError={resultsError}
              />
            ) : (
              <Card className={styles.emptyCard}>
                <h2 className={styles.cardTitle}>{LABELS.latestResultsTitle}</h2>
                <p>{LABELS.noCompletedRace}</p>
              </Card>
            )}
          </div>

          <QuickLinksGrid season={season} />
        </>
      )}
    </div>
  )
}
```

> **useRaceResults enabled:** хук уже имеет `enabled: season > 0 && round > 0` — при `lastRace === null` передаём `0, 0`, запрос не уйдёт.

### `HomePage.module.css`

```css
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  color: var(--color-text-secondary);
}

.emptyCard {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.cardTitle {
  font-size: var(--font-size-lg);
  font-weight: 600;
}
```

### Удалить placeholder

Убрать `pageHomeDescription` («coming soon») из UI.

---

## 6.7 — SeasonSelector (переиспользование)

**Изменений в Header не требуется.**

### Проверки синхронизации

| # | Сценарий | Ожидание |
|---|----------|----------|
| 1 | `/calendar?season=2024` → Home | `/?season=2024` |
| 2 | Смена сезона на Home | Next race / latest results обновляются |
| 3 | Quick link → Calendar | `?season=` сохраняется |

---

## 6.8 — Тесты

### Минимальный набор

| Файл | Что проверяет |
|------|---------------|
| `lib/raceSchedule.test.ts` | `getNextRace`, `getLastCompletedRace` |
| `lib/countdown.test.ts` | `getCountdownParts`, `formatCountdown` |
| `features/home/NextRaceCard.test.tsx` | рендер race info + countdown |
| `features/home/LatestResultsPreview.test.tsx` | топ-3 + link |
| `features/home/QuickLinksGrid.test.tsx` | 3 links с season param |

### Пример — NextRaceCard

```typescript
import { MemoryRouter } from 'react-router-dom'
import { RACE_STATUS } from '@/constants'
import { NextRaceCard } from './NextRaceCard'

const race = {
  season: 2024,
  round: 2,
  name: 'Saudi Arabian Grand Prix',
  country: 'Saudi Arabia',
  circuit: 'Jeddah Corniche Circuit',
  date: '2099-01-01',
  status: RACE_STATUS.upcoming,
}

render(
  <MemoryRouter>
    <NextRaceCard race={race} />
  </MemoryRouter>,
)

expect(screen.getByText(/Saudi Arabian Grand Prix/)).toBeInTheDocument()
expect(screen.getByText(LABELS.viewCalendar)).toBeInTheDocument()
```

> Дата в будущем — countdown не `countdownPast`.

### Пример — QuickLinksGrid

```typescript
render(
  <MemoryRouter>
    <QuickLinksGrid season={2024} />
  </MemoryRouter>,
)

expect(screen.getByRole('link', { name: /Calendar/i })).toHaveAttribute(
  'href',
  '/calendar?season=2024',
)
```

### Пример — formatCountdown

```typescript
it('formats days and hours', () => {
  const parts = { days: 5, hours: 3, minutes: 20, seconds: 0, isPast: false, isSoon: false }
  expect(formatCountdown(parts)).toBe('5 days, 3 hours, 20 min')
})
```

---

## 6.9 — Проверка и приёмка фазы

### Smoke-тесты

```bash
pnpm dev
pnpm test
pnpm lint
pnpm build
```

### Ручная проверка

| # | Действие | Ожидание |
|---|----------|----------|
| 1 | Открыть `/` | Home с subtitle сезона |
| 2 | Season 2024 | Next race + latest results для 2024 |
| 3 | Countdown | Обновляется каждую секунду |
| 4 | Latest results | Топ-3 + «View Full Results» → `/races/2024/{round}` |
| 5 | Quick link Calendar | `/calendar?season=2024` |
| 6 | Season 2026 (все upcoming) | Next race есть, latest — «No completed races yet» |
| 7 | Конец сезона 2024 | Next — «No upcoming races», latest — последняя гонка |
| 8 | Header season change | Данные перезагружаются |
| 9 | Error state | Retry работает |

### Definition of Done — Фаза 6

| # | Критерий | Статус |
|---|----------|--------|
| 1 | `QUICK_LINKS` + home labels | ☐ |
| 2 | `getNextRace`, `getLastCompletedRace` + tests | ☐ |
| 3 | `formatCountdown`, `useCountdown` | ☐ |
| 4 | `NextRaceCard` с countdown | ☐ |
| 5 | `LatestResultsPreview` топ-3 | ☐ |
| 6 | `QuickLinksGrid` | ☐ |
| 7 | `HomePage` — loading / error / empty | ☐ |
| 8 | Season sync через Header + quick links | ☐ |
| 9 | `pnpm test` / `lint` / `build` — OK | ☐ |
| 10 | Нет magic strings в home feature | ☐ |

---

## Итоговая структура файлов

```
src/
├── constants/
│   ├── quickLinks.ts              # NEW
│   ├── labels.ts                  # UPDATE
│   └── index.ts                   # UPDATE
├── hooks/
│   ├── useCountdown.ts            # NEW
│   └── index.ts                   # UPDATE
├── lib/
│   ├── raceSchedule.ts            # NEW
│   ├── raceSchedule.test.ts       # NEW
│   ├── countdown.ts               # NEW
│   ├── countdown.test.ts          # NEW
│   └── formatters.ts              # UPDATE — formatCountdown
├── features/
│   └── home/
│       ├── NextRaceCard.tsx
│       ├── NextRaceCard.module.css
│       ├── NextRaceCard.test.tsx
│       ├── LatestResultsPreview.tsx
│       ├── LatestResultsPreview.module.css
│       ├── LatestResultsPreview.test.tsx
│       ├── QuickLinksGrid.tsx
│       ├── QuickLinksGrid.module.css
│       ├── QuickLinksGrid.test.tsx
│       └── index.ts
└── pages/
    ├── HomePage.tsx               # UPDATE
    └── HomePage.module.css        # NEW
```

---

## Чеклист задач

### 6.0 — Константы
- [ ] `QUICK_LINKS` в `quickLinks.ts`
- [ ] `LABELS` — homeSeasonOverview, nextRaceTitle, latestResults*, noUpcoming*, countdown*
- [ ] `constants/index.ts` export

### 6.1 — Утилиты
- [ ] `getNextRace`, `getLastCompletedRace` в `raceSchedule.ts`
- [ ] `raceSchedule.test.ts`

### 6.2 — Countdown
- [ ] `getRaceDateTime`, `getCountdownParts` в `countdown.ts`
- [ ] `formatCountdown` в formatters
- [ ] `useCountdown` hook
- [ ] `countdown.test.ts`

### 6.3 — Feature components
- [ ] `NextRaceCard` + CSS + test
- [ ] `LatestResultsPreview` + CSS + test
- [ ] `QuickLinksGrid` + CSS + test
- [ ] `features/home/index.ts`

### 6.4 — HomePage
- [ ] Заменить placeholder
- [ ] `HomePage.module.css` — grid layout
- [ ] Loading skeleton, error + retry
- [ ] Empty states для next/latest

### 6.5 — Тесты
- [ ] raceSchedule
- [ ] countdown / formatCountdown
- [ ] NextRaceCard, LatestResultsPreview, QuickLinksGrid

### 6.6 — Приёмка
- [ ] Season sync Home ↔ Calendar
- [ ] Countdown live
- [ ] Quick links с season
- [ ] `pnpm dev` / `test` / `lint` / `build`

---

## Что дальше

После завершения Фазы 6 переходить к **[Фаза 7 — Дашборд](./development-plan.md#фаза-7--дашборд)**:

- `SummaryCard` — переиспользуемый компонент
- 4 summary-карточки (лидер пилотов, лидер команд, next race, last race winner)
- `DriverPointsChart`, `ConstructorPointsChart` — Recharts BarChart
- `DashboardPage`

Фаза 7 частично переиспользует утилиты Фазы 6 (`getNextRace`, `getLastCompletedRace`) и hooks (`useRaces`, `useDriverStandings`).

---

## Заметки и решения

| Вопрос | Решение |
|--------|---------|
| Фильтрация next/last по date или status? | `RACE_STATUS.*` — консистентно с Calendar |
| Countdown: date only vs date+time? | `race.time` если есть (`"14:00:00Z"`), иначе midnight local |
| Top-N results | `results.slice(0, 3)` — только finished positions 1–3 |
| DNF в топ-3? | API сортирует по position — берём первые 3 как есть |
| Отдельный hook `useHomeData`? | Не обязателен для MVP — compose в `HomePage` |
| NextRaceCard empty | Inline `Card` в HomePage, не отдельный компонент |
| Quick links: Race Results? | Нет — нужен round; ссылка через Latest Results |
| `Round X` в JSX | MVP inline; позже — `LABELS.nextRaceHeader` template |
| Grid 2 col на mobile | 1 col — опционально в Фазе 8 |
| formatCountdown location | `formatters.ts` рядом с `formatRaceDate` |

---

## Порядок реализации (рекомендуемый)

```
constants → raceSchedule + tests → countdown + useCountdown
  → NextRaceCard → LatestResultsPreview → QuickLinksGrid
  → HomePage → tests → manual E2E season sync + countdown
```

После **raceSchedule + NextRaceCard + useRaces** можно проверить блок next race до latest results и quick links.
