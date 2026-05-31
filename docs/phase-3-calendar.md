# F1 Dashboard — Фаза 3: Календарь

> Подробный пошаговый план первого рабочего раздела с реальными данными.
>
> Связанные документы:
> - [project-description.md](./project-description.md) — раздел Calendar, сезон в URL
> - [development-plan.md](./development-plan.md) — общий план MVP и все фазы
> - [phase-1-api-layer.md](./phase-1-api-layer.md) — API-слой, константы
> - [phase-2-layout-routing.md](./phase-2-layout-routing.md) — layout, роутинг (завершена)

**Оценка:** 2–3 часа  
**Цель фазы:** страница `/calendar` показывает список гонок выбранного сезона из Jolpica API. Фильтр сезона синхронизирован с URL и Header. Первый **MVP Core** раздел с данными.

---

## Содержание

1. [Предварительные требования](#1-предварительные-требования)
2. [Обзор фазы](#2-обзор-фазы)
3. [Архитектура](#3-архитектура)
4. [3.0 — Константы](#30--константы)
5. [3.1 — Хук useSeason (URL query)](#31--хук-useseason-url-query)
6. [3.2 — Query keys и useRaces](#32--query-keys-и-useraces)
7. [3.3 — UI: Table и Select](#33--ui-table-и-select)
8. [3.4 — RaceStatusBadge](#34--racestatusbadge)
9. [3.5 — SeasonSelector](#35--seasonselector)
10. [3.6 — RaceTable (feature)](#36--racetable-feature)
11. [3.7 — CalendarPage](#37--calendarpage)
12. [3.8 — Header: оживить season selector](#38--header-оживить-season-selector)
13. [3.9 — Форматтер даты](#39--форматтер-даты)
14. [3.10 — Тесты](#310--тесты)
15. [3.11 — Проверка и приёмка фазы](#311--проверка-и-приёмка-фазы)
16. [Итоговая структура файлов](#итоговая-структура-файлов)
17. [Чеклист задач](#чеклист-задач)

---

## 1. Предварительные требования

Фазы 0–2 должны быть завершены:

| Критерий | Проверка |
|----------|----------|
| API `getRaces(season)` | `@/api/endpoints` |
| Тип `Race` + `RACE_STATUS` | `@/types`, `@/constants` |
| `QueryClientProvider` | `app/providers.tsx` |
| Маршрут `/calendar` | `ROUTES.calendar` |
| UI: `Badge`, `Skeleton`, `Card` | `components/ui/` |
| Header season placeholder | disabled `<select>` в `Header.tsx` |
| `pnpm test` / `pnpm build` | проходят |

---

## 2. Обзор фазы

### Что делаем

| # | Задача | Результат |
|---|--------|-----------|
| 3.0 | Константы: seasons, queryKeys, tableColumns, badgeLabels | Без magic strings |
| 3.1 | `useSeason` — `?season=2026` в URL | Shareable links, синхронизация Header |
| 3.2 | `useRaces(season)` — TanStack Query | Кэш, loading, error |
| 3.3 | UI `Table`, `Select` | Переиспользуемые компоненты |
| 3.4 | `RaceStatusBadge` | completed / upcoming |
| 3.5 | `SeasonSelector` | Dropdown 2024–2026 |
| 3.6 | `RaceTable` | Таблица гонок + ссылки на результаты |
| 3.7 | `CalendarPage` | Сборка + loading/error/empty |
| 3.8 | Header | Подключить `SeasonSelector` |

### Что **не** делаем

- Результаты гонки (Фаза 4)
- Standings / Dashboard / Home с данными (Фазы 5–7)
- Mobile hamburger (Фаза 8)
- Qualifying, live data

### UX — Calendar Page

```
┌─────────────────────────────────────────────────────────┐
│  Calendar                                               │
│  ┌───────────────────────────────────────────────────┐│
│  │ Round │ Date       │ GP Name        │ Country │ … ││
│  ├───────┼────────────┼────────────────┼─────────┼───┤│
│  │ 1     │ 2 Mar 2024 │ Bahrain GP     │ Bahrain │ ✓ ││  ← row → /races/2024/1
│  │ 2     │ 9 Mar 2024 │ Saudi Arabian  │ …       │ ✓ ││
│  └───────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
         Season selector — в Header (глобально)
```

### Колонки таблицы (MVP)

| Колонка | Поле `Race` | Формат |
|---------|-------------|--------|
| Round | `round` | number |
| Date | `date` | `formatRaceDate(date)` |
| Grand Prix | `name` | string |
| Country | `country` | string |
| Circuit | `circuit` | string |
| Status | `status` | `RaceStatusBadge` |

---

## 3. Архитектура

### Поток данных

```
URL ?season=2024
  → useSeason() → season: 2024
  → useRaces(2024)
       → queryKey: ['races', 2024]
       → queryFn: getRaces(2024)
       → Race[]
  → RaceTable → row Link → /races/2024/1
```

### Feature folder

```
src/features/calendar/
├── RaceTable.tsx
├── RaceTable.module.css
├── RaceStatusBadge.tsx
├── SeasonSelector.tsx
├── SeasonSelector.module.css
└── index.ts
```

> `SeasonSelector` можно вынести в `src/components/` позже (Фаза 5 — Standings тоже использует).  
> Для MVP — начать в `features/calendar/`, при втором использовании — `components/SeasonSelector/`.

### Hooks

```
src/hooks/
├── useSeason.ts
├── useRaces.ts
└── index.ts
```

### Принципы

| Принцип | Решение |
|---------|---------|
| Сезон в URL | `?season=2026`, не Zustand |
| Query keys | `QUERY_KEYS.races(season)` — константа-паттерн |
| Страница тонкая | `CalendarPage` только компонует feature + hooks |
| Ссылки на гонку | `routePaths.raceResults(season, round)` |
| Сравнение статусов | `RACE_STATUS.*`, labels через `BADGE_LABELS` |
| Completed races only clickable? | **Нет** — все строки кликабельны; API вернёт empty/error для будущих гонок в Фазе 4 |

---

## 3.0 — Константы

### Новые / обновляемые файлы

```
src/constants/
├── seasons.ts          # NEW
├── queryKeys.ts        # NEW
├── tableColumns.ts     # NEW
├── badgeLabels.ts      # NEW
├── searchParams.ts     # NEW — ключи URL query
├── labels.ts           # UPDATE — calendar-specific labels
└── index.ts            # UPDATE
```

### `src/constants/seasons.ts`

```typescript
export const AVAILABLE_SEASONS = [2024, 2025, 2026] as const

export type Season = (typeof AVAILABLE_SEASONS)[number]

export const DEFAULT_SEASON = 2026 satisfies Season
```

### `src/constants/searchParams.ts`

```typescript
export const SEARCH_PARAMS = {
  season: 'season',
} as const
```

### `src/constants/queryKeys.ts`

```typescript
export const QUERY_KEYS = {
  races: (season: number) => ['races', season] as const,
  raceResults: (season: number, round: number) => ['raceResults', season, round] as const,
  driverStandings: (season: number) => ['driverStandings', season] as const,
  constructorStandings: (season: number) => ['constructorStandings', season] as const,
} as const
```

> Ключи для standings/results — заготовка для Фаз 4–5.

### `src/constants/tableColumns.ts`

```typescript
export const CALENDAR_TABLE_COLUMNS = {
  round: 'Round',
  date: 'Date',
  grandPrix: 'Grand Prix',
  country: 'Country',
  circuit: 'Circuit',
  status: 'Status',
} as const
```

### `src/constants/badgeLabels.ts`

```typescript
import { RACE_STATUS } from './raceStatus'

export const BADGE_LABELS = {
  [RACE_STATUS.completed]: 'Completed',
  [RACE_STATUS.upcoming]: 'Upcoming',
} as const
```

### Дополнить `src/constants/labels.ts`

```typescript
export const LABELS = {
  // ...existing
  loading: 'Loading...',
  error: 'Something went wrong. Please try again.',
  noRaces: 'No races found for this season.',
  retry: 'Retry',
  calendarEmpty: 'No races scheduled.',
} as const
```

### Обновить `src/constants/index.ts`

Экспорт всех новых модулей.

### Критерий готовности

- [ ] Нет `'season'`, `'Round'`, `'Completed'` как литералов в feature/hooks

---

## 3.1 — Хук useSeason (URL query)

### Задача

Единый источник выбранного сезона. Header и страницы читают одно и то же значение из URL.

### Файл: `src/hooks/useSeason.ts`

```typescript
import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AVAILABLE_SEASONS,
  DEFAULT_SEASON,
  SEARCH_PARAMS,
  type Season,
} from '@/constants'

function parseSeason(value: string | null): Season | null {
  if (!value) return null
  const num = Number(value)
  return AVAILABLE_SEASONS.includes(num as Season) ? (num as Season) : null
}

export function useSeason() {
  const [searchParams, setSearchParams] = useSearchParams()

  const season = parseSeason(searchParams.get(SEARCH_PARAMS.season)) ?? DEFAULT_SEASON

  const setSeason = useCallback(
    (next: Season) => {
      setSearchParams(
        (prev) => {
          prev.set(SEARCH_PARAMS.season, String(next))
          return prev
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return { season, setSeason, availableSeasons: AVAILABLE_SEASONS }
}
```

### Поведение

| Сценарий | Результат |
|----------|-----------|
| `/calendar` (без query) | `season = DEFAULT_SEASON` (2026) |
| `/calendar?season=2024` | `season = 2024` |
| `/calendar?season=1999` | fallback → `DEFAULT_SEASON` |
| Смена сезона в Header | URL обновляется, Query refetch |

> `replace: true` — не засорять history при каждой смене сезона.

### Синхронизация между страницами

Season selector в Header → при переходе Calendar → Standings сезон сохраняется в URL.

**Проверка:** `/calendar?season=2024` → клик Standings → URL должен сохранить `?season=2024`.  
Для этого `NavLink`/`Link` в Sidebar должны **сохранять search params** — использовать `Link` с `to={{ pathname, search }}` или `useSearchParams` в Sidebar (Фаза 3.8+).

### Решение для Sidebar (важно)

```typescript
// Sidebar.tsx — сохранять ?season= при навигации
import { useSearchParams } from 'react-router-dom'

const [searchParams] = useSearchParams()
const search = searchParams.toString()

<NavLink to={{ pathname: item.path, search: search ? `?${search}` : '' }}>
```

### Barrel: `src/hooks/index.ts`

```typescript
export { useSeason } from './useSeason'
export { useRaces } from './useRaces'
```

---

## 3.2 — Query keys и useRaces

### Файл: `src/hooks/useRaces.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { getRaces } from '@/api/endpoints'
import { QUERY_KEYS } from '@/constants'

export function useRaces(season: number) {
  return useQuery({
    queryKey: QUERY_KEYS.races(season),
    queryFn: () => getRaces(season),
  })
}
```

### Использование в CalendarPage

```typescript
const { season } = useSeason()
const { data: races, isLoading, isError, error, refetch } = useRaces(season)
```

### Кэширование

При переключении 2024 → 2025 → 2024 данные 2024 берутся из кэша (staleTime 5 min из Фазы 2).

### Критерий готовности

- [ ] `useRaces(2024)` возвращает ~22–24 гонки (зависит от сезона)
- [ ] Повторный запрос того же сезона — без лишнего fetch (devtools)

---

## 3.3 — UI: Table и Select

### Задача

Добавить переиспользуемые компоненты, которых не было в Фазе 0.

### Table — `src/components/ui/Table.tsx`

Комposable API (простой, без over-engineering):

```typescript
interface TableProps {
  children: React.ReactNode
  className?: string
}

export function Table({ children, className }: TableProps) { ... }
export function TableHead({ children }: { children: React.ReactNode }) { ... }
export function TableBody({ children }: { children: React.ReactNode }) { ... }
export function TableRow({ children, className }: ...) { ... }
export function TableHeaderCell({ children }: ...) { ... }
export function TableCell({ children }: ...) { ... }
```

**`Table.module.css`:**

```css
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.head {
  background-color: var(--color-bg-secondary);
}

.header-cell {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-weight: 600;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
}

.cell {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.row:hover {
  background-color: var(--color-bg-elevated);
}

.clickable {
  cursor: pointer;
}
```

### Select — `src/components/ui/Select.tsx`

Обёртка над native `<select>` (как в Header, но переиспользуемая):

```typescript
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: readonly { value: string; label: string }[]
}

export function Select({ label, options, className, ...props }: SelectProps) { ... }
```

**Стили** — переиспользовать паттерн из `Header.module.css` (`.season-select`).

### Обновить `components/ui/index.ts`

```typescript
export { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from './Table'
export { Select } from './Select'
```

### Критерий готовности

- [ ] Table рендерится с заголовками и строками
- [ ] Select работает controlled/uncontrolled

---

## 3.4 — RaceStatusBadge

### Файл: `src/features/calendar/RaceStatusBadge.tsx`

```typescript
import { Badge } from '@/components/ui'
import { BADGE_LABELS, RACE_STATUS, type RaceStatus } from '@/constants'

const VARIANT_MAP = {
  [RACE_STATUS.completed]: 'success',
  [RACE_STATUS.upcoming]: 'accent',
} as const satisfies Record<RaceStatus, 'success' | 'accent'>

interface RaceStatusBadgeProps {
  status: RaceStatus
}

export function RaceStatusBadge({ status }: RaceStatusBadgeProps) {
  return (
    <Badge variant={VARIANT_MAP[status]}>
      {BADGE_LABELS[status]}
    </Badge>
  )
}
```

> `VARIANT_MAP` — mapping константа; при добавлении статусов — расширить `RACE_STATUS` + `BADGE_LABELS`.

---

## 3.5 — SeasonSelector

### Файл: `src/features/calendar/SeasonSelector.tsx`

```typescript
import { Select } from '@/components/ui'
import { LABELS } from '@/constants'
import { useSeason } from '@/hooks/useSeason'
import styles from './SeasonSelector.module.css'

export function SeasonSelector() {
  const { season, setSeason, availableSeasons } = useSeason()

  const options = availableSeasons.map((year) => ({
    value: String(year),
    label: String(year),
  }))

  return (
    <div className={styles.wrapper}>
      <Select
        label={LABELS.seasonSelector}
        options={options}
        value={String(season)}
        onChange={(e) => setSeason(Number(e.target.value) as Season)}
        aria-label={LABELS.seasonSelector}
      />
    </div>
  )
}
```

> Import `Season` type from `@/constants`.

### Где используется

1. **Header** — заменить disabled placeholder
2. (опционально) CalendarPage toolbar — **не дублировать**, достаточно Header

---

## 3.6 — RaceTable (feature)

### Файл: `src/features/calendar/RaceTable.tsx`

```typescript
import { Link } from 'react-router-dom'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui'
import { CALENDAR_TABLE_COLUMNS, routePaths } from '@/constants'
import { formatRaceDate } from '@/lib/formatters'
import type { Race } from '@/types'
import { RaceStatusBadge } from './RaceStatusBadge'
import styles from './RaceTable.module.css'

interface RaceTableProps {
  races: Race[]
}

export function RaceTable({ races }: RaceTableProps) {
  return (
    <Table className={styles.table}>
      <TableHead>
        <TableRow>
          <TableHeaderCell>{CALENDAR_TABLE_COLUMNS.round}</TableHeaderCell>
          <TableHeaderCell>{CALENDAR_TABLE_COLUMNS.date}</TableHeaderCell>
          <TableHeaderCell>{CALENDAR_TABLE_COLUMNS.grandPrix}</TableHeaderCell>
          <TableHeaderCell>{CALENDAR_TABLE_COLUMNS.country}</TableHeaderCell>
          <TableHeaderCell>{CALENDAR_TABLE_COLUMNS.circuit}</TableHeaderCell>
          <TableHeaderCell>{CALENDAR_TABLE_COLUMNS.status}</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {races.map((race) => (
          <TableRow key={`${race.season}-${race.round}`} className={styles.clickableRow}>
            <TableCell>
              <Link
                to={routePaths.raceResults(race.season, race.round)}
                className={styles.rowLink}
              >
                {race.round}
              </Link>
            </TableCell>
            {/* ... остальные ячейки — Link на всю строку или одна обёртка */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Паттерн кликабельной строки (рекомендация)

Обернуть **всю строку** одним `Link` сложно (invalid HTML). Варианты:

**A — Link в первой колонке (GP name)** + `onClick` row navigate — проще для MVP:

```typescript
<TableRow
  className={styles.clickableRow}
  onClick={() => navigate(routePaths.raceResults(race.season, race.round))}
  role="link"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && navigate(...)}
>
```

**B — `<Link>` только на название GP** — минимальный diff.

Рекомендация: **вариант A** — вся строка кликабельна, доступность через `role="link"`.

### Barrel: `src/features/calendar/index.ts`

```typescript
export { RaceTable } from './RaceTable'
export { RaceStatusBadge } from './RaceStatusBadge'
export { SeasonSelector } from './SeasonSelector'
```

---

## 3.7 — CalendarPage

### Файл: `src/pages/CalendarPage.tsx`

```typescript
import { Button, Skeleton } from '@/components/ui'
import { RaceTable } from '@/features/calendar'
import { LABELS } from '@/constants'
import { useSeason } from '@/hooks/useSeason'
import { useRaces } from '@/hooks/useRaces'
import styles from './CalendarPage.module.css'

export function CalendarPage() {
  const { season } = useSeason()
  const { data: races, isLoading, isError, refetch } = useRaces(season)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{LABELS.pageCalendar}</h1>

      {isLoading && <CalendarSkeleton />}

      {isError && (
        <div className={styles.error}>
          <p>{LABELS.error}</p>
          <Button variant="secondary" onClick={() => refetch()}>
            {LABELS.retry}
          </Button>
        </div>
      )}

      {!isLoading && !isError && races?.length === 0 && (
        <p className={styles.empty}>{LABELS.noRaces}</p>
      )}

      {!isLoading && !isError && races && races.length > 0 && (
        <RaceTable races={races} />
      )}
    </div>
  )
}
```

### CalendarSkeleton (локально или отдельный файл)

```typescript
function CalendarSkeleton() {
  return (
    <div className={styles.skeleton}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} height={40} />
      ))}
    </div>
  )
}
```

### Удалить placeholder-текст

Убрать `pageCalendarDescription: '...coming soon.'` из отображения (константу можно оставить или удалить).

---

## 3.8 — Header: оживить season selector

### Задача

Заменить disabled `<select>` на `<SeasonSelector />`.

### `Header.tsx`

```typescript
import { SeasonSelector } from '@/features/calendar'
import { LABELS } from '@/constants'
import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>...</div>
      <div className={styles.actions}>
        <SeasonSelector />
      </div>
    </header>
  )
}
```

### Sidebar — сохранение `?season=`

Обновить `Sidebar.tsx` (см. [3.1](#31--хук-useseason-url-query)).

### Критерий готовности

- [ ] Смена сезона в Header обновляет URL
- [ ] CalendarPage refetch при смене сезона
- [ ] Навигация sidebar сохраняет query param

---

## 3.9 — Форматтер даты

### Файл: `src/lib/formatters.ts`

```typescript
export function formatRaceDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
```

Пример: `2024-03-02` → `2 Mar 2024`

### Unit-тест (опционально)

```typescript
// src/lib/formatters.test.ts
expect(formatRaceDate('2024-03-02')).toBe('2 Mar 2024')
```

> Locale может отличаться в CI — использовать фиксированный locale `en-GB` или regex.

---

## 3.10 — Тесты

### Минимальный набор

| Файл | Что проверяет |
|------|---------------|
| `hooks/useSeason.test.ts` | `parseSeason` logic (extract pure fn) |
| `features/calendar/RaceStatusBadge.test.tsx` | completed → success badge text |
| `lib/formatters.test.ts` | `formatRaceDate` |

### Пример — RaceStatusBadge

```typescript
import { render, screen } from '@testing-library/react'
import { RaceStatusBadge } from './RaceStatusBadge'
import { BADGE_LABELS, RACE_STATUS } from '@/constants'

it('renders completed label', () => {
  render(<RaceStatusBadge status={RACE_STATUS.completed} />)
  expect(screen.getByText(BADGE_LABELS[RACE_STATUS.completed])).toBeInTheDocument()
})
```

### Тест useRaces с MSW — опционально

Для MVP достаточно unit-тестов; integration с mock fetch — Post-MVP.

### Query wrapper для component tests

```typescript
function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
```

---

## 3.11 — Проверка и приёмка фазы

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
| 1 | `/calendar` | Таблица гонок 2026 (или DEFAULT_SEASON) |
| 2 | Header → 2024 | URL `?season=2024`, таблица обновилась |
| 3 | Refresh на `?season=2024` | Данные 2024 сохраняются |
| 4 | Клик по строке гонки | `/races/2024/1` (или соответствующий round) |
| 5 | Sidebar → Standings | URL сохраняет `?season=2024` |
| 6 | DevTools → Network | Повторный сезон — из кэша |
| 7 | Offline / block API | Error state + Retry |

### Definition of Done — Фаза 3

| # | Критерий | Статус |
|---|----------|--------|
| 1 | Константы: seasons, queryKeys, tableColumns, badgeLabels | ☐ |
| 2 | `useSeason` + URL `?season=` | ☐ |
| 3 | `useRaces` через TanStack Query | ☐ |
| 4 | UI: `Table`, `Select` | ☐ |
| 5 | `RaceStatusBadge`, `RaceTable`, `SeasonSelector` | ☐ |
| 6 | `CalendarPage` — loading / error / empty / data | ☐ |
| 7 | Header season selector активен | ☐ |
| 8 | Sidebar сохраняет season query | ☐ |
| 9 | Строка таблицы → `/races/:season/:round` | ☐ |
| 10 | `formatRaceDate` работает | ☐ |
| 11 | `pnpm test` / `lint` / `build` — OK | ☐ |
| 12 | Нет magic strings в calendar feature | ☐ |

---

## Итоговая структура файлов

```
src/
├── constants/
│   ├── seasons.ts              # NEW
│   ├── searchParams.ts         # NEW
│   ├── queryKeys.ts            # NEW
│   ├── tableColumns.ts         # NEW
│   ├── badgeLabels.ts          # NEW
│   ├── labels.ts               # UPDATE
│   └── index.ts
├── hooks/
│   ├── useSeason.ts            # NEW
│   ├── useRaces.ts             # NEW
│   └── index.ts
├── features/
│   └── calendar/
│       ├── RaceTable.tsx
│       ├── RaceTable.module.css
│       ├── RaceStatusBadge.tsx
│       ├── RaceStatusBadge.test.tsx
│       ├── SeasonSelector.tsx
│       ├── SeasonSelector.module.css
│       └── index.ts
├── components/
│   ├── ui/
│   │   ├── Table.tsx           # NEW
│   │   ├── Table.module.css
│   │   ├── Select.tsx          # NEW
│   │   ├── Select.module.css
│   │   └── index.ts            # UPDATE
│   └── layout/
│       ├── Header.tsx          # UPDATE — SeasonSelector
│       └── Sidebar.tsx         # UPDATE — preserve search
├── lib/
│   ├── formatters.ts           # UPDATE — formatRaceDate
│   └── formatters.test.ts      # NEW (optional)
└── pages/
    ├── CalendarPage.tsx        # UPDATE
    └── CalendarPage.module.css # NEW
```

---

## Чеклист задач

### 3.0 — Константы
- [ ] `seasons.ts` — `AVAILABLE_SEASONS`, `DEFAULT_SEASON`
- [ ] `searchParams.ts` — `SEARCH_PARAMS.season`
- [ ] `queryKeys.ts` — `QUERY_KEYS.races` (+ заготовки)
- [ ] `tableColumns.ts` — `CALENDAR_TABLE_COLUMNS`
- [ ] `badgeLabels.ts` — `BADGE_LABELS`
- [ ] `labels.ts` — loading, error, noRaces, retry
- [ ] `index.ts` barrel

### 3.1 — useSeason
- [ ] `hooks/useSeason.ts`
- [ ] `parseSeason` validation
- [ ] Sidebar сохраняет query param

### 3.2 — useRaces
- [ ] `hooks/useRaces.ts`
- [ ] `hooks/index.ts`

### 3.3 — UI Table / Select
- [ ] `Table` + subcomponents + CSS
- [ ] `Select` + CSS
- [ ] `ui/index.ts` export

### 3.4 — Feature components
- [ ] `RaceStatusBadge`
- [ ] `SeasonSelector`
- [ ] `RaceTable` + clickable rows
- [ ] `features/calendar/index.ts`

### 3.5 — CalendarPage
- [ ] Loading skeleton
- [ ] Error + retry
- [ ] Empty state
- [ ] RaceTable with data

### 3.6 — Header
- [ ] Заменить placeholder на `SeasonSelector`

### 3.7 — Formatters
- [ ] `formatRaceDate`
- [ ] (optional) unit test

### 3.8 — Тесты
- [ ] RaceStatusBadge test
- [ ] (optional) formatters, parseSeason

### 3.9 — Приёмка
- [ ] Ручная проверка 7 пунктов
- [ ] `pnpm dev` / `test` / `lint` / `build`
- [ ] Definition of Done — все пункты

---

## Что дальше

После завершения Фазы 3 переходить к **[Фаза 4 — Результаты гонки](./development-plan.md#фаза-4--результаты-гонки)**:

- Hook `useRaceResults(season, round)`
- `RaceResultsPage` с реальными данными
- `ResultsTable`, `RaceHeader`
- Форматирование статуса через `RESULT_STATUS`

Переход из календаря по клику на строку уже будет работать — останется отобразить данные на странице результатов.

---

## Заметки и решения

| Вопрос | Решение |
|--------|---------|
| Season в Zustand? | Нет — URL query `?season=` |
| DEFAULT_SEASON | `2026` — текущий сезон MVP |
| SeasonSelector в Header и на странице? | Только Header — не дублировать |
| Клик по upcoming race | Разрешён; Фаза 4 обработает пустые/ошибочные results |
| `Table` vs native `<table>` | Composable UI component — переиспользуется в Standings |
| Где `SeasonSelector` жить? | `features/calendar/` → перенести в `components/` в Фазе 5 |
| Magic strings | `CALENDAR_TABLE_COLUMNS`, `BADGE_LABELS`, `LABELS.*` |
| API ошибка | Error UI + `refetch()` кнопка |

---

## Порядок реализации (рекомендуемый)

```
constants → formatRaceDate → Table/Select → useSeason → useRaces
  → RaceStatusBadge → RaceTable → SeasonSelector → CalendarPage
  → Header + Sidebar → tests → manual QA
```

После **useRaces + RaceTable** можно проверить данные на `/calendar` до polish Header/Sidebar.
