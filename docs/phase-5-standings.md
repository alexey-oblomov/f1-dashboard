# F1 Dashboard — Фаза 5: Турнирные таблицы

> Подробный пошаговый план страницы чемпионата пилотов и конструкторов.
>
> Связанные документы:
> - [project-description.md](./project-description.md) — раздел Standings, колонки таблиц
> - [development-plan.md](./development-plan.md) — общий план MVP и все фазы
> - [phase-1-api-layer.md](./phase-1-api-layer.md) — API-слой, `getDriverStandings`, `getConstructorStandings`
> - [phase-3-calendar.md](./phase-3-calendar.md) — `useSeason`, `SeasonSelector`, синхронизация сезона в URL
> - [phase-4-race-results.md](./phase-4-race-results.md) — паттерн feature folder, hooks, loading/error/empty

**Оценка:** 2–3 часа  
**Цель фазы:** страница `/standings` показывает турнирные таблицы пилотов и конструкторов выбранного сезона. Две вкладки, фильтр сезона через Header. После завершения — **MVP Core complete** (Calendar + Results + Standings).

---

## Содержание

1. [Предварительные требования](#1-предварительные-требования)
2. [Обзор фазы](#2-обзор-фазы)
3. [Архитектура](#3-архитектура)
4. [5.0 — Константы](#50--константы)
5. [5.1 — UI: Tabs](#51--ui-tabs)
6. [5.2 — Хук useStandingsTab](#52--хук-usestandingstab)
7. [5.3 — Hooks useDriverStandings / useConstructorStandings](#53--hooks-usedriverstandings--useconstructorstandings)
8. [5.4 — DriverStandingsTable](#54--driverstandingstable)
9. [5.5 — ConstructorStandingsTable](#55--constructorstandingstable)
10. [5.6 — StandingsTabs (feature)](#56--standingstabs-feature)
11. [5.7 — StandingsPage](#57--standingspage)
12. [5.8 — SeasonSelector (переиспользование)](#58--seasonselector-переиспользование)
13. [5.9 — Тесты](#59--тесты)
14. [5.10 — Проверка и приёмка фазы](#510--проверка-и-приёмка-фазы)
15. [Итоговая структура файлов](#итоговая-структура-файлов)
16. [Чеклист задач](#чеклист-задач)

---

## 1. Предварительные требования

Фазы 0–4 должны быть завершены:

| Критерий | Проверка |
|----------|----------|
| API `getDriverStandings(season)` | `@/api/endpoints/driverStandings.ts` |
| API `getConstructorStandings(season)` | `@/api/endpoints/constructorStandings.ts` |
| Типы `DriverStanding`, `ConstructorStanding` | `@/types/standing.ts` |
| `QUERY_KEYS.driverStandings`, `constructorStandings` | `@/constants/queryKeys.ts` |
| UI `Table`, `Skeleton`, `Button`, `Select` | `components/ui/` |
| `useSeason` + `SeasonSelector` в Header | `@/hooks/useSeason`, `@/features/calendar` |
| Sidebar сохраняет query params | `Sidebar.tsx` → `?season=` при навигации |
| Маршрут `/standings` | `ROUTES.standings` |
| `pnpm test` / `pnpm build` | проходят |

---

## 2. Обзор фазы

### Что делаем

| # | Задача | Результат |
|---|--------|-----------|
| 5.0 | Константы: `STANDINGS_TAB`, колонки таблиц, labels | Без magic strings |
| 5.1 | UI `Tabs` — composable компонент | Переиспользуемый UI kit |
| 5.2 | `useStandingsTab` — вкладка в URL `?tab=` | Shareable links |
| 5.3 | `useDriverStandings`, `useConstructorStandings` | TanStack Query |
| 5.4 | `DriverStandingsTable` | pos, driver, team, points, wins |
| 5.5 | `ConstructorStandingsTable` | pos, team, points, wins |
| 5.6 | `StandingsTabs` | Переключение Drivers / Constructors |
| 5.7 | `StandingsPage` | Сборка + loading / error / empty |

### Что **не** делаем

- Home page с обзором (Фаза 6)
- Dashboard charts (Фаза 7)
- Детальные страницы пилота / команды (Post-MVP)
- Line chart накопления очков (Post-MVP)
- Цвет команды в строке таблицы (Post-MVP)
- Mobile hamburger (Фаза 8)

### UX — Standings Page

```
┌─────────────────────────────────────────────────────────────┐
│  Standings                          [Season: 2024 ▼] ← Header│
│                                                             │
│  ┌─────────────┬──────────────────┐                         │
│  │  Drivers    │  Constructors    │  ← Tabs                 │
│  └─────────────┴──────────────────┘                         │
│                                                             │
│  ┌─────┬──────────────┬───────────┬────────┬──────┐         │
│  │ Pos │ Driver       │ Team      │ Points │ Wins │         │
│  ├─────┼──────────────┼───────────┼────────┼──────┤         │
│  │ 1   │ M. Verstappen│ Red Bull  │ 437    │ 9    │         │
│  │ 2   │ L. Norris    │ McLaren   │ 374    │ 4    │         │
│  │ …   │ …            │ …         │ …      │ …    │         │
│  └─────┴──────────────┴───────────┴────────┴──────┘         │
└─────────────────────────────────────────────────────────────┘
```

URL-пример: `/standings?season=2024&tab=drivers`

### Колонки таблиц (MVP)

**Drivers**

| Колонка | Поле `DriverStanding` | Примечание |
|---------|----------------------|------------|
| Pos | `position` | number |
| Driver | `driverName` | string, формат `M. Verstappen` из mapper |
| Team | `constructor` | string, `Constructors[0].name` из API |
| Points | `points` | number |
| Wins | `wins` | number |

**Constructors**

| Колонка | Поле `ConstructorStanding` | Примечание |
|---------|---------------------------|------------|
| Pos | `position` | number |
| Team | `name` | string |
| Points | `points` | number |
| Wins | `wins` | number |

---

## 3. Архитектура

### Поток данных

```
/standings?season=2024&tab=drivers
  → useSeason() → season: 2024
  → useStandingsTab() → tab: 'drivers'
  → useDriverStandings(2024)
       → queryKey: ['driverStandings', 2024]
       → queryFn: getDriverStandings(2024)
       → DriverStanding[]
  → DriverStandingsTable(standings)

Переключение вкладки → ?tab=constructors
  → useConstructorStandings(2024)
       → queryKey: ['constructorStandings', 2024]
       → ConstructorStanding[]
  → ConstructorStandingsTable(standings)
```

### Feature folder

```
src/features/standings/
├── StandingsTabs.tsx
├── StandingsTabs.module.css
├── DriverStandingsTable.tsx
├── DriverStandingsTable.module.css
├── ConstructorStandingsTable.tsx
├── ConstructorStandingsTable.module.css
└── index.ts
```

### Hooks / lib

```
src/hooks/
├── useDriverStandings.ts
├── useConstructorStandings.ts
├── useStandingsTab.ts
└── index.ts
```

### UI (новый компонент)

```
src/components/ui/
├── Tabs.tsx
├── Tabs.module.css
└── index.ts              # UPDATE — export Tabs
```

### Принципы

| Принцип | Решение |
|---------|---------|
| Сезон в URL | `?season=2026` через `useSeason` — уже работает глобально |
| Вкладка в URL | `?tab=drivers\|constructors` — shareable links |
| Страница тонкая | `StandingsPage` — hooks + feature components |
| Season selector | Только в Header — не дублировать на странице |
| Lazy fetch vs prefetch | Загружать **только активную** вкладку (`enabled` в Query) |
| Пустой сезон | API вернёт `[]` — показать `LABELS.noStandings` |
| Ошибка API | Error block + retry (как Calendar / Race Results) |
| Переиспользование | `Table` из `components/ui/` (как Calendar, Race Results) |
| Podium highlight | Опционально: CSS class для `position <= 3` — не обязательно для MVP |

---

## 5.0 — Константы

### Новые / обновляемые файлы

```
src/constants/
├── standingsTab.ts       # NEW — STANDINGS_TAB, type StandingsTab
├── tableColumns.ts         # UPDATE — DRIVER_*, CONSTRUCTOR_* columns
├── searchParams.ts         # UPDATE — tab key
├── labels.ts               # UPDATE — standings labels
└── index.ts                # UPDATE
```

### `src/constants/standingsTab.ts`

```typescript
export const STANDINGS_TAB = {
  drivers: 'drivers',
  constructors: 'constructors',
} as const

export type StandingsTab = (typeof STANDINGS_TAB)[keyof typeof STANDINGS_TAB]

export const DEFAULT_STANDINGS_TAB = STANDINGS_TAB.drivers satisfies StandingsTab
```

### Дополнить `src/constants/searchParams.ts`

```typescript
export const SEARCH_PARAMS = {
  season: 'season',
  tab: 'tab',
} as const
```

### Дополнить `src/constants/tableColumns.ts`

```typescript
export const DRIVER_STANDINGS_TABLE_COLUMNS = {
  position: 'Pos',
  driver: 'Driver',
  team: 'Team',
  points: 'Points',
  wins: 'Wins',
} as const

export const CONSTRUCTOR_STANDINGS_TABLE_COLUMNS = {
  position: 'Pos',
  team: 'Team',
  points: 'Points',
  wins: 'Wins',
} as const
```

> `CALENDAR_TABLE_COLUMNS` и `RESULTS_TABLE_COLUMNS` уже есть — добавить рядом.

### Дополнить `src/constants/labels.ts`

```typescript
export const LABELS = {
  // ...existing
  standingsTabDrivers: 'Drivers',
  standingsTabConstructors: 'Constructors',
  noStandings: 'No standings available for this season.',
} as const
```

> Удалить placeholder `pageStandingsDescription` из UI страницы (константу можно оставить или удалить).

### Barrel — `src/constants/index.ts`

```typescript
export { STANDINGS_TAB, DEFAULT_STANDINGS_TAB, type StandingsTab } from './standingsTab'
export {
  CALENDAR_TABLE_COLUMNS,
  RESULTS_TABLE_COLUMNS,
  DRIVER_STANDINGS_TABLE_COLUMNS,
  CONSTRUCTOR_STANDINGS_TABLE_COLUMNS,
} from './tableColumns'
```

### Критерий готовности

- [ ] Заголовки колонок — `DRIVER_STANDINGS_TABLE_COLUMNS` / `CONSTRUCTOR_STANDINGS_TABLE_COLUMNS`
- [ ] Labels вкладок — `LABELS.standingsTabDrivers` / `standingsTabConstructors`
- [ ] Значения вкладок — `STANDINGS_TAB.*`, не строковые литералы в JSX

---

## 5.1 — UI: Tabs

### Файлы

```
src/components/ui/Tabs.tsx
src/components/ui/Tabs.module.css
```

Composable API (по аналогии с `Table`):

```typescript
interface TabsProps {
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

interface TabsPanelProps {
  value: string
  activeValue: string
  children: React.ReactNode
  className?: string
}
```

### Пример использования

```tsx
<Tabs value={tab} onChange={setTab}>
  <TabsList>
    <TabsTrigger value={STANDINGS_TAB.drivers}>
      {LABELS.standingsTabDrivers}
    </TabsTrigger>
    <TabsTrigger value={STANDINGS_TAB.constructors}>
      {LABELS.standingsTabConstructors}
    </TabsTrigger>
  </TabsList>

  <TabsPanel value={STANDINGS_TAB.drivers} activeValue={tab}>
    <DriverStandingsTable standings={driverStandings} />
  </TabsPanel>

  <TabsPanel value={STANDINGS_TAB.constructors} activeValue={tab}>
    <ConstructorStandingsTable standings={constructorStandings} />
  </TabsPanel>
</Tabs>
```

### Поведение и a11y

| Требование | Реализация |
|------------|------------|
| Активная вкладка | `aria-selected="true"` на trigger |
| Роль | `role="tablist"`, `role="tab"`, `role="tabpanel"` |
| Скрытие panel | `hidden` или `display: none` если `value !== activeValue` |
| Клавиатура | Enter/Space на trigger переключает вкладку (опционально для MVP) |
| Стили | Активный tab — accent border/background через CSS Modules |

### `Tabs.module.css` (скетч)

```css
.list {
  display: flex;
  gap: var(--space-1);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-4);
}

.trigger {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.trigger[data-active='true'] {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-accent);
}

.panel[hidden] {
  display: none;
}
```

### Barrel — `src/components/ui/index.ts`

```typescript
export { Tabs, TabsList, TabsTrigger, TabsPanel } from './Tabs'
```

### Критерий готовности

- [ ] Tabs рендерятся, переключение меняет видимый panel
- [ ] Нет magic strings для value — только `STANDINGS_TAB.*`

---

## 5.2 — Хук useStandingsTab

### Файл: `src/hooks/useStandingsTab.ts`

```typescript
import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  DEFAULT_STANDINGS_TAB,
  SEARCH_PARAMS,
  STANDINGS_TAB,
  type StandingsTab,
} from '@/constants'

function resolveStandingsTab(param: string | null): StandingsTab {
  const values = Object.values(STANDINGS_TAB)
  if (param && values.includes(param as StandingsTab)) {
    return param as StandingsTab
  }
  return DEFAULT_STANDINGS_TAB
}

export function useStandingsTab() {
  const [searchParams, setSearchParams] = useSearchParams()

  const tab = resolveStandingsTab(searchParams.get(SEARCH_PARAMS.tab))

  const setTab = useCallback(
    (next: StandingsTab) => {
      setSearchParams(
        (prev) => {
          prev.set(SEARCH_PARAMS.tab, next)
          return prev
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return { tab, setTab }
}
```

> Аналог `useSeason` + `resolveSeason` из `@/lib/season`.  
> Можно вынести `resolveStandingsTab` в `src/lib/standingsTab.ts` + unit-тест (как `parseSeason`).

### Критерий готовности

- [ ] `/standings?tab=constructors` открывает вкладку Constructors
- [ ] Невалидный `?tab=foo` → fallback `drivers`
- [ ] Sidebar сохраняет и `season`, и `tab` при навигации (уже работает через `searchParams.toString()`)

---

## 5.3 — Hooks useDriverStandings / useConstructorStandings

### `src/hooks/useDriverStandings.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { getDriverStandings } from '@/api/endpoints'
import { QUERY_KEYS } from '@/constants'

export function useDriverStandings(season: number, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.driverStandings(season),
    queryFn: () => getDriverStandings(season),
    enabled: enabled && season > 0,
  })
}
```

### `src/hooks/useConstructorStandings.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { getConstructorStandings } from '@/api/endpoints'
import { QUERY_KEYS } from '@/constants'

export function useConstructorStandings(season: number, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.constructorStandings(season),
    queryFn: () => getConstructorStandings(season),
    enabled: enabled && season > 0,
  })
}
```

### Barrel — `src/hooks/index.ts`

```typescript
export { useDriverStandings } from './useDriverStandings'
export { useConstructorStandings } from './useConstructorStandings'
export { useStandingsTab } from './useStandingsTab'
```

### Стратегия загрузки

```typescript
const { tab } = useStandingsTab()
const { season } = useSeason()

const driversQuery = useDriverStandings(season, tab === STANDINGS_TAB.drivers)
const constructorsQuery = useConstructorStandings(season, tab === STANDINGS_TAB.constructors)

const activeQuery =
  tab === STANDINGS_TAB.drivers ? driversQuery : constructorsQuery
```

> При переключении вкладки данные кэшируются TanStack Query — повторный визит мгновенный.

### Критерий готовности

- [ ] `/standings?season=2024&tab=drivers` загружает ~20 пилотов
- [ ] Verstappen P1, 437 pts (финал 2024)
- [ ] Переключение на Constructors — отдельный запрос, кэш при возврате

---

## 5.4 — DriverStandingsTable

### Файл: `src/features/standings/DriverStandingsTable.tsx`

```typescript
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui'
import { DRIVER_STANDINGS_TABLE_COLUMNS } from '@/constants'
import type { DriverStanding } from '@/types'
import styles from './DriverStandingsTable.module.css'

interface DriverStandingsTableProps {
  standings: DriverStanding[]
}

export function DriverStandingsTable({ standings }: DriverStandingsTableProps) {
  return (
    <Table className={styles.table}>
      <TableHead>
        <TableRow>
          <TableHeaderCell>{DRIVER_STANDINGS_TABLE_COLUMNS.position}</TableHeaderCell>
          <TableHeaderCell>{DRIVER_STANDINGS_TABLE_COLUMNS.driver}</TableHeaderCell>
          <TableHeaderCell>{DRIVER_STANDINGS_TABLE_COLUMNS.team}</TableHeaderCell>
          <TableHeaderCell>{DRIVER_STANDINGS_TABLE_COLUMNS.points}</TableHeaderCell>
          <TableHeaderCell>{DRIVER_STANDINGS_TABLE_COLUMNS.wins}</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {standings.map((standing) => (
          <TableRow key={`${standing.position}-${standing.driverName}`}>
            <TableCell>{standing.position}</TableCell>
            <TableCell>{standing.driverName}</TableCell>
            <TableCell>{standing.constructor}</TableCell>
            <TableCell>{standing.points}</TableCell>
            <TableCell>{standing.wins}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Опционально: highlight P1–P3

```typescript
className={cn(standing.position <= 3 && styles.podiumRow)}
```

### `DriverStandingsTable.module.css`

```css
.table {
  width: 100%;
}
```

---

## 5.5 — ConstructorStandingsTable

### Файл: `src/features/standings/ConstructorStandingsTable.tsx`

```typescript
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui'
import { CONSTRUCTOR_STANDINGS_TABLE_COLUMNS } from '@/constants'
import type { ConstructorStanding } from '@/types'
import styles from './ConstructorStandingsTable.module.css'

interface ConstructorStandingsTableProps {
  standings: ConstructorStanding[]
}

export function ConstructorStandingsTable({ standings }: ConstructorStandingsTableProps) {
  return (
    <Table className={styles.table}>
      <TableHead>
        <TableRow>
          <TableHeaderCell>{CONSTRUCTOR_STANDINGS_TABLE_COLUMNS.position}</TableHeaderCell>
          <TableHeaderCell>{CONSTRUCTOR_STANDINGS_TABLE_COLUMNS.team}</TableHeaderCell>
          <TableHeaderCell>{CONSTRUCTOR_STANDINGS_TABLE_COLUMNS.points}</TableHeaderCell>
          <TableHeaderCell>{CONSTRUCTOR_STANDINGS_TABLE_COLUMNS.wins}</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {standings.map((standing) => (
          <TableRow key={`${standing.position}-${standing.name}`}>
            <TableCell>{standing.position}</TableCell>
            <TableCell>{standing.name}</TableCell>
            <TableCell>{standing.points}</TableCell>
            <TableCell>{standing.wins}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

---

## 5.6 — StandingsTabs (feature)

### Файл: `src/features/standings/StandingsTabs.tsx`

Обёртка над UI `Tabs`, связывает hooks, таблицы и состояния loading/error/empty.

```typescript
import { Button, Skeleton, Tabs, TabsList, TabsTrigger, TabsPanel } from '@/components/ui'
import { LABELS, STANDINGS_TAB } from '@/constants'
import { useStandingsTab } from '@/hooks/useStandingsTab'
import { useDriverStandings } from '@/hooks/useDriverStandings'
import { useConstructorStandings } from '@/hooks/useConstructorStandings'
import { DriverStandingsTable } from './DriverStandingsTable'
import { ConstructorStandingsTable } from './ConstructorStandingsTable'
import styles from './StandingsTabs.module.css'

interface StandingsTabsProps {
  season: number
}

function StandingsSkeleton() {
  return (
    <div className={styles.skeleton}>
      {Array.from({ length: 10 }, (_, index) => (
        <Skeleton key={index} height={40} />
      ))}
    </div>
  )
}

export function StandingsTabs({ season }: StandingsTabsProps) {
  const { tab, setTab } = useStandingsTab()

  const driversQuery = useDriverStandings(season, tab === STANDINGS_TAB.drivers)
  const constructorsQuery = useConstructorStandings(
    season,
    tab === STANDINGS_TAB.constructors,
  )

  const activeQuery =
    tab === STANDINGS_TAB.drivers ? driversQuery : constructorsQuery

  const { data, isLoading, isError, refetch } = activeQuery

  return (
    <Tabs value={tab} onChange={(value) => setTab(value as typeof tab)}>
      <TabsList>
        <TabsTrigger value={STANDINGS_TAB.drivers}>
          {LABELS.standingsTabDrivers}
        </TabsTrigger>
        <TabsTrigger value={STANDINGS_TAB.constructors}>
          {LABELS.standingsTabConstructors}
        </TabsTrigger>
      </TabsList>

      {isLoading && <StandingsSkeleton />}

      {isError && (
        <div className={styles.error}>
          <p>{LABELS.error}</p>
          <Button variant="secondary" onClick={() => refetch()}>
            {LABELS.retry}
          </Button>
        </div>
      )}

      {!isLoading && !isError && data?.length === 0 && (
        <p className={styles.empty}>{LABELS.noStandings}</p>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <>
          <TabsPanel value={STANDINGS_TAB.drivers} activeValue={tab}>
            <DriverStandingsTable standings={driversQuery.data ?? []} />
          </TabsPanel>

          <TabsPanel value={STANDINGS_TAB.constructors} activeValue={tab}>
            <ConstructorStandingsTable standings={constructorsQuery.data ?? []} />
          </TabsPanel>
        </>
      )}
    </Tabs>
  )
}
```

> **Альтернатива:** вынести loading/error/empty в `StandingsPage`, а `StandingsTabs` оставить только переключение + таблицы.  
> Рекомендация: держать состояния рядом с данными вкладки (как выше) — проще reasoning.

### Barrel — `src/features/standings/index.ts`

```typescript
export { StandingsTabs } from './StandingsTabs'
export { DriverStandingsTable } from './DriverStandingsTable'
export { ConstructorStandingsTable } from './ConstructorStandingsTable'
```

---

## 5.7 — StandingsPage

### Файл: `src/pages/StandingsPage.tsx`

```typescript
import { StandingsTabs } from '@/features/standings'
import { LABELS } from '@/constants'
import { useSeason } from '@/hooks/useSeason'
import styles from './StandingsPage.module.css'

export function StandingsPage() {
  const { season } = useSeason()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{LABELS.pageStandings}</h1>
      <StandingsTabs season={season} />
    </div>
  )
}
```

### `StandingsPage.module.css`

```css
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
}
```

### Удалить placeholder

Убрать `pageStandingsDescription` («coming soon») из UI.

---

## 5.8 — SeasonSelector (переиспользование)

**Изменений в Header не требуется** — `SeasonSelector` уже подключён и работает через `useSeason`.

### Проверки синхронизации

| # | Сценарий | Ожидание |
|---|----------|----------|
| 1 | `/calendar?season=2024` → Sidebar → Standings | `/standings?season=2024` |
| 2 | Смена сезона в Header на Standings | URL обновляется, данные перезапрашиваются |
| 3 | `/standings?season=2024&tab=constructors` → Calendar | season и tab сохраняются в URL |

> При смене сезона вкладка (`tab`) **не сбрасывается** — пользователь остаётся на Constructors, если был там.

### Опциональный рефакторинг (не блокер фазы)

Перенести `SeasonSelector` из `features/calendar/` в `src/components/SeasonSelector/` — второе переиспользование после Calendar.  
Для MVP достаточно импорта из `@/features/calendar` (как сейчас в Header).

---

## 5.9 — Тесты

### Минимальный набор

| Файл | Что проверяет |
|------|---------------|
| `lib/standingsTab.test.ts` | `resolveStandingsTab` valid/invalid/default |
| `components/ui/Tabs.test.tsx` | переключение panel по клику |
| `features/standings/DriverStandingsTable.test.tsx` | рендер колонок и строк |
| `features/standings/ConstructorStandingsTable.test.tsx` | рендер колонок и строк |
| `features/standings/StandingsTabs.test.tsx` | переключение вкладок (mock hooks или MSW) |

### Пример — resolveStandingsTab

```typescript
import { STANDINGS_TAB } from '@/constants'
import { resolveStandingsTab } from './standingsTab'

describe('resolveStandingsTab', () => {
  it('returns drivers by default', () => {
    expect(resolveStandingsTab(null)).toBe(STANDINGS_TAB.drivers)
  })

  it('returns constructors for valid param', () => {
    expect(resolveStandingsTab('constructors')).toBe(STANDINGS_TAB.constructors)
  })

  it('returns default for invalid param', () => {
    expect(resolveStandingsTab('invalid')).toBe(STANDINGS_TAB.drivers)
  })
})
```

### Пример — DriverStandingsTable

```typescript
const mockStandings: DriverStanding[] = [
  { position: 1, driverName: 'M. Verstappen', constructor: 'Red Bull', points: 437, wins: 9 },
]

render(<DriverStandingsTable standings={mockStandings} />)

expect(screen.getByText('M. Verstappen')).toBeInTheDocument()
expect(screen.getByText('437')).toBeInTheDocument()
expect(screen.getByText(DRIVER_STANDINGS_TABLE_COLUMNS.driver)).toBeInTheDocument()
```

### Пример — Tabs

```typescript
render(
  <Tabs value="a" onChange={onChange}>
    <TabsList>
      <TabsTrigger value="a">Tab A</TabsTrigger>
      <TabsTrigger value="b">Tab B</TabsTrigger>
    </TabsList>
    <TabsPanel value="a" activeValue="a">Content A</TabsPanel>
    <TabsPanel value="b" activeValue="a">Content B</TabsPanel>
  </Tabs>,
)

expect(screen.getByText('Content A')).toBeVisible()
expect(screen.queryByText('Content B')).not.toBeVisible()

await userEvent.click(screen.getByText('Tab B'))
expect(onChange).toHaveBeenCalledWith('b')
```

---

## 5.10 — Проверка и приёмка фазы

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
| 1 | Sidebar → Standings | `/standings?season={current}` |
| 2 | Вкладка Drivers, season 2024 | Verstappen P1, Norris P2 |
| 3 | Переключить на Constructors | McLaren / Ferrari / Red Bull в топе |
| 4 | Header → season 2025 | Таблицы обновляются |
| 5 | `/standings?season=2024&tab=constructors` | Сразу Constructors |
| 6 | Loading | Skeleton ~10 строк |
| 7 | Error (offline / invalid) | Сообщение + Retry |
| 8 | Calendar → Standings | `?season=` сохраняется |
| 9 | Refresh страницы | Данные загружаются снова |

### Definition of Done — Фаза 5

| # | Критерий | Статус |
|---|----------|--------|
| 1 | `STANDINGS_TAB` + table columns + labels | ☐ |
| 2 | UI `Tabs` component | ☐ |
| 3 | `useStandingsTab` + resolve helper | ☐ |
| 4 | `useDriverStandings`, `useConstructorStandings` | ☐ |
| 5 | `DriverStandingsTable`, `ConstructorStandingsTable` | ☐ |
| 6 | `StandingsTabs` + `StandingsPage` | ☐ |
| 7 | Loading / error / empty states | ☐ |
| 8 | Season sync через Header + Sidebar | ☐ |
| 9 | Tab sync через URL | ☐ |
| 10 | `pnpm test` / `lint` / `build` — OK | ☐ |
| 11 | Нет magic strings в standings feature | ☐ |
| 12 | **MVP Core complete** | ☐ |

---

## Итоговая структура файлов

```
src/
├── constants/
│   ├── standingsTab.ts              # NEW
│   ├── tableColumns.ts              # UPDATE
│   ├── searchParams.ts              # UPDATE — tab
│   ├── labels.ts                    # UPDATE
│   └── index.ts                     # UPDATE
├── components/ui/
│   ├── Tabs.tsx                     # NEW
│   ├── Tabs.module.css              # NEW
│   ├── Tabs.test.tsx                # NEW
│   └── index.ts                     # UPDATE
├── hooks/
│   ├── useDriverStandings.ts        # NEW
│   ├── useConstructorStandings.ts   # NEW
│   ├── useStandingsTab.ts           # NEW
│   └── index.ts                     # UPDATE
├── lib/
│   ├── standingsTab.ts              # NEW — resolveStandingsTab
│   └── standingsTab.test.ts         # NEW
├── features/
│   └── standings/
│       ├── StandingsTabs.tsx
│       ├── StandingsTabs.module.css
│       ├── DriverStandingsTable.tsx
│       ├── DriverStandingsTable.module.css
│       ├── DriverStandingsTable.test.tsx
│       ├── ConstructorStandingsTable.tsx
│       ├── ConstructorStandingsTable.module.css
│       ├── ConstructorStandingsTable.test.tsx
│       └── index.ts
└── pages/
    ├── StandingsPage.tsx            # UPDATE
    └── StandingsPage.module.css     # NEW
```

---

## Чеклист задач

### 5.0 — Константы
- [ ] `STANDINGS_TAB`, `DEFAULT_STANDINGS_TAB` в `standingsTab.ts`
- [ ] `SEARCH_PARAMS.tab`
- [ ] `DRIVER_STANDINGS_TABLE_COLUMNS`, `CONSTRUCTOR_STANDINGS_TABLE_COLUMNS`
- [ ] `LABELS` — standingsTabDrivers, standingsTabConstructors, noStandings

### 5.1 — UI Tabs
- [ ] `Tabs`, `TabsList`, `TabsTrigger`, `TabsPanel`
- [ ] CSS Modules + a11y attributes
- [ ] Export из `components/ui/index.ts`

### 5.2 — useStandingsTab
- [ ] `resolveStandingsTab` + test
- [ ] `useStandingsTab` hook

### 5.3 — Data hooks
- [ ] `useDriverStandings(season, enabled?)`
- [ ] `useConstructorStandings(season, enabled?)`
- [ ] `hooks/index.ts` exports

### 5.4 — Feature components
- [ ] `DriverStandingsTable` + CSS + test
- [ ] `ConstructorStandingsTable` + CSS + test
- [ ] `StandingsTabs` — tabs + loading/error/empty
- [ ] `features/standings/index.ts`

### 5.5 — StandingsPage
- [ ] Заменить placeholder на `StandingsTabs`
- [ ] `StandingsPage.module.css`
- [ ] Убрать «coming soon» description

### 5.6 — Тесты
- [ ] `standingsTab.test.ts`
- [ ] `Tabs.test.tsx`
- [ ] Table component tests
- [ ] (optional) `StandingsTabs.test.tsx`

### 5.7 — Приёмка
- [ ] Season sync Calendar ↔ Standings
- [ ] Tab в URL работает
- [ ] `pnpm dev` / `test` / `lint` / `build`
- [ ] Definition of Done — все пункты

---

## Что дальше

После завершения Фазы 5 переходить к **[Фаза 6 — Главная](./development-plan.md#фаза-6--главная)**:

- `getNextRace`, `getLastCompletedRace`
- `NextRaceCard`, `LatestResultsPreview`, `QuickLinksGrid`
- `HomePage` с обзором сезона

Затем **[Фаза 7 — Дашборд](./development-plan.md#фаза-7--дашборд)** — summary cards + Recharts bar charts.

**MVP Core complete** после Фазы 5: Calendar + Race Results + Driver & Constructor Standings.

---

## Заметки и решения

| Вопрос | Решение |
|--------|---------|
| Constructor Standings в MVP Core или Extended? | В `development-plan.md` Drivers — Core, Constructors — Extended; в `project-description.md` обе вкладки в MVP. **Фаза 5 включает обе** — минимальный доп. объём (~30 мин) |
| Tab state: URL vs local | URL `?tab=` — shareable, консистентно с `?season=` |
| Prefetch обеих вкладок? | Нет — `enabled` только для активной; кэш при переключении |
| SeasonSelector location | Оставить в `features/calendar/`, импорт в Header — рефакторинг опционален |
| Points / wins formatting | Number as-is; без decimal (API возвращает целые) |
| Tie in position | API уже отдаёт position — показываем как есть |
| Mid-season vs end-season | Mapper берёт **последний** `StandingsLists` — актуальный срез |
| Empty constructors array | `LABELS.noStandings` |
| Key в таблицах | `` `${position}-${driverName}` `` / `` `${position}-${name}` `` |
| StandingsTabs vs page-level states | Состояния в `StandingsTabs` — меньше props drilling |

---

## Порядок реализации (рекомендуемый)

```
constants → standingsTab lib → UI Tabs → useStandingsTab
  → useDriverStandings + useConstructorStandings
  → DriverStandingsTable → ConstructorStandingsTable
  → StandingsTabs → StandingsPage
  → tests → manual E2E season/tab sync
```

После **Tabs + DriverStandingsTable + useDriverStandings** можно проверить `/standings?season=2024&tab=drivers` до Constructors и polish error states.
