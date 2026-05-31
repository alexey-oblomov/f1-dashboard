# F1 Dashboard — Фаза 1: API-слой

> Подробный пошаговый план построения слоя данных.
>
> Связанные документы:
> - [project-description.md](./project-description.md) — описание проекта, доменные типы, эндпоинты
> - [development-plan.md](./development-plan.md) — общий план MVP и все фазы
> - [phase-0-setup.md](./phase-0-setup.md) — предыдущая фаза (завершена)

**Оценка:** 2–3 часа  
**Цель фазы:** типобезопасный API-слой — fetch → Zod-валидация → доменные типы. TanStack Query и UI — в следующих фазах.

---

## Содержание

1. [Предварительные требования](#1-предварительные-требования)
2. [Обзор Jolpica API](#2-обзор-jolpica-api)
3. [Архитектура API-слоя](#3-архитектура-api-слоя)
4. [Конвенция: строковые константы](#4-конвенция-строковые-константы)
5. [1.1 — Доменные типы](#51--доменные-типы)
6. [1.2 — HTTP-клиент](#52--http-клиент)
7. [1.3 — Zod-схемы (API response)](#53--zod-схемы-api-response)
8. [1.4 — Мапперы](#54--мапперы)
9. [1.5 — Эндпоинты](#55--эндпоинты)
10. [1.6 — Тесты и fixtures](#56--тесты-и-fixtures)
11. [1.7 — Проверка и приёмка фазы](#57--проверка-и-приёмка-фазы)
12. [Итоговая структура файлов](#итоговая-структура-файлов)
13. [Чеклист задач](#чеклист-задач)

---

## 1. Предварительные требования

Фаза 0 должна быть завершена:

| Критерий | Проверка |
|----------|----------|
| `zod` установлен | `package.json` → dependencies |
| Path alias `@/` работает | импорт `@/lib/utils` |
| `src/api/client.ts` — placeholder | заменить реализацией |
| `src/types/index.ts` — placeholder | заменить доменными типами |
| `pnpm test` проходит | Vitest настроен |

Проверить доступность API:

```bash
curl -s "https://api.jolpi.ca/ergast/f1/2024/races.json" | head -c 200
```

---

## 2. Обзор Jolpica API

**Base URL:** `https://api.jolpi.ca/ergast/f1`

Совместим с Ergast. Все ответы обёрнуты в `MRData` → `RaceTable` / `StandingsTable`.

### Эндпоинты MVP

| Функция | URL | Доменный результат |
|---------|-----|-------------------|
| Календарь | `GET /{season}/races.json` | `Race[]` |
| Результаты | `GET /{season}/{round}/results.json` | `RaceResult[]` + метаданные гонки |
| Пилоты | `GET /{season}/driverStandings.json` | `DriverStanding[]` |
| Конструкторы | `GET /{season}/constructorStandings.json` | `ConstructorStanding[]` |

**Примеры:**
```
https://api.jolpi.ca/ergast/f1/2024/races.json
https://api.jolpi.ca/ergast/f1/2024/1/results.json
https://api.jolpi.ca/ergast/f1/2024/driverStandings.json
https://api.jolpi.ca/ergast/f1/2024/constructorStandings.json
```

### Особенности API (важно для схем)

1. **Числа — строки.** `round`, `position`, `points`, `wins` приходят как `"1"`, `"25"`, не как number.
2. **Вложенная структура.** Данные лежат глубоко: `MRData.RaceTable.Races`, `MRData.StandingsTable.StandingsLists[0].DriverStandings`.
3. **Standings — массив списков.** Берём **последний** элемент `StandingsLists` (актуальный раунд сезона).
4. **DriverStandings.Constructors** — массив; для MVP берём **первый** элемент (`Constructors[0].name`).
5. **Статус гонки** API не отдаёт — вычисляем в маппере по `date` vs сегодня.
6. **Поле `time`** у гонки опционально (есть не у всех гонок в календаре).

### Фрагмент реального ответа — races

```json
{
  "MRData": {
    "RaceTable": {
      "season": "2024",
      "Races": [
        {
          "season": "2024",
          "round": "1",
          "raceName": "Bahrain Grand Prix",
          "date": "2024-03-02",
          "time": "15:00:00Z",
          "Circuit": {
            "circuitName": "Bahrain International Circuit",
            "Location": { "country": "Bahrain", "locality": "Sakhir" }
          }
        }
      ]
    }
  }
}
```

### Фрагмент — results

```json
{
  "Results": [
    {
      "position": "1",
      "points": "25",
      "status": "Finished",
      "Driver": { "givenName": "Max", "familyName": "Verstappen" },
      "Constructor": { "name": "Red Bull" }
    },
    {
      "position": "20",
      "points": "0",
      "status": "Retired",
      "Driver": { "givenName": "Logan", "familyName": "Sargeant" },
      "Constructor": { "name": "Williams" }
    }
  ]
}
```

### Фрагмент — driverStandings

```json
{
  "StandingsLists": [
    {
      "season": "2024",
      "round": "24",
      "DriverStandings": [
        {
          "position": "1",
          "points": "437",
          "wins": "9",
          "Driver": { "givenName": "Max", "familyName": "Verstappen" },
          "Constructors": [{ "name": "Red Bull" }]
        }
      ]
    }
  ]
}
```

---

## 3. Архитектура API-слоя

```
┌─────────────────────────────────────────────────────────┐
│  endpoints/          getRaces, getRaceResults, ...        │
│  (публичный API слоя — вызывают pages/hooks в Фазе 3+)  │
└──────────────────────────┬──────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   api/client.ts    schemas/*.ts      mappers/*.ts
   fetch + parse    Zod validate      API → domain
         │                 │                 │
         └─────────────────┴─────────────────┘
                           │
                    Jolpica F1 API
                           │
                           ▼
                    types/*.ts
                    (Race, RaceResult, ...)
```

### Принципы

| Принцип | Решение |
|---------|---------|
| UI не знает про Ergast | Компоненты работают только с доменными типами из `types/` |
| Валидация на границе | Zod проверяет сырой JSON сразу после fetch |
| Маппинг отдельно | Схемы описывают API; мапперы — преобразование в domain |
| Ошибки типизированы | Кастомный `ApiError` с `status` и `message` |
| Без React Query здесь | Хуки `useRaces` и т.д. — **Фаза 3**, не Фаза 1 |
| Строки — в константах | Статусы, labels, API paths — `src/constants/`, не magic strings |

### Поток данных (пример getRaces)

```
getRaces(2024)
  → client.get('/2024/races.json')
  → RacesResponseSchema.parse(json)
  → mapRaces(response)
  → Race[]
```

---

## 4. Конвенция: строковые константы

> **Обязательное правило проекта.** Все повторяемые строковые значения выносятся в `src/constants/`. Magic strings в коде, JSX и тестах — **запрещены**.

### Зачем

- Единый источник правды — правка в одном месте
- Автодополнение и рефакторинг через TypeScript
- Тесты сравнивают с константами, а не с литералами
- Проще i18n в будущем (заменить значения в constants)

### Паттерн

```typescript
// src/constants/raceStatus.ts
export const RACE_STATUS = {
  completed: 'completed',
  upcoming: 'upcoming',
} as const

export type RaceStatus = (typeof RACE_STATUS)[keyof typeof RACE_STATUS]
```

**Использование:**

```typescript
// ❌ Плохо
return raceDate < today ? 'completed' : 'upcoming'

// ✅ Хорошо
return raceDate < today ? RACE_STATUS.completed : RACE_STATUS.upcoming
```

### Структура `src/constants/`

```
src/constants/
├── index.ts              # barrel export
├── raceStatus.ts         # RACE_STATUS — Фаза 1
├── resultStatus.ts       # RESULT_STATUS — Фаза 1 (статусы из API)
├── api.ts                # API_BASE_URL, пути эндпоинтов — Фаза 1
├── seasons.ts            # AVAILABLE_SEASONS — Фаза 3
├── labels.ts             # UI-тексты, placeholders — Фазы 2–8
├── tableColumns.ts       # заголовки колонок таблиц — Фазы 3–5
└── colors.ts             # цвета для charts / badge variants — Фазы 4–7
```

Файлы создавать **по мере необходимости** в соответствующей фазе. В Фазе 1 — минимум: `raceStatus`, `resultStatus`, `api`.

### Что выносить в константы

| Категория | Пример константы | Когда |
|-----------|------------------|-------|
| Доменные статусы | `RACE_STATUS`, `RESULT_STATUS` | Фаза 1 |
| API | `API_BASE_URL`, `API_PATHS` | Фаза 1 |
| Заголовки таблиц | `RESULTS_TABLE_COLUMNS.position` | Фаза 4 |
| Placeholders / empty states | `LABELS.noResults`, `LABELS.loading` | Фазы 3–8 |
| Навигация | `NAV_ITEMS`, `ROUTES` | Фаза 2 |
| Цвета (JS/Charts) | `CHART_COLORS.driverBar` | Фаза 7 |
| Badge labels | `BADGE_LABELS.upcoming` | Фаза 3 |

> **CSS-переменные** (`--color-accent` в `variables.css`) остаются для стилей. **`colors.ts`** — для JS-контекста (Recharts, динамические inline-стили). Не дублировать без нужды: в CSS — variables, в TS — constants.

### Константы Фазы 1

#### `src/constants/raceStatus.ts`

```typescript
export const RACE_STATUS = {
  completed: 'completed',
  upcoming: 'upcoming',
} as const

export type RaceStatus = (typeof RACE_STATUS)[keyof typeof RACE_STATUS]
```

#### `src/constants/resultStatus.ts`

Статусы финиша из Ergast — для сравнений и форматирования в UI (Фаза 4):

```typescript
export const RESULT_STATUS = {
  finished: 'Finished',
  retired: 'Retired',
  lapped: 'Lapped',
  disqualified: 'Disqualified',
  plusLap: '+1 Lap',
} as const

export type ResultStatus = (typeof RESULT_STATUS)[keyof typeof RESULT_STATUS]
```

> API может вернуть и другие строки — доменное поле `RaceResult.status` остаётся `string`, но **сравнения** в коде — только через `RESULT_STATUS.*`.

#### `src/constants/api.ts`

```typescript
export const API_BASE_URL = 'https://api.jolpi.ca/ergast/f1'

export const API_PATHS = {
  races: (season: number) => `/${season}/races.json`,
  results: (season: number, round: number) => `/${season}/${round}/results.json`,
  driverStandings: (season: number) => `/${season}/driverStandings.json`,
  constructorStandings: (season: number) => `/${season}/constructorStandings.json`,
} as const
```

#### `src/constants/index.ts`

```typescript
export { RACE_STATUS, type RaceStatus } from './raceStatus'
export { RESULT_STATUS, type ResultStatus } from './resultStatus'
export { API_BASE_URL, API_PATHS } from './api'
```

### Примеры для следующих фаз (справочно)

#### `tableColumns.ts` (Фаза 4–5)

```typescript
export const RESULTS_TABLE_COLUMNS = {
  position: 'Pos',
  driver: 'Driver',
  team: 'Team',
  points: 'Points',
  status: 'Status',
} as const

export const DRIVER_STANDINGS_COLUMNS = {
  position: 'Pos',
  driver: 'Driver',
  team: 'Team',
  points: 'Points',
  wins: 'Wins',
} as const
```

#### `labels.ts` (Фазы 3–8)

```typescript
export const LABELS = {
  loading: 'Loading...',
  error: 'Something went wrong',
  noResults: 'No results available',
  noRaces: 'No races found for this season',
} as const
```

#### `colors.ts` (Фаза 7 — Recharts)

```typescript
export const CHART_COLORS = {
  accent: '#e10600',
  driverBar: '#e10600',
  constructorBar: '#ff1a0d',
  grid: '#2a2a2a',
} as const
```

### Правила

1. **`as const`** — обязательно для объектов констант
2. **Тип из константы** — `(typeof X)[keyof typeof X]`, не дублировать union вручную
3. **SCREAMING_SNAKE** для экспорта объекта (`RACE_STATUS`), **camelCase** для ключей (`completed`)
4. **Тесты** — `expect(race.status).toBe(RACE_STATUS.completed)`, не `'completed'`
5. **Не выносить** одноразовые строки (имя гонки из API, имя пилота)

### Критерий готовности (Фаза 1)

- [ ] `src/constants/` создан, barrel `index.ts`
- [ ] `RACE_STATUS`, `RESULT_STATUS`, `API_BASE_URL`, `API_PATHS` определены
- [ ] `getRaceStatus` и тесты используют `RACE_STATUS`
- [ ] `api/client.ts` импортирует `API_BASE_URL` из `@/constants`
- [ ] Нет magic strings для статусов и API paths в `src/api/` и `src/lib/`

---

## 5.1 — Доменные типы

### Задача

Определить типы, с которыми работает приложение. Они **не совпадают** с форматом Ergast.

### Файлы

```
src/constants/
├── raceStatus.ts         # RACE_STATUS + type RaceStatus
├── resultStatus.ts
├── api.ts
└── index.ts

src/types/
├── race.ts
├── raceResult.ts
├── standing.ts
└── index.ts
```

### `src/types/race.ts`

```typescript
import type { RaceStatus } from '@/constants'

export interface Race {
  season: number
  round: number
  name: string
  country: string
  circuit: string
  date: string       // ISO date: "2024-03-02"
  time?: string      // "15:00:00Z" — опционально
  status: RaceStatus
}
```

> Тип `RaceStatus` экспортируется из `@/constants/raceStatus`, не дублируется в `types/`.

### `src/types/raceResult.ts`

```typescript
export interface RaceResult {
  position: number
  driverName: string
  constructor: string
  points: number
  status: string     // значение из API; сравнения — через RESULT_STATUS
}

export interface RaceResultsData {
  season: number
  round: number
  raceName: string
  date: string
  results: RaceResult[]
}
```

> `RaceResultsData` — обёртка для страницы результатов (заголовок + таблица). Альтернатива: возвращать `{ race: Race, results: RaceResult[] }` — выбрать один вариант и придерживаться его.

### `src/types/standing.ts`

```typescript
export interface DriverStanding {
  position: number
  driverName: string
  constructor: string
  points: number
  wins: number
}

export interface ConstructorStanding {
  position: number
  name: string
  points: number
  wins: number
}
```

### `src/types/index.ts`

```typescript
export type { RaceStatus } from '@/constants'
export type { Race } from './race'
export type { RaceResult, RaceResultsData } from './raceResult'
export type { DriverStanding, ConstructorStanding } from './standing'
```

### Критерий готовности

- [ ] Типы экспортируются через `@/types`
- [ ] `RaceStatus` импортируется из `@/constants`, не объявляется в `types/`
- [ ] Нет зависимостей от Zod или API-структур

---

## 5.2 — HTTP-клиент

### Задача

Тонкая обёртка над `fetch`: base URL, JSON-парсинг, обработка HTTP-ошибок.

### Файл: `src/api/client.ts`

```typescript
import { API_BASE_URL } from '@/constants'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public url: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new ApiError(
      `API request failed: ${response.status} ${response.statusText}`,
      response.status,
      url,
    )
  }

  return response.json() as Promise<T>
}
```

### Соглашения

| Правило | Пример |
|---------|--------|
| Path начинается с `/` | `'/2024/races.json'` |
| Не добавлять `.json` дважды | path уже включает расширение |
| Generic `T` — сырой JSON | Валидация — в эндпоинте через Zod |

### Опционально (не обязательно для MVP)

- Timeout через `AbortController`
- Retry при 429/503
- Логирование в dev-режиме

### Критерий готовности

- [ ] `apiGet` бросает `ApiError` при `!response.ok`
- [ ] `API_BASE_URL` импортируется из `@/constants`, не объявляется в `client.ts`

---

## 5.3 — Zod-схемы (API response)

### Задача

Описать структуру ответов Ergast. Валидировать только **нужные поля** — остальные игнорировать (`.passthrough()` на объектах или не описывать лишнее).

### Файлы

```
src/api/schemas/
├── common.ts              # переиспользуемые части
├── races.ts
├── results.ts
├── driverStandings.ts
├── constructorStandings.ts
└── index.ts
```

### `src/api/schemas/common.ts`

Общие фрагменты:

```typescript
import { z } from 'zod'

/** Ergast часто отдаёт числа строками */
export const numericString = z.string().regex(/^\d+$/)

export const DriverSchema = z.object({
  givenName: z.string(),
  familyName: z.string(),
})

export const ConstructorSchema = z.object({
  name: z.string(),
})

export const LocationSchema = z.object({
  country: z.string(),
  locality: z.string().optional(),
})

export const CircuitSchema = z.object({
  circuitName: z.string(),
  Location: LocationSchema,
})
```

### `src/api/schemas/races.ts`

```typescript
import { z } from 'zod'
import { CircuitSchema, numericString } from './common'

const ApiRaceSchema = z.object({
  season: numericString,
  round: numericString,
  raceName: z.string(),
  date: z.string(),
  time: z.string().optional(),
  Circuit: CircuitSchema,
})

export const RacesResponseSchema = z.object({
  MRData: z.object({
    RaceTable: z.object({
      season: numericString,
      Races: z.array(ApiRaceSchema),
    }),
  }),
})

export type RacesResponse = z.infer<typeof RacesResponseSchema>
```

### `src/api/schemas/results.ts`

```typescript
import { z } from 'zod'
import { ConstructorSchema, DriverSchema, numericString } from './common'
import { CircuitSchema } from './common'

const ApiResultSchema = z.object({
  position: numericString,
  points: numericString,
  status: z.string(),
  Driver: DriverSchema,
  Constructor: ConstructorSchema,
})

const ApiRaceWithResultsSchema = z.object({
  season: numericString,
  round: numericString,
  raceName: z.string(),
  date: z.string(),
  Circuit: CircuitSchema,
  Results: z.array(ApiResultSchema),
})

export const ResultsResponseSchema = z.object({
  MRData: z.object({
    RaceTable: z.object({
      Races: z.array(ApiRaceWithResultsSchema).min(1),
    }),
  }),
})

export type ResultsResponse = z.infer<typeof ResultsResponseSchema>
```

### `src/api/schemas/driverStandings.ts`

```typescript
import { z } from 'zod'
import { ConstructorSchema, DriverSchema, numericString } from './common'

const ApiDriverStandingSchema = z.object({
  position: numericString,
  points: numericString,
  wins: numericString,
  Driver: DriverSchema,
  Constructors: z.array(ConstructorSchema).min(1),
})

export const DriverStandingsResponseSchema = z.object({
  MRData: z.object({
    StandingsTable: z.object({
      season: numericString,
      StandingsLists: z
        .array(
          z.object({
            DriverStandings: z.array(ApiDriverStandingSchema),
          }),
        )
        .min(1),
    }),
  }),
})

export type DriverStandingsResponse = z.infer<typeof DriverStandingsResponseSchema>
```

### `src/api/schemas/constructorStandings.ts`

```typescript
import { z } from 'zod'
import { numericString } from './common'

const ApiConstructorStandingSchema = z.object({
  position: numericString,
  points: numericString,
  wins: numericString,
  Constructor: z.object({ name: z.string() }),
})

export const ConstructorStandingsResponseSchema = z.object({
  MRData: z.object({
    StandingsTable: z.object({
      StandingsLists: z
        .array(
          z.object({
            ConstructorStandings: z.array(ApiConstructorStandingSchema),
          }),
        )
        .min(1),
    }),
  }),
})
```

### Barrel — `src/api/schemas/index.ts`

Экспорт всех схем и inferred-типов.

### Критерий готовности

- [ ] Схемы парсят реальные ответы API 2024 без ошибок
- [ ] `numericString` переиспользуется для Ergast-чисел
- [ ] Inferred types (`RacesResponse` и т.д.) используются в мапперах

---

## 5.4 — Мапперы

### Задача

Преобразовать validated API response → доменные типы. Здесь же — бизнес-логика вроде `RaceStatus`.

### Файлы

```
src/api/mappers/
├── races.ts
├── results.ts
├── standings.ts
└── index.ts
```

### Утилита статуса гонки

Добавить в `src/lib/raceStatus.ts` (или в `mappers/races.ts`):

```typescript
import { RACE_STATUS, type RaceStatus } from '@/constants'

export function getRaceStatus(date: string): RaceStatus {
  const raceDate = new Date(`${date}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return raceDate < today ? RACE_STATUS.completed : RACE_STATUS.upcoming
}
```

> Сравнение только по дате (без времени) — достаточно для MVP. Уточнить в Фазе 6 при countdown.

### `mapRaces`

```typescript
import type { RacesResponse } from '@/api/schemas'
import type { Race } from '@/types'
import { getRaceStatus } from '@/lib/raceStatus'

export function mapRaces(response: RacesResponse): Race[] {
  return response.MRData.RaceTable.Races.map((race) => ({
    season: Number(race.season),
    round: Number(race.round),
    name: race.raceName,
    country: race.Circuit.Location.country,
    circuit: race.Circuit.circuitName,
    date: race.date,
    time: race.time,
    status: getRaceStatus(race.date),
  }))
}
```

### `mapRaceResults`

```typescript
export function mapRaceResults(response: ResultsResponse): RaceResultsData {
  const race = response.MRData.RaceTable.Races[0]

  return {
    season: Number(race.season),
    round: Number(race.round),
    raceName: race.raceName,
    date: race.date,
    results: race.Results.map((result) => ({
      position: Number(result.position),
      driverName: `${result.Driver.givenName} ${result.Driver.familyName}`,
      constructor: result.Constructor.name,
      points: Number(result.points),
      status: result.status,
    })),
  }
}
```

### `mapDriverStandings` / `mapConstructorStandings`

```typescript
// Берём последний StandingsLists — актуальный срез сезона
const list = response.MRData.StandingsTable.StandingsLists.at(-1)!
```

Driver:
```typescript
return list.DriverStandings.map((s) => ({
  position: Number(s.position),
  driverName: `${s.Driver.givenName} ${s.Driver.familyName}`,
  constructor: s.Constructors[0].name,
  points: Number(s.points),
  wins: Number(s.wins),
}))
```

Constructor — аналогично, поле `Constructor.name` → `name`.

### Критерий готовности

- [ ] Мапперы не используют `fetch` — только transform
- [ ] `driverName` формируется как `"givenName familyName"`
- [ ] `getRaceStatus` покрыт unit-тестом (можно в Фазе 1 или 8)

---

## 5.5 — Эндпоинты

### Задача

Публичные функции API-слоя — единственная точка входа для загрузки данных.

### Файлы

```
src/api/endpoints/
├── races.ts
├── results.ts
├── driverStandings.ts
├── constructorStandings.ts
└── index.ts
```

### Шаблон каждого эндпоинта

```typescript
import { apiGet } from '@/api/client'
import { API_PATHS } from '@/constants'
import { RacesResponseSchema } from '@/api/schemas'
import { mapRaces } from '@/api/mappers'
import type { Race } from '@/types'

export async function getRaces(season: number): Promise<Race[]> {
  const raw = await apiGet(API_PATHS.races(season))
  const validated = RacesResponseSchema.parse(raw)
  return mapRaces(validated)
}
```

### Список функций

| Функция | Сигнатура | Path |
|---------|-----------|------|
| `getRaces` | `(season: number) => Promise<Race[]>` | `API_PATHS.races(season)` |
| `getRaceResults` | `(season: number, round: number) => Promise<RaceResultsData>` | `API_PATHS.results(season, round)` |
| `getDriverStandings` | `(season: number) => Promise<DriverStanding[]>` | `API_PATHS.driverStandings(season)` |
| `getConstructorStandings` | `(season: number) => Promise<ConstructorStanding[]>` | `API_PATHS.constructorStandings(season)` |

### Barrel — `src/api/endpoints/index.ts`

```typescript
export { getRaces } from './races'
export { getRaceResults } from './results'
export { getDriverStandings } from './driverStandings'
export { getConstructorStandings } from './constructorStandings'
```

### Обработка Zod-ошибок

При `Schema.parse()` Zod бросает `ZodError`. Для MVP — пробрасывать как есть; TanStack Query покажет error state в UI (Фаза 3).

Опционально обернуть:

```typescript
function parseOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}
```

### Критерий готовности

- [ ] Все 4 функции возвращают доменные типы
- [ ] Импорт из UI/хуков: `import { getRaces } from '@/api/endpoints'`
- [ ] Ручная проверка в DevTools или временном скрипте (см. 4.7)

---

## 5.6 — Тесты и fixtures

### Задача

Unit-тесты без сетевых запросов — fixtures + Zod + мапперы.

### Структура fixtures

```
src/test/fixtures/
├── races-2024.json           # 1–2 гонки (урезанный MRData)
├── results-2024-1.json       # 2–3 результата
├── driverStandings-2024.json # 2–3 пилота
└── constructorStandings-2024.json
```

**Как получить fixtures:**

1. Скачать реальный JSON с Jolpica
2. Обрезать до минимума (1–2 записи), сохранить полную структуру `MRData`
3. Положить в `src/test/fixtures/`

```bash
curl -s "https://api.jolpi.ca/ergast/f1/2024/races.json" -o races-full.json
# вручную обрезать → src/test/fixtures/races-2024.json
```

### Минимальный fixture — races (пример)

```json
{
  "MRData": {
    "RaceTable": {
      "season": "2024",
      "Races": [
        {
          "season": "2024",
          "round": "1",
          "raceName": "Bahrain Grand Prix",
          "date": "2024-03-02",
          "time": "15:00:00Z",
          "Circuit": {
            "circuitName": "Bahrain International Circuit",
            "Location": { "country": "Bahrain" }
          }
        }
      ]
    }
  }
}
```

### Тесты (минимум)

| Файл | Что проверяет |
|------|---------------|
| `src/api/schemas/races.test.ts` | `RacesResponseSchema.parse(fixture)` — без throw |
| `src/api/mappers/races.test.ts` | `mapRaces` → корректные `season`, `round`, `driverName` |
| `src/lib/raceStatus.test.ts` | `getRaceStatus` для прошлой/будущей даты |

**Пример — schema test:**

```typescript
import { describe, it, expect } from 'vitest'
import { RacesResponseSchema } from './races'
import fixture from '@/test/fixtures/races-2024.json'

describe('RacesResponseSchema', () => {
  it('parses valid races response', () => {
    const result = RacesResponseSchema.parse(fixture)
    expect(result.MRData.RaceTable.Races).toHaveLength(1)
  })
})
```

**Пример — mapper test:**

```typescript
import { RACE_STATUS } from '@/constants'

describe('mapRaces', () => {
  it('maps API race to domain Race', () => {
    const parsed = RacesResponseSchema.parse(fixture)
    const races = mapRaces(parsed)

    expect(races[0]).toMatchObject({
      season: 2024,
      round: 1,
      name: 'Bahrain Grand Prix',
      country: 'Bahrain',
      status: RACE_STATUS.completed,
    })
  })
})
```

**Пример — raceStatus test:**

```typescript
import { RACE_STATUS } from '@/constants'
import { getRaceStatus } from './raceStatus'

describe('getRaceStatus', () => {
  it('returns completed for past date', () => {
    expect(getRaceStatus('2020-01-01')).toBe(RACE_STATUS.completed)
  })

  it('returns upcoming for future date', () => {
    expect(getRaceStatus('2099-12-31')).toBe(RACE_STATUS.upcoming)
  })
})
```

### Vitest + JSON imports

В `tsconfig.app.json` при необходимости добавить:

```json
"resolveJsonModule": true
```

(Vite/Vitest обычно поддерживают import JSON из коробки.)

### Критерий готовности

- [ ] Минимум **3 теста** (schema + mapper + raceStatus)
- [ ] `pnpm test` — все проходят без сети
- [ ] Fixtures не содержат лишних мегабайт данных

---

## 5.7 — Проверка и приёмка фазы

### Smoke-тесты

```bash
pnpm test          # все тесты, включая новые
pnpm lint          # 0 errors
pnpm build         # сборка без ошибок
```

### Ручная проверка эндпоинтов (опционально)

Временно в `App.tsx` или отдельном dev-скрипте:

```typescript
useEffect(() => {
  getRaces(2024).then(console.log)
}, [])
```

Ожидание: массив из ~24 гонок, поля заполнены, `status` — `RACE_STATUS.completed` или `RACE_STATUS.upcoming`.

**Удалить** временный код после проверки — в Фазе 3 подключим TanStack Query.

### Definition of Done — Фаза 1

| # | Критерий | Статус |
|---|----------|--------|
| 1 | Константы в `src/constants/` (`RACE_STATUS`, `API_PATHS`, …) | ☐ |
| 2 | Доменные типы в `src/types/` | ☐ |
| 3 | `api/client.ts` — fetch + `ApiError` | ☐ |
| 4 | Zod-схемы для 4 эндпоинтов | ☐ |
| 5 | Мапперы API → domain | ☐ |
| 6 | 4 endpoint-функции работают | ☐ |
| 7 | `getRaceStatus` использует `RACE_STATUS` | ☐ |
| 8 | Fixtures + минимум 3 unit-теста | ☐ |
| 9 | `pnpm test` / `pnpm lint` / `pnpm build` — OK | ☐ |
| 10 | Нет magic strings для статусов и API paths | ☐ |
| 11 | UI **не** зависит от API напрямую (только через endpoints) | ☐ |

---

## Итоговая структура файлов

После завершения Фазы 1:

```
src/
├── constants/
│   ├── raceStatus.ts
│   ├── resultStatus.ts
│   ├── api.ts
│   └── index.ts
├── api/
│   ├── client.ts
│   ├── endpoints/
│   │   ├── races.ts
│   │   ├── results.ts
│   │   ├── driverStandings.ts
│   │   ├── constructorStandings.ts
│   │   └── index.ts
│   ├── schemas/
│   │   ├── common.ts
│   │   ├── races.ts
│   │   ├── races.test.ts
│   │   ├── results.ts
│   │   ├── driverStandings.ts
│   │   ├── constructorStandings.ts
│   │   └── index.ts
│   └── mappers/
│       ├── races.ts
│       ├── races.test.ts
│       ├── results.ts
│       ├── standings.ts
│       └── index.ts
├── lib/
│   ├── raceStatus.ts
│   ├── raceStatus.test.ts
│   ├── utils.ts
│   └── formatters.ts
├── types/
│   ├── race.ts
│   ├── raceResult.ts
│   ├── standing.ts
│   └── index.ts
└── test/
    ├── setup.ts
    └── fixtures/
        ├── races-2024.json
        ├── results-2024-1.json
        ├── driverStandings-2024.json
        └── constructorStandings-2024.json
```

---

## Чеклист задач

### 1.0 — Константы
- [ ] `constants/raceStatus.ts` — `RACE_STATUS`, `RaceStatus`
- [ ] `constants/resultStatus.ts` — `RESULT_STATUS`
- [ ] `constants/api.ts` — `API_BASE_URL`, `API_PATHS`
- [ ] `constants/index.ts` — barrel export

### 1.1 — Доменные типы
- [ ] `types/race.ts` — `Race` (status: `RaceStatus` из constants)
- [ ] `types/raceResult.ts` — `RaceResult`, `RaceResultsData`
- [ ] `types/standing.ts` — `DriverStanding`, `ConstructorStanding`
- [ ] `types/index.ts` — barrel export

### 1.2 — HTTP-клиент
- [ ] `api/client.ts` — `ApiError`, `apiGet` (URL из `@/constants`)
- [ ] Обработка HTTP-ошибок

### 1.3 — Zod-схемы
- [ ] `schemas/common.ts` — shared + `numericString`
- [ ] `schemas/races.ts` + `RacesResponseSchema`
- [ ] `schemas/results.ts` + `ResultsResponseSchema`
- [ ] `schemas/driverStandings.ts`
- [ ] `schemas/constructorStandings.ts`
- [ ] `schemas/index.ts`

### 1.4 — Мапперы
- [ ] `lib/raceStatus.ts` — `getRaceStatus` с `RACE_STATUS`
- [ ] `mappers/races.ts` — `mapRaces`
- [ ] `mappers/results.ts` — `mapRaceResults`
- [ ] `mappers/standings.ts` — driver + constructor
- [ ] `mappers/index.ts`

### 1.5 — Эндпоинты
- [ ] `getRaces(season)` — path через `API_PATHS`
- [ ] `getRaceResults(season, round)`
- [ ] `getDriverStandings(season)`
- [ ] `getConstructorStandings(season)`
- [ ] `endpoints/index.ts`

### 1.6 — Тесты
- [ ] Fixtures (4 JSON-файла, урезанные)
- [ ] Schema test — races
- [ ] Mapper test — mapRaces
- [ ] Unit test — getRaceStatus

### 1.7 — Приёмка
- [ ] `pnpm test` ✓
- [ ] `pnpm lint` ✓
- [ ] `pnpm build` ✓
- [ ] Ручная проверка `getRaces(2024)` (опционально)
- [ ] Definition of Done — все пункты

---

## Что дальше

После завершения Фазы 1 переходить к **[Фаза 2 — Layout и роутинг](./development-plan.md#фаза-2--layout-и-роутинг)**:

- React Router — 5 маршрутов
- `AppLayout` с Header + Sidebar
- `QueryClientProvider` в providers
- 404 страница

Затем **Фаза 3** — хуки TanStack Query (`useRaces`, `useRaceResults`, …), которые вызывают функции из `@/api/endpoints`.

---

## Заметки и решения

| Вопрос | Решение |
|--------|---------|
| Magic strings | Запрещены — `src/constants/` для статусов, labels, paths, colors |
| Где хранить `getRaceStatus`? | `lib/raceStatus.ts` — переиспользуется в Home (Фаза 6) |
| Нужен ли React Query в Фазе 1? | Нет — только чистые async-функции |
| Mock API в тестах? | Fixtures JSON, без MSW (достаточно для MVP) |
| Zod strict vs loose? | Валидировать нужные поля; лишние поля Ergast не мешают |
| Сезоны MVP | 2024, 2025, 2026 — API поддерживает; валидировать в UI позже |
| Ergast vs Jolpica URL | Base URL Jolpica; структура ответа идентична Ergast |
| `driverStandings.json` vs `driverstandings.json` | Jolpica case-insensitive; использовать camelCase из документации |

---

## Порядок реализации (рекомендуемый)

```
constants → types → client → schemas/common → schemas → mappers → endpoints → fixtures → tests
```

После **schemas + mappers для races** можно проверить первый вертикальный срез (`getRaces`) — до остальных эндпоинтов.
