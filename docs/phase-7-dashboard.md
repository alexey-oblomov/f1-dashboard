# F1 Dashboard — Фаза 7: Дашборд

> Подробный пошаговый план страницы аналитики и summary-карточек.
>
> Связанные документы:
> - [project-description.md](./project-description.md) — раздел Dashboard, графики Recharts
> - [development-plan.md](./development-plan.md) — общий план MVP и все фазы
> - [phase-5-standings.md](./phase-5-standings.md) — `useDriverStandings`, `useConstructorStandings`
> - [phase-6-home.md](./phase-6-home.md) — `getNextRace`, `getLastCompletedRace`, `useRaceResults`

**Оценка:** 3–4 часа  
**Цель фазы:** страница `/dashboard` показывает 4 summary-карточки сезона и два bar chart (top 10 пилотов и команд) на Recharts.

---

## Содержание

1. [Предварительные требования](#1-предварительные-требования)
2. [Обзор фазы](#2-обзор-фазы)
3. [Архитектура](#3-архитектура)
4. [7.0 — Константы](#70--константы)
5. [7.1 — Утилиты chartData / getRaceWinner](#71--утилиты-chartdata--getracewinner)
6. [7.2 — UI: SummaryCard](#72--ui-summarycard)
7. [7.3 — SummaryCardsGrid](#73--summarycardsgrid)
8. [7.4 — DriverPointsChart](#74--driverpointschart)
9. [7.5 — ConstructorPointsChart](#75--constructorpointschart)
10. [7.6 — DashboardPage](#76--dashboardpage)
11. [7.7 — SeasonSelector (переиспользование)](#77--seasonselector-переиспользование)
12. [7.8 — Тесты](#78--тесты)
13. [7.9 — Проверка и приёмка фазы](#79--проверка-и-приёмка-фазы)
14. [Итоговая структура файлов](#итоговая-структура-файлов)
15. [Чеклист задач](#чеклист-задач)

---

## 1. Предварительные требования

Фазы 0–6 должны быть завершены:

| Критерий | Проверка |
|----------|----------|
| API standings + races + results | `@/api/endpoints` |
| `useDriverStandings`, `useConstructorStandings` | `@/hooks` |
| `useRaces`, `useRaceResults`, `useSeason` | `@/hooks` |
| `getNextRace`, `getLastCompletedRace` | `@/lib/raceSchedule.ts` |
| `formatRaceDate` | `@/lib/formatters.ts` |
| UI `Card`, `Button`, `Skeleton` | `components/ui/` |
| `recharts` в dependencies | `package.json` |
| Маршрут `/dashboard` | `ROUTES.dashboard` |
| Season selector в Header | `@/features/calendar/SeasonSelector` |
| `pnpm test` / `pnpm build` | проходят |

---

## 2. Обзор фазы

### Что делаем

| # | Задача | Результат |
|---|--------|-----------|
| 7.0 | Константы: `CHART_CONFIG`, dashboard labels | Без magic strings |
| 7.1 | `mapDriverChartData`, `mapConstructorChartData`, `getRaceWinner` | Pure functions + tests |
| 7.2 | UI `SummaryCard` | Переиспользуемая карточка метрики |
| 7.3 | `SummaryCardsGrid` | 4 summary-карточки |
| 7.4 | `DriverPointsChart` | Recharts BarChart top 10 |
| 7.5 | `ConstructorPointsChart` | Recharts BarChart top 10 |
| 7.6 | `DashboardPage` | Сборка + loading / error / partial empty |

### Что **не** делаем

- Line chart накопления очков (Post-MVP)
- Pie chart / donut charts
- Live timing
- Responsive hamburger (Фаза 8)
- Drill-down на страницу пилота / команды
- Export / download charts

### UX — Dashboard Page

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard                               [Season: 2024 ▼]   │
│  2024 Season Summary                                        │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────┐│
│  │ Driver Leader│ │ Team Leader  │ │ Next Race    │ │Last ││
│  │ M. Verstappen│ │ McLaren      │ │ R24 Abu Dhabi│ │Race ││
│  │ 437 pts      │ │ 666 pts      │ │ 8 Dec 2024   │ │Win: ││
│  │ Red Bull     │ │ 6 wins       │ │              │ │Norris│
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────┘│
│                                                             │
│  Driver Points — Top 10                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ████                                               │   │
│  │  ████ ███                                           │   │
│  │  ████ ███ ██ ██ ...                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Constructor Points — Top 10                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ████                                               │   │
│  │  ████ ███                                           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

URL-пример: `/dashboard?season=2024`

### Summary-карточки (4 шт.)

| Карточка | Источник | Основное значение | Subtitle / meta |
|----------|----------|-------------------|-----------------|
| Driver Leader | `driverStandings[0]` | `driverName` | `{points} pts · {constructor}` |
| Constructor Leader | `constructorStandings[0]` | `name` | `{points} pts · {wins} wins` |
| Next Race | `getNextRace(races)` | `Round X — {name}` | `formatRaceDate(date)` |
| Last Race Winner | `getLastCompletedRace` + `getRaceResults` | P1 `driverName` | `Round X — {raceName}` |

---

## 3. Архитектура

### Поток данных

```
/dashboard?season=2024
  → useSeason() → season: 2024

  Parallel queries:
  ├── useRaces(season) → Race[]
  ├── useDriverStandings(season) → DriverStanding[]
  └── useConstructorStandings(season) → ConstructorStanding[]

  Derived:
  ├── getNextRace(races)
  ├── getLastCompletedRace(races)
  └── useRaceResults(lastRace.season, lastRace.round) → winner (P1)

  Transform:
  ├── mapDriverChartData(driverStandings, topN)
  └── mapConstructorChartData(constructorStandings, topN)

  → DashboardPage
       ├── SummaryCardsGrid
       ├── DriverPointsChart
       └── ConstructorPointsChart
```

### Feature folder

```
src/features/dashboard/
├── SummaryCardsGrid.tsx
├── SummaryCardsGrid.module.css
├── DriverPointsChart.tsx
├── DriverPointsChart.module.css
├── ConstructorPointsChart.tsx
├── ConstructorPointsChart.module.css
└── index.ts
```

### UI (новый компонент)

```
src/components/ui/
├── SummaryCard.tsx
├── SummaryCard.module.css
└── index.ts              # UPDATE
```

### Hooks / lib

```
src/lib/
├── chartData.ts            # mapDriverChartData, mapConstructorChartData
├── chartData.test.ts
├── raceWinner.ts           # getRaceWinner
└── raceWinner.test.ts
```

### Принципы

| Принцип | Решение |
|---------|---------|
| Сезон в URL | `?season=2026` через `useSeason` |
| Страница тонкая | `DashboardPage` — hooks + feature components |
| Parallel fetch | 3–4 queries параллельно; TanStack Query кэширует |
| Charts top N | `CHART_CONFIG.topN = 10` — константа |
| Recharts theme | Цвета из CSS variables (`--color-accent`, text secondary) |
| Summary empty | Отдельный fallback на карточку, не ломать всю страницу |
| Winner | `results.find(r => r.position === 1)` через `getRaceWinner` |
| Responsive charts | `ResponsiveContainer width="100%" height={300}` |
| Не дублировать Home | Summary cards — компактные метрики; Home — narrative blocks |

---

## 7.0 — Константы

### Новые / обновляемые файлы

```
src/constants/
├── chartConfig.ts      # NEW — CHART_CONFIG
├── labels.ts           # UPDATE — dashboard labels
└── index.ts            # UPDATE
```

### `src/constants/chartConfig.ts`

```typescript
export const CHART_CONFIG = {
  topN: 10,
  height: 300,
  barColor: 'var(--color-accent)',
  gridColor: 'var(--color-border)',
  axisColor: 'var(--color-text-secondary)',
  tooltipBg: 'var(--color-bg-elevated)',
} as const
```

> Recharts принимает CSS variables в `fill` / `stroke` — работает с dark theme.

### Дополнить `src/constants/labels.ts`

```typescript
export const LABELS = {
  // ...existing
  dashboardSeasonSummary: '{season} Season Summary',
  summaryDriverLeader: 'Driver Leader',
  summaryConstructorLeader: 'Constructor Leader',
  summaryNextRace: 'Next Race',
  summaryLastRaceWinner: 'Last Race Winner',
  summaryPoints: '{points} pts',
  summaryWins: '{wins} wins',
  summaryDriverMeta: '{points} pts · {constructor}',
  summaryConstructorMeta: '{points} pts · {wins} wins',
  summaryNextRaceRound: 'Round {round} — {raceName}',
  summaryLastRaceMeta: 'Round {round} — {raceName}',
  noDriverLeader: 'No driver standings available.',
  noConstructorLeader: 'No constructor standings available.',
  noNextRace: 'No upcoming races.',
  noLastRaceWinner: 'No race results yet.',
  chartDriverPointsTitle: 'Driver Points — Top 10',
  chartConstructorPointsTitle: 'Constructor Points — Top 10',
  chartAxisPoints: 'Points',
  chartNoData: 'No chart data available.',
} as const
```

### Barrel — `src/constants/index.ts`

```typescript
export { CHART_CONFIG } from './chartConfig'
```

### Критерий готовности

- [ ] Top N, цвета chart — `CHART_CONFIG`
- [ ] Заголовки карточек и charts — `LABELS.*`

---

## 7.1 — Утилиты chartData / getRaceWinner

### `src/lib/chartData.ts`

```typescript
import { CHART_CONFIG } from '@/constants'
import type { ConstructorStanding, DriverStanding } from '@/types'

export interface ChartDataPoint {
  name: string
  points: number
  fullName: string
}

export function mapDriverChartData(
  standings: DriverStanding[],
  topN = CHART_CONFIG.topN,
): ChartDataPoint[] {
  return standings.slice(0, topN).map((standing) => ({
    name: standing.driverName,
    points: standing.points,
    fullName: standing.driverName,
  }))
}

export function mapConstructorChartData(
  standings: ConstructorStanding[],
  topN = CHART_CONFIG.topN,
): ChartDataPoint[] {
  return standings.slice(0, topN).map((standing) => ({
    name: standing.name,
    points: standing.points,
    fullName: standing.name,
  }))
}
```

> Standings уже отсортированы API по position — `slice(0, topN)` достаточно.

### `src/lib/raceWinner.ts`

```typescript
import type { RaceResult } from '@/types'

export function getRaceWinner(results: RaceResult[]): RaceResult | null {
  return results.find((result) => result.position === 1) ?? null
}
```

### Unit-тесты

```typescript
describe('mapDriverChartData', () => {
  it('returns top N drivers', () => {
    const standings = Array.from({ length: 15 }, (_, i) => ({
      position: i + 1,
      driverName: `Driver ${i + 1}`,
      constructor: 'Team',
      points: 100 - i,
      wins: 0,
    }))
    expect(mapDriverChartData(standings, 10)).toHaveLength(10)
    expect(mapDriverChartData(standings, 10)[0].points).toBe(100)
  })
})

describe('getRaceWinner', () => {
  it('returns position 1 driver', () => {
    const results = [
      { position: 1, driverName: 'M. Verstappen', constructor: 'Red Bull', points: 25, status: 'Finished' },
      { position: 2, driverName: 'L. Norris', constructor: 'McLaren', points: 18, status: 'Finished' },
    ]
    expect(getRaceWinner(results)?.driverName).toBe('M. Verstappen')
  })
})
```

---

## 7.2 — UI: SummaryCard

### Файлы

```
src/components/ui/SummaryCard.tsx
src/components/ui/SummaryCard.module.css
```

### API

```typescript
interface SummaryCardProps {
  title: string
  value: string
  meta?: string
  className?: string
}
```

### Реализация

```typescript
import { Card } from './Card'
import { cn } from '@/lib/utils'
import styles from './SummaryCard.module.css'

export function SummaryCard({ title, value, meta, className }: SummaryCardProps) {
  return (
    <Card padding="md" className={cn(styles.card, className)}>
      <p className={styles.title}>{title}</p>
      <p className={styles.value}>{value}</p>
      {meta && <p className={styles.meta}>{meta}</p>}
    </Card>
  )
}
```

### `SummaryCard.module.css`

```css
.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-height: 100px;
}

.title {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.value {
  font-size: var(--font-size-lg);
  font-weight: 600;
  line-height: 1.3;
}

.meta {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
```

### Barrel — `src/components/ui/index.ts`

```typescript
export { SummaryCard } from './SummaryCard'
```

---

## 7.3 — SummaryCardsGrid

### Файл: `src/features/dashboard/SummaryCardsGrid.tsx`

Принимает все derived data + loading/empty flags; рендерит 4 `SummaryCard`.

```typescript
import { SummaryCard } from '@/components/ui'
import { LABELS } from '@/constants'
import { formatRaceDate } from '@/lib/formatters'
import type { ConstructorStanding, DriverStanding, Race, RaceResult } from '@/types'
import styles from './SummaryCardsGrid.module.css'

interface SummaryCardsGridProps {
  driverLeader: DriverStanding | null
  constructorLeader: ConstructorStanding | null
  nextRace: Race | null
  lastRace: Race | null
  raceWinner: RaceResult | null
  isDriverLoading?: boolean
  isConstructorLoading?: boolean
  isRacesLoading?: boolean
  isWinnerLoading?: boolean
}

export function SummaryCardsGrid({
  driverLeader,
  constructorLeader,
  nextRace,
  lastRace,
  raceWinner,
  isDriverLoading,
  isConstructorLoading,
  isRacesLoading,
  isWinnerLoading,
}: SummaryCardsGridProps) {
  const driverValue = driverLeader?.driverName ?? LABELS.noDriverLeader
  const driverMeta = driverLeader
    ? LABELS.summaryDriverMeta
        .replace('{points}', String(driverLeader.points))
        .replace('{constructor}', driverLeader.constructor)
    : undefined

  const constructorValue = constructorLeader?.name ?? LABELS.noConstructorLeader
  const constructorMeta = constructorLeader
    ? LABELS.summaryConstructorMeta
        .replace('{points}', String(constructorLeader.points))
        .replace('{wins}', String(constructorLeader.wins))
    : undefined

  const nextRaceValue = nextRace
    ? LABELS.summaryNextRaceRound
        .replace('{round}', String(nextRace.round))
        .replace('{raceName}', nextRace.name)
    : LABELS.noNextRace
  const nextRaceMeta = nextRace ? formatRaceDate(nextRace.date) : undefined

  const winnerValue = raceWinner?.driverName ?? LABELS.noLastRaceWinner
  const winnerMeta =
    lastRace && raceWinner
      ? LABELS.summaryLastRaceMeta
          .replace('{round}', String(lastRace.round))
          .replace('{raceName}', lastRace.name)
      : undefined

  return (
    <div className={styles.grid}>
      <SummaryCard
        title={LABELS.summaryDriverLeader}
        value={isDriverLoading ? '…' : driverValue}
        meta={!isDriverLoading ? driverMeta : undefined}
      />
      <SummaryCard
        title={LABELS.summaryConstructorLeader}
        value={isConstructorLoading ? '…' : constructorValue}
        meta={!isConstructorLoading ? constructorMeta : undefined}
      />
      <SummaryCard
        title={LABELS.summaryNextRace}
        value={isRacesLoading ? '…' : nextRaceValue}
        meta={!isRacesLoading ? nextRaceMeta : undefined}
      />
      <SummaryCard
        title={LABELS.summaryLastRaceWinner}
        value={isWinnerLoading ? '…' : winnerValue}
        meta={!isWinnerLoading ? winnerMeta : undefined}
      />
    </div>
  )
}
```

> Loading state: `'…'` или `Skeleton` внутри карточки — для MVP достаточно `'…'`.

### `SummaryCardsGrid.module.css`

```css
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}
```

> На mobile — `repeat(2, 1fr)` или `1fr` — опционально в Фазе 8.

---

## 7.4 — DriverPointsChart

### Файл: `src/features/dashboard/DriverPointsChart.tsx`

```typescript
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/components/ui'
import { CHART_CONFIG, LABELS } from '@/constants'
import type { ChartDataPoint } from '@/lib/chartData'
import styles from './DriverPointsChart.module.css'

interface DriverPointsChartProps {
  data: ChartDataPoint[]
  isLoading?: boolean
}

export function DriverPointsChart({ data, isLoading }: DriverPointsChartProps) {
  return (
    <Card padding="md" className={styles.chartCard}>
      <h2 className={styles.title}>{LABELS.chartDriverPointsTitle}</h2>

      {isLoading && <div className={styles.placeholder}>…</div>}

      {!isLoading && data.length === 0 && (
        <p className={styles.empty}>{LABELS.chartNoData}</p>
      )}

      {!isLoading && data.length > 0 && (
        <ResponsiveContainer width="100%" height={CHART_CONFIG.height}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
            <CartesianGrid stroke={CHART_CONFIG.gridColor} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: CHART_CONFIG.axisColor, fontSize: 12 }}
              angle={-35}
              textAnchor="end"
              interval={0}
              height={60}
            />
            <YAxis
              tick={{ fill: CHART_CONFIG.axisColor, fontSize: 12 }}
              label={{
                value: LABELS.chartAxisPoints,
                angle: -90,
                position: 'insideLeft',
                fill: CHART_CONFIG.axisColor,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: CHART_CONFIG.tooltipBg,
                border: `1px solid ${CHART_CONFIG.gridColor}`,
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'var(--color-text-primary)' }}
              formatter={(value) => [`${value} pts`, LABELS.chartAxisPoints]}
            />
            <Bar dataKey="points" fill={CHART_CONFIG.barColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
```

### Recharts + dark theme — заметки

| Элемент | Стилизация |
|---------|------------|
| Grid | `stroke: var(--color-border)` |
| Axis ticks | `fill: var(--color-text-secondary)` |
| Bars | `fill: var(--color-accent)` |
| Tooltip | background `var(--color-bg-elevated)` |

---

## 7.5 — ConstructorPointsChart

### Файл: `src/features/dashboard/ConstructorPointsChart.tsx`

Структура **идентична** `DriverPointsChart`, отличия:

- `LABELS.chartConstructorPointsTitle`
- props `data: ChartDataPoint[]`
- CSS class `styles.chartCard` — можно общий `ChartCard.module.css` или дублировать для MVP

```typescript
export function ConstructorPointsChart({ data, isLoading }: ConstructorPointsChartProps) {
  // ...same BarChart structure, different title label
}
```

> DRY (optional): вынести `PointsBarChart` с prop `title: string` — не обязательно для MVP.

### Barrel — `src/features/dashboard/index.ts`

```typescript
export { SummaryCardsGrid } from './SummaryCardsGrid'
export { DriverPointsChart } from './DriverPointsChart'
export { ConstructorPointsChart } from './ConstructorPointsChart'
```

---

## 7.6 — DashboardPage

### Файл: `src/pages/DashboardPage.tsx`

```typescript
import { Button, Skeleton } from '@/components/ui'
import {
  ConstructorPointsChart,
  DriverPointsChart,
  SummaryCardsGrid,
} from '@/features/dashboard'
import { LABELS } from '@/constants'
import { useConstructorStandings } from '@/hooks/useConstructorStandings'
import { useDriverStandings } from '@/hooks/useDriverStandings'
import { useRaceResults } from '@/hooks/useRaceResults'
import { useRaces } from '@/hooks/useRaces'
import { useSeason } from '@/hooks/useSeason'
import { mapConstructorChartData, mapDriverChartData } from '@/lib/chartData'
import { getLastCompletedRace, getNextRace } from '@/lib/raceSchedule'
import { getRaceWinner } from '@/lib/raceWinner'
import styles from './DashboardPage.module.css'

function DashboardSkeleton() {
  return (
    <div className={styles.skeleton}>
      <Skeleton height={100} />
      <Skeleton height={100} />
      <Skeleton height={100} />
      <Skeleton height={100} />
      <Skeleton height={300} />
      <Skeleton height={300} />
    </div>
  )
}

export function DashboardPage() {
  const { season } = useSeason()

  const racesQuery = useRaces(season)
  const driversQuery = useDriverStandings(season)
  const constructorsQuery = useConstructorStandings(season)

  const races = racesQuery.data
  const nextRace = races ? getNextRace(races) : null
  const lastRace = races ? getLastCompletedRace(races) : null

  const resultsQuery = useRaceResults(lastRace?.season ?? 0, lastRace?.round ?? 0)
  const raceWinner = lastRace ? getRaceWinner(resultsQuery.data?.results ?? []) : null

  const driverChartData = driversQuery.data ? mapDriverChartData(driversQuery.data) : []
  const constructorChartData = constructorsQuery.data
    ? mapConstructorChartData(constructorsQuery.data)
    : []

  const isInitialLoading =
    racesQuery.isLoading && driversQuery.isLoading && constructorsQuery.isLoading

  const hasError =
    racesQuery.isError || driversQuery.isError || constructorsQuery.isError

  const refetchAll = () => {
    void racesQuery.refetch()
    void driversQuery.refetch()
    void constructorsQuery.refetch()
    void resultsQuery.refetch()
  }

  const subtitle = LABELS.dashboardSeasonSummary.replace('{season}', String(season))

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{LABELS.pageDashboard}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </header>

      {isInitialLoading && <DashboardSkeleton />}

      {hasError && (
        <div className={styles.error}>
          <p>{LABELS.error}</p>
          <Button variant="secondary" onClick={refetchAll}>
            {LABELS.retry}
          </Button>
        </div>
      )}

      {!isInitialLoading && !hasError && (
        <>
          <SummaryCardsGrid
            driverLeader={driversQuery.data?.[0] ?? null}
            constructorLeader={constructorsQuery.data?.[0] ?? null}
            nextRace={nextRace}
            lastRace={lastRace}
            raceWinner={raceWinner}
            isDriverLoading={driversQuery.isLoading}
            isConstructorLoading={constructorsQuery.isLoading}
            isRacesLoading={racesQuery.isLoading}
            isWinnerLoading={!!lastRace && resultsQuery.isLoading}
          />

          <div className={styles.charts}>
            <DriverPointsChart data={driverChartData} isLoading={driversQuery.isLoading} />
            <ConstructorPointsChart
              data={constructorChartData}
              isLoading={constructorsQuery.isLoading}
            />
          </div>
        </>
      )}
    </div>
  )
}
```

### `DashboardPage.module.css`

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

.charts {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  color: var(--color-text-secondary);
}

.skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
```

### Удалить placeholder

Убрать `pageDashboardDescription` («coming soon») из UI.

### Стратегия loading / error

| Сценарий | Поведение |
|----------|-----------|
| Первая загрузка (все 3 query loading) | Full page skeleton |
| Один query failed | Error block + retry all |
| Standings loaded, races still loading | Summary cards partial (`'…'`) |
| No last race | Winner card → `noLastRaceWinner` |
| Empty standings | Chart → `chartNoData` |

---

## 7.7 — SeasonSelector (переиспользование)

**Изменений в Header не требуется.**

### Проверки

| # | Сценарий | Ожидание |
|---|----------|----------|
| 1 | Home quick link → Dashboard | `/dashboard?season=2024` |
| 2 | Смена сезона | Summary + charts обновляются |
| 3 | Sidebar Calendar → Dashboard | `?season=` сохраняется |

---

## 7.8 — Тесты

### Минимальный набор

| Файл | Что проверяет |
|------|---------------|
| `lib/chartData.test.ts` | `mapDriverChartData`, `mapConstructorChartData` |
| `lib/raceWinner.test.ts` | `getRaceWinner` |
| `components/ui/SummaryCard.test.tsx` | title, value, meta |
| `features/dashboard/SummaryCardsGrid.test.tsx` | 4 cards с mock data |
| `features/dashboard/DriverPointsChart.test.tsx` | title + empty state |

### Recharts в тестах

`ResponsiveContainer` требует размеры DOM. Варианты:

```typescript
// vitest setup или в test file
vi.mock('recharts', async () => {
  const Original = await vi.importActual('recharts')
  return {
    ...Original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 300 }}>{children}</div>
    ),
  }
})
```

Или тестировать только empty/loading UI без mount chart.

### Пример — SummaryCard

```typescript
render(<SummaryCard title="Driver Leader" value="M. Verstappen" meta="437 pts · Red Bull" />)
expect(screen.getByText('Driver Leader')).toBeInTheDocument()
expect(screen.getByText('M. Verstappen')).toBeInTheDocument()
expect(screen.getByText('437 pts · Red Bull')).toBeInTheDocument()
```

### Пример — SummaryCardsGrid

```typescript
render(
  <SummaryCardsGrid
    driverLeader={{ position: 1, driverName: 'M. Verstappen', constructor: 'Red Bull', points: 437, wins: 9 }}
    constructorLeader={{ position: 1, name: 'McLaren', points: 666, wins: 6 }}
    nextRace={null}
    lastRace={null}
    raceWinner={null}
  />,
)
expect(screen.getByText(LABELS.summaryDriverLeader)).toBeInTheDocument()
expect(screen.getByText('M. Verstappen')).toBeInTheDocument()
```

---

## 7.9 — Проверка и приёмка фазы

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
| 1 | `/dashboard?season=2024` | 4 summary cards + 2 charts |
| 2 | Driver Leader | Verstappen, 437 pts |
| 3 | Constructor Leader | McLaren / Ferrari / Red Bull (актуальный P1) |
| 4 | Next Race | ближайшая upcoming гонка или empty |
| 5 | Last Race Winner | P1 последней гонки |
| 6 | Driver chart | 10 bars, подписи пилотов |
| 7 | Constructor chart | 10 bars, подписи команд |
| 8 | Tooltip на bar | points value |
| 9 | Season 2026 | charts + cards для 2026 |
| 10 | Header season change | Данные перезагружаются |
| 11 | Error + Retry | refetch работает |

### Definition of Done — Фаза 7

| # | Критерий | Статус |
|---|----------|--------|
| 1 | `CHART_CONFIG` + dashboard labels | ☐ |
| 2 | `mapDriverChartData`, `mapConstructorChartData`, `getRaceWinner` + tests | ☐ |
| 3 | UI `SummaryCard` | ☐ |
| 4 | `SummaryCardsGrid` — 4 cards | ☐ |
| 5 | `DriverPointsChart`, `ConstructorPointsChart` — Recharts | ☐ |
| 6 | `DashboardPage` — loading / error / empty | ☐ |
| 7 | Dark theme charts readable | ☐ |
| 8 | Season sync через Header | ☐ |
| 9 | `pnpm test` / `lint` / `build` — OK | ☐ |
| 10 | Нет magic strings в dashboard feature | ☐ |
| 11 | **MVP Extended complete** (Home + Dashboard) | ☐ |

---

## Итоговая структура файлов

```
src/
├── constants/
│   ├── chartConfig.ts              # NEW
│   ├── labels.ts                   # UPDATE
│   └── index.ts                    # UPDATE
├── components/ui/
│   ├── SummaryCard.tsx             # NEW
│   ├── SummaryCard.module.css      # NEW
│   ├── SummaryCard.test.tsx        # NEW
│   └── index.ts                    # UPDATE
├── lib/
│   ├── chartData.ts                # NEW
│   ├── chartData.test.ts           # NEW
│   ├── raceWinner.ts               # NEW
│   └── raceWinner.test.ts          # NEW
├── features/
│   └── dashboard/
│       ├── SummaryCardsGrid.tsx
│       ├── SummaryCardsGrid.module.css
│       ├── SummaryCardsGrid.test.tsx
│       ├── DriverPointsChart.tsx
│       ├── DriverPointsChart.module.css
│       ├── DriverPointsChart.test.tsx
│       ├── ConstructorPointsChart.tsx
│       ├── ConstructorPointsChart.module.css
│       └── index.ts
└── pages/
    ├── DashboardPage.tsx           # UPDATE
    └── DashboardPage.module.css    # NEW
```

---

## Чеклист задач

### 7.0 — Константы
- [ ] `CHART_CONFIG` в `chartConfig.ts`
- [ ] `LABELS` — summary*, chart*, dashboardSeasonSummary
- [ ] `constants/index.ts` export

### 7.1 — Утилиты
- [ ] `mapDriverChartData`, `mapConstructorChartData`
- [ ] `getRaceWinner`
- [ ] unit tests

### 7.2 — SummaryCard
- [ ] UI component + CSS
- [ ] Export из `components/ui/index.ts`
- [ ] test

### 7.3 — SummaryCardsGrid
- [ ] 4 cards с loading/empty
- [ ] CSS grid 4 columns
- [ ] test

### 7.4 — Charts
- [ ] `DriverPointsChart` — Recharts BarChart
- [ ] `ConstructorPointsChart`
- [ ] Dark theme styling
- [ ] empty / loading states
- [ ] `features/dashboard/index.ts`

### 7.5 — DashboardPage
- [ ] Parallel hooks: races, driverStandings, constructorStandings, raceResults
- [ ] Full skeleton + error retry
- [ ] `DashboardPage.module.css`
- [ ] Убрать placeholder description

### 7.6 — Тесты
- [ ] chartData, raceWinner
- [ ] SummaryCard, SummaryCardsGrid
- [ ] DriverPointsChart (empty state или mock Recharts)

### 7.7 — Приёмка
- [ ] Season sync
- [ ] Charts render in browser
- [ ] `pnpm dev` / `test` / `lint` / `build`

---

## Что дальше

После завершения Фазы 7 переходить к **[Фаза 8 — Полировка](./development-plan.md#фаза-8--полировка)**:

- Loading / Error / Empty audit на всех страницах
- Responsive — sidebar → hamburger на mobile
- README — setup, API source, stack
- Финальный QA checklist MVP

**MVP Extended complete** после Фазы 7: все 5 разделов с реальными данными + графики.

---

## Заметки и решения

| Вопрос | Решение |
|--------|---------|
| SummaryCard в ui/ vs feature/? | `components/ui/` — переиспользуемый примитив |
| Driver vs Constructor chart — DRY? | Дублировать для MVP; `PointsBarChart` — optional refactor |
| XAxis длинные имена | `angle={-35}`, `interval={0}` |
| Top 10 vs all | `CHART_CONFIG.topN = 10` — только top N на chart |
| Leader = standings[0] | API сортирует по position; `[0]` = P1 |
| Winner без results API | Card показывает `noLastRaceWinner` |
| Recharts SSR | Vite SPA — SSR не нужен |
| Chart height | 300px фиксированно через `CHART_CONFIG.height` |
| Partial loading | Summary cards показывают `'…'` per-query |
| CSS variables in Recharts | Работают в SVG fill/stroke в modern browsers |
| Line chart | Post-MVP v2 |

---

## Порядок реализации (рекомендуемый)

```
constants → chartData + raceWinner + tests
  → SummaryCard → SummaryCardsGrid
  → DriverPointsChart → ConstructorPointsChart
  → DashboardPage → tests → manual browser check charts
```

После **SummaryCardsGrid + hooks** можно проверить summary block до Recharts integration.
