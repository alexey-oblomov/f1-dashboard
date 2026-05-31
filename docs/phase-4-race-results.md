# F1 Dashboard — Фаза 4: Результаты гонки

> Подробный пошаговый план страницы финишной классификации.
>
> Связанные документы:
> - [project-description.md](./project-description.md) — раздел Race Results, колонки таблицы
> - [development-plan.md](./development-plan.md) — общий план MVP и все фазы
> - [phase-1-api-layer.md](./phase-1-api-layer.md) — API-слой, `getRaceResults`, `RESULT_STATUS`
> - [phase-3-calendar.md](./phase-3-calendar.md) — календарь, ссылки на `/races/:season/:round` (завершена)

**Оценка:** 2 часа  
**Цель фазы:** по клику из календаря открывается страница `/races/:season/:round` с заголовком гонки и таблицей результатов из Jolpica API.

---

## Содержание

1. [Предварительные требования](#1-предварительные-требования)
2. [Обзор фазы](#2-обзор-фазы)
3. [Архитектура](#3-архитектура)
4. [4.0 — Константы](#40--константы)
5. [4.1 — Хук useRaceResults](#41--хук-useraceresults)
6. [4.2 — Валидация route params](#42--валидация-route-params)
7. [4.3 — Форматирование статуса результата](#43--форматирование-статуса-результата)
8. [4.4 — RaceHeader](#44--raceheader)
9. [4.5 — ResultsTable](#45--resultstable)
10. [4.6 — RaceResultsPage](#46--raceresultspage)
11. [4.7 — Тесты](#47--тесты)
12. [4.8 — Проверка и приёмка фазы](#48--проверка-и-приёмка-фазы)
13. [Итоговая структура файлов](#итоговая-структура-файлов)
14. [Чеклист задач](#чеклист-задач)

---

## 1. Предварительные требования

Фазы 0–3 должны быть завершены:

| Критерий | Проверка |
|----------|----------|
| API `getRaceResults(season, round)` | `@/api/endpoints` |
| Тип `RaceResultsData`, `RaceResult` | `@/types` |
| `QUERY_KEYS.raceResults` | `@/constants/queryKeys.ts` |
| `RESULT_STATUS` | `@/constants/resultStatus.ts` |
| UI `Table`, `Badge`, `Skeleton`, `Button` | `components/ui/` |
| `formatRaceDate` | `@/lib/formatters.ts` |
| Маршрут `/races/:season/:round` | `ROUTES.raceResults` |
| Календарь → клик по строке | `RaceTable` + `routePaths.raceResults` |
| `pnpm test` / `pnpm build` | проходят |

---

## 2. Обзор фазы

### Что делаем

| # | Задача | Результат |
|---|--------|-----------|
| 4.0 | Константы: `RESULTS_TABLE_COLUMNS`, labels, status variants | Без magic strings |
| 4.1 | `useRaceResults(season, round)` | TanStack Query |
| 4.2 | `parseRaceRouteParams` | Валидация `:season/:round` из URL |
| 4.3 | `formatResultStatus` / `getResultStatusVariant` | Finished / Retired / +1 Lap / DSQ |
| 4.4 | `RaceHeader` | Round, название GP, дата |
| 4.5 | `ResultsTable` | Таблица классификации |
| 4.6 | `RaceResultsPage` | Сборка + loading / error / empty |

### Что **не** делаем

- Qualifying results (Post-MVP)
- DriverRow с цветом команды (опционально Post-MVP)
- Standings / Home / Dashboard (Фазы 5–7)
- Live timing

### UX — Race Results Page

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Calendar                                         │
│                                                             │
│  Round 1 — Bahrain Grand Prix 2024                          │
│  2 Mar 2024                                                 │
│                                                             │
│  ┌─────┬──────────────┬───────────┬────────┬──────────────┐ │
│  │ Pos │ Driver       │ Team      │ Points │ Status       │ │
│  ├─────┼──────────────┼───────────┼────────┼──────────────┤ │
│  │ 1   │ M. Verstappen│ Red Bull  │ 25     │ Finished     │ │
│  │ 2   │ S. Pérez     │ Red Bull  │ 18     │ Finished     │ │
│  │ …   │ …            │ …         │ …      │ …            │ │
│  └─────┴──────────────┴───────────┴────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Колонки таблицы (MVP)

| Колонка | Поле `RaceResult` | Примечание |
|---------|-------------------|------------|
| Pos | `position` | number |
| Driver | `driverName` | string |
| Team | `constructor` | string |
| Points | `points` | number, `0` для DNF |
| Status | `status` | Badge с variant по статусу |

---

## 3. Архитектура

### Поток данных

```
/races/2024/1
  → useParams → parseRaceRouteParams → { season: 2024, round: 1 }
  → useRaceResults(2024, 1)
       → queryKey: ['raceResults', 2024, 1]
       → queryFn: getRaceResults(2024, 1)
       → RaceResultsData
  → RaceHeader(data) + ResultsTable(data.results)
```

### Feature folder

```
src/features/race-results/
├── RaceHeader.tsx
├── RaceHeader.module.css
├── ResultsTable.tsx
├── ResultsTable.module.css
├── ResultStatusBadge.tsx
└── index.ts
```

### Hooks / lib

```
src/hooks/useRaceResults.ts
src/lib/raceRouteParams.ts      # parseRaceRouteParams
src/lib/resultStatus.ts         # getResultStatusVariant, formatResultStatus
```

### Принципы

| Принцип | Решение |
|---------|---------|
| Страница тонкая | `RaceResultsPage` — params + hook + feature components |
| Статусы из API | Поле `status` — `string`; сравнения через `RESULT_STATUS.*` |
| Неизвестный статус | Показать как есть + Badge variant `default` |
| Upcoming race | API может вернуть ошибку или пустой Results — показать error/empty |
| Навигация назад | Link на `/calendar?season={season}` |
| Переиспользование | `Table` из `components/ui/` (как в Calendar) |

---

## 4.0 — Константы

### Новые / обновляемые файлы

```
src/constants/
├── tableColumns.ts     # UPDATE — RESULTS_TABLE_COLUMNS
├── labels.ts           # UPDATE — race results labels
└── index.ts
```

### `src/constants/tableColumns.ts` — дополнить

```typescript
export const RESULTS_TABLE_COLUMNS = {
  position: 'Pos',
  driver: 'Driver',
  team: 'Team',
  points: 'Points',
  status: 'Status',
} as const
```

> `CALENDAR_TABLE_COLUMNS` уже есть — добавить рядом в том же файле.

### Дополнить `src/constants/labels.ts`

```typescript
export const LABELS = {
  // ...existing
  raceHeaderTitle: 'Round {round} — {raceName} {season}',
  backToCalendar: 'Back to Calendar',
  noResults: 'No results available for this race.',
  invalidRaceParams: 'Invalid race URL.',
} as const
```

### Статусы — уже есть `RESULT_STATUS`

```typescript
export const RESULT_STATUS = {
  finished: 'Finished',
  retired: 'Retired',
  lapped: 'Lapped',
  disqualified: 'Disqualified',
  plusLap: '+1 Lap',
} as const
```

> API может вернуть `+2 Laps`, `+3 Laps`, `Disqualified` — не все в enum.  
> Для MVP: известные статусы — через `RESULT_STATUS`; остальные — raw string.

### Mapping variant для Badge (в lib, не magic strings в JSX)

```typescript
// src/lib/resultStatus.ts
import { RESULT_STATUS } from '@/constants'

export const RESULT_STATUS_VARIANT = {
  [RESULT_STATUS.finished]: 'success',
  [RESULT_STATUS.retired]: 'error',
  [RESULT_STATUS.disqualified]: 'error',
  [RESULT_STATUS.lapped]: 'warning',
  [RESULT_STATUS.plusLap]: 'warning',
} as const
```

Для статусов вроде `+2 Laps` — проверка `status.startsWith('+')` → variant `warning`.

### Критерий готовности

- [ ] Заголовки колонок — `RESULTS_TABLE_COLUMNS`
- [ ] Текст заголовка гонки — шаблон в `LABELS.raceHeaderTitle`

---

## 4.1 — Хук useRaceResults

### Файл: `src/hooks/useRaceResults.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { getRaceResults } from '@/api/endpoints'
import { QUERY_KEYS } from '@/constants'

export function useRaceResults(season: number, round: number) {
  return useQuery({
    queryKey: QUERY_KEYS.raceResults(season, round),
    queryFn: () => getRaceResults(season, round),
    enabled: season > 0 && round > 0,
  })
}
```

### Barrel — обновить `src/hooks/index.ts`

```typescript
export { useRaceResults } from './useRaceResults'
```

### Критерий готовности

- [ ] `/races/2024/1` загружает ~20 результатов
- [ ] Повторный визит — из кэша Query

---

## 4.2 — Валидация route params

### Файл: `src/lib/raceRouteParams.ts`

```typescript
export interface RaceRouteParams {
  season: number
  round: number
}

export function parseRaceRouteParams(
  seasonParam: string | undefined,
  roundParam: string | undefined,
): RaceRouteParams | null {
  if (!seasonParam || !roundParam) return null

  const season = Number(seasonParam)
  const round = Number(roundParam)

  if (!Number.isInteger(season) || season < 1950) return null
  if (!Number.isInteger(round) || round < 1) return null

  return { season, round }
}
```

> Сезон не ограничиваем `AVAILABLE_SEASONS` — URL может быть любым валидным числом; API вернёт ошибку для несуществующих.

### Использование в `RaceResultsPage`

```typescript
const { season, round } = useParams<{ season: string; round: string }>()
const params = parseRaceRouteParams(season, round)

if (!params) {
  return <InvalidRaceParams />
}
```

---

## 4.3 — Форматирование статуса результата

### Файл: `src/lib/resultStatus.ts`

```typescript
import { RESULT_STATUS } from '@/constants'
import type { BadgeProps } from '@/components/ui/Badge' // или inline type

type BadgeVariant = NonNullable<BadgeProps['variant']>

export function formatResultStatus(status: string): string {
  return status
}

export function getResultStatusVariant(status: string): BadgeVariant {
  if (status === RESULT_STATUS.finished) return 'success'
  if (status === RESULT_STATUS.retired || status === RESULT_STATUS.disqualified) return 'error'
  if (
    status === RESULT_STATUS.lapped ||
    status === RESULT_STATUS.plusLap ||
    status.startsWith('+')
  ) {
    return 'warning'
  }
  return 'default'
}
```

> `formatResultStatus` — identity для MVP; позже можно нормализовать `DSQ` → `Disqualified`.

### Unit-тесты

```typescript
describe('getResultStatusVariant', () => {
  it('returns success for Finished', () => {
    expect(getResultStatusVariant(RESULT_STATUS.finished)).toBe('success')
  })
  it('returns warning for +2 Laps', () => {
    expect(getResultStatusVariant('+2 Laps')).toBe('warning')
  })
})
```

---

## 4.4 — RaceHeader

### Файл: `src/features/race-results/RaceHeader.tsx`

```typescript
import { LABELS } from '@/constants'
import { formatRaceDate } from '@/lib/formatters'
import type { RaceResultsData } from '@/types'
import styles from './RaceHeader.module.css'

interface RaceHeaderProps {
  race: Pick<RaceResultsData, 'season' | 'round' | 'raceName' | 'date'>
}

export function RaceHeader({ race }: RaceHeaderProps) {
  const title = LABELS.raceHeaderTitle
    .replace('{round}', String(race.round))
    .replace('{raceName}', race.raceName)
    .replace('{season}', String(race.season))

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.date}>{formatRaceDate(race.date)}</p>
    </header>
  )
}
```

**`RaceHeader.module.css`:**

```css
.header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  line-height: 1.2;
}

.date {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
```

---

## 4.5 — ResultsTable

### ResultStatusBadge — `src/features/race-results/ResultStatusBadge.tsx`

```typescript
import { Badge } from '@/components/ui'
import { getResultStatusVariant, formatResultStatus } from '@/lib/resultStatus'

interface ResultStatusBadgeProps {
  status: string
}

export function ResultStatusBadge({ status }: ResultStatusBadgeProps) {
  return (
    <Badge variant={getResultStatusVariant(status)}>
      {formatResultStatus(status)}
    </Badge>
  )
}
```

### ResultsTable — `src/features/race-results/ResultsTable.tsx`

```typescript
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui'
import { RESULTS_TABLE_COLUMNS } from '@/constants'
import type { RaceResult } from '@/types'
import { ResultStatusBadge } from './ResultStatusBadge'
import styles from './ResultsTable.module.css'

interface ResultsTableProps {
  results: RaceResult[]
}

export function ResultsTable({ results }: ResultsTableProps) {
  return (
    <Table className={styles.table}>
      <TableHead>
        <TableRow>
          <TableHeaderCell>{RESULTS_TABLE_COLUMNS.position}</TableHeaderCell>
          <TableHeaderCell>{RESULTS_TABLE_COLUMNS.driver}</TableHeaderCell>
          <TableHeaderCell>{RESULTS_TABLE_COLUMNS.team}</TableHeaderCell>
          <TableHeaderCell>{RESULTS_TABLE_COLUMNS.points}</TableHeaderCell>
          <TableHeaderCell>{RESULTS_TABLE_COLUMNS.status}</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {results.map((result) => (
          <TableRow key={`${result.position}-${result.driverName}`}>
            <TableCell>{result.position}</TableCell>
            <TableCell>{result.driverName}</TableCell>
            <TableCell>{result.constructor}</TableCell>
            <TableCell>{result.points}</TableCell>
            <TableCell>
              <ResultStatusBadge status={result.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Опционально: highlight позиций 1–3

CSS class на `TableRow` если `position <= 3` — не обязательно для MVP.

### Barrel — `src/features/race-results/index.ts`

```typescript
export { RaceHeader } from './RaceHeader'
export { ResultsTable } from './ResultsTable'
export { ResultStatusBadge } from './ResultStatusBadge'
```

---

## 4.6 — RaceResultsPage

### Файл: `src/pages/RaceResultsPage.tsx`

```typescript
import { Link } from 'react-router-dom'
import { Button, Skeleton } from '@/components/ui'
import { RaceHeader, ResultsTable } from '@/features/race-results'
import { LABELS, routePaths } from '@/constants'
import { useRaceResults } from '@/hooks/useRaceResults'
import { parseRaceRouteParams } from '@/lib/raceRouteParams'
import styles from './RaceResultsPage.module.css'

function ResultsSkeleton() {
  return (
    <div className={styles.skeleton}>
      <Skeleton height={32} width="60%" />
      <Skeleton height={20} width="30%" />
      {Array.from({ length: 10 }, (_, i) => (
        <Skeleton key={i} height={36} />
      ))}
    </div>
  )
}

export function RaceResultsPage() {
  const { season, round } = useParams()
  const params = parseRaceRouteParams(season, round)

  if (!params) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>{LABELS.invalidRaceParams}</p>
        <Link to={routePaths.calendar()}>
          <Button variant="secondary">{LABELS.backToCalendar}</Button>
        </Link>
      </div>
    )
  }

  const { data, isLoading, isError, refetch } = useRaceResults(
    params.season,
    params.round,
  )

  const calendarLink = `${routePaths.calendar()}?season=${params.season}`

  return (
    <div className={styles.page}>
      <Link to={calendarLink} className={styles.backLink}>
        {LABELS.backToCalendar}
      </Link>

      {isLoading && <ResultsSkeleton />}

      {isError && (
        <div className={styles.errorBlock}>
          <p>{LABELS.error}</p>
          <Button variant="secondary" onClick={() => refetch()}>
            {LABELS.retry}
          </Button>
        </div>
      )}

      {data && (
        <>
          <RaceHeader race={data} />
          {data.results.length === 0 ? (
            <p className={styles.empty}>{LABELS.noResults}</p>
          ) : (
            <ResultsTable results={data.results} />
          )}
        </>
      )}
    </div>
  )
}
```

### `RaceResultsPage.module.css`

```css
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.back-link {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  width: fit-content;
}

.back-link:hover {
  color: var(--color-accent);
}

.error-block,
.empty {
  color: var(--color-text-secondary);
}

.skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
```

### Удалить placeholder

Убрать старый `pageRaceResultsMeta` из UI (константу можно оставить или удалить).

---

## 4.7 — Тесты

### Минимальный набор

| Файл | Что проверяет |
|------|---------------|
| `lib/raceRouteParams.test.ts` | `parseRaceRouteParams` valid/invalid |
| `lib/resultStatus.test.ts` | `getResultStatusVariant` |
| `features/race-results/ResultStatusBadge.test.tsx` | рендер Finished / Retired |
| `features/race-results/RaceHeader.test.tsx` | заголовок из `LABELS.raceHeaderTitle` |

### Пример — parseRaceRouteParams

```typescript
describe('parseRaceRouteParams', () => {
  it('parses valid params', () => {
    expect(parseRaceRouteParams('2024', '1')).toEqual({ season: 2024, round: 1 })
  })

  it('returns null for invalid round', () => {
    expect(parseRaceRouteParams('2024', '0')).toBeNull()
  })
})
```

### Пример — RaceHeader

```typescript
render(
  <RaceHeader
    race={{ season: 2024, round: 1, raceName: 'Bahrain Grand Prix', date: '2024-03-02' }}
  />,
)
expect(screen.getByRole('heading')).toHaveTextContent('Round 1 — Bahrain Grand Prix 2024')
```

---

## 4.8 — Проверка и приёмка фазы

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
| 1 | Calendar → клик Bahrain 2024 | `/races/2024/1` |
| 2 | Заголовок | `Round 1 — Bahrain Grand Prix 2024` |
| 3 | Дата | `2 Mar 2024` |
| 4 | Таблица | ~20 строк, Verstappen P1 |
| 5 | Status badges | Finished = green, Retired = red |
| 6 | Back to Calendar | `/calendar?season=2024` |
| 7 | `/races/2024/99` (invalid) | Error + retry или empty |
| 8 | `/races/foo/1` | Invalid race URL message |
| 9 | Refresh страницы | Данные загружаются снова |

### Definition of Done — Фаза 4

| # | Критерий | Статус |
|---|----------|--------|
| 1 | `RESULTS_TABLE_COLUMNS` + labels | ☐ |
| 2 | `useRaceResults` hook | ☐ |
| 3 | `parseRaceRouteParams` | ☐ |
| 4 | `getResultStatusVariant` + tests | ☐ |
| 5 | `RaceHeader`, `ResultsTable`, `ResultStatusBadge` | ☐ |
| 6 | `RaceResultsPage` — loading / error / empty / data | ☐ |
| 7 | Back link на calendar с season | ☐ |
| 8 | Календарь → results E2E работает | ☐ |
| 9 | `pnpm test` / `lint` / `build` — OK | ☐ |
| 10 | Нет magic strings в race-results feature | ☐ |

---

## Итоговая структура файлов

```
src/
├── constants/
│   ├── tableColumns.ts         # UPDATE — RESULTS_TABLE_COLUMNS
│   └── labels.ts               # UPDATE
├── hooks/
│   ├── useRaceResults.ts       # NEW
│   └── index.ts                # UPDATE
├── lib/
│   ├── raceRouteParams.ts      # NEW
│   ├── raceRouteParams.test.ts
│   ├── resultStatus.ts         # NEW
│   └── resultStatus.test.ts
├── features/
│   └── race-results/
│       ├── RaceHeader.tsx
│       ├── RaceHeader.module.css
│       ├── RaceHeader.test.tsx
│       ├── ResultsTable.tsx
│       ├── ResultsTable.module.css
│       ├── ResultStatusBadge.tsx
│       ├── ResultStatusBadge.test.tsx
│       └── index.ts
└── pages/
    ├── RaceResultsPage.tsx     # UPDATE
    └── RaceResultsPage.module.css
```

---

## Чеклист задач

### 4.0 — Константы
- [ ] `RESULTS_TABLE_COLUMNS` в `tableColumns.ts`
- [ ] `LABELS` — raceHeaderTitle, backToCalendar, noResults, invalidRaceParams

### 4.1 — Hook
- [ ] `useRaceResults(season, round)`
- [ ] `hooks/index.ts` export

### 4.2 — Route params
- [ ] `parseRaceRouteParams` + test

### 4.3 — Status formatting
- [ ] `getResultStatusVariant`, `formatResultStatus`
- [ ] `resultStatus.test.ts`

### 4.4 — Feature components
- [ ] `ResultStatusBadge`
- [ ] `RaceHeader` + CSS
- [ ] `ResultsTable` + CSS
- [ ] `features/race-results/index.ts`

### 4.5 — RaceResultsPage
- [ ] Loading skeleton
- [ ] Error + retry
- [ ] Empty results
- [ ] Back link to calendar
- [ ] Invalid params state

### 4.6 — Тесты
- [ ] raceRouteParams
- [ ] resultStatus
- [ ] ResultStatusBadge
- [ ] RaceHeader (optional)

### 4.7 — Приёмка
- [ ] E2E calendar → results
- [ ] `pnpm dev` / `test` / `lint` / `build`
- [ ] Definition of Done — все пункты

---

## Что дальше

После завершения Фазы 4 переходить к **[Фаза 5 — Турнирные таблицы](./development-plan.md#фаза-5--турнирные-таблицы)**:

- Hooks `useDriverStandings`, `useConstructorStandings`
- UI `Tabs`
- `StandingsPage` с двумя вкладками
- Переиспользование `SeasonSelector` и `Table`

**MVP Core complete** после Фазы 5 (Calendar + Results + Driver Standings).

---

## Заметки и решения

| Вопрос | Решение |
|--------|---------|
| Upcoming race без results | Error state от API + retry; empty `results[]` — `LABELS.noResults` |
| `DSQ` vs `Disqualified` | Показать raw status; variant `default` если не матчится |
| `+2 Laps`, `+3 Laps` | `status.startsWith('+')` → warning variant |
| DriverRow с цветом команды | Post-MVP |
| Key в ResultsTable | `` `${position}-${driverName}` `` |
| Badge Props import | Экспортировать `BadgeVariant` type из Badge или дублировать union |
| Invalid season in URL | API error — достаточно error UI |
| Points formatting | Number as-is; `0` для DNF |

---

## Порядок реализации (рекомендуемый)

```
constants → raceRouteParams → resultStatus → useRaceResults
  → ResultStatusBadge → RaceHeader → ResultsTable
  → RaceResultsPage → tests → manual E2E from calendar
```

После **useRaceResults + RaceHeader + ResultsTable** можно проверить `/races/2024/1` до polish back-link и error states.
