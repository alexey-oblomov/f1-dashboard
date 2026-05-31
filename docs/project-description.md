# F1 Dashboard — описание проекта

> Контекстный документ. Читать перед началом работы над проектом.

## Концепция

**F1 Dashboard** — одностраничное веб-приложение (SPA), которое агрегирует данные текущего и прошлых сезонов Formula 1 и показывает их в удобном, читаемом виде.

**Тип проекта:** личный pet-проект для эксперимента и тренировки современного React-стека.

### Цели

- Отработать React + TypeScript + Vite «по-взрослому»
- Построить слой данных (API → Zod → TanStack Query)
- Сделать переиспользуемые UI-компоненты со стилями через CSS Modules
- Добавить графики и базовую аналитику
- Написать несколько осмысленных тестов

### Не цели MVP

- Live-трекинг во время гонки
- Авторизация пользователей
- Мобильное приложение
- Полная история F1 с 1950 года

---

## Разделы приложения

### 1. Главная (`/`)

**Содержимое:**
- Текущий сезон (например, 2026)
- Карточка ближайшей гонки: раунд, страна, дата, трасса, countdown
- Блок «Последние результаты» — топ-3 последней завершённой гонки
- Quick links: Календарь, Таблицы, Дашборд

**Компоненты:**
- `NextRaceCard`
- `LatestResultsPreview`
- `QuickLinksGrid`

**Данные:**
- `GET /{season}/races.json` → найти next/prev race по дате
- `GET /{season}/{lastRound}/results.json`

---

### 2. Календарь (`/calendar`)

**Содержимое:**
- Таблица/список всех этапов сезона
- Колонки: раунд, дата, GP name, страна, трасса, статус
- Фильтр по сезону (2024 / 2025 / 2026)
- Клик по строке → страница результатов

**Статус гонки:**

```typescript
// src/constants/raceStatus.ts
const RACE_STATUS = { completed: 'completed', upcoming: 'upcoming' } as const
// completed: date < today
// upcoming: date >= today
```

**Компоненты:**
- `SeasonSelector`
- `RaceList` / `RaceTable`
- `RaceStatusBadge`

---

### 3. Результаты гонки (`/races/:season/:round`)

**Содержимое:**
- Заголовок: «Round 5 — Miami Grand Prix 2026»
- Таблица финишной классификации

| Pos | Driver | Team | Points | Status |
|-----|--------|------|--------|--------|
| 1 | Verstappen | Red Bull | 25 | Finished |
| 2 | Norris | McLaren | 18 | Finished |
| ... | DNF | ... | 0 | Retired |

**Колонки:** позиция, пилот, команда, очки, статус (Finished / +1 Lap / Retired / DSQ)

**Компоненты:**
- `RaceHeader`
- `ResultsTable`
- `DriverRow` (опционально — с цветом команды)

---

### 4. Турнирные таблицы (`/standings`)

**Две вкладки:**
- **Drivers** — pos, driver, team, points, wins
- **Constructors** — pos, team, points, wins

**Фильтр:** dropdown сезона

**Компоненты:**
- `StandingsTabs`
- `DriverStandingsTable`
- `ConstructorStandingsTable`
- `SeasonSelector`

---

### 5. Дашборд (`/dashboard`)

**Summary-карточки (4 шт.):**
- Лидер среди пилотов
- Лидер среди команд
- Ближайшая гонка (дата + название)
- Последняя гонка (победитель)

**Графики (Recharts):**
- Bar chart — очки пилотов (top 10)
- Bar chart — очки команд (top 10)

**Post-MVP (не входит в первую версию):**
- Line chart — накопление очков по раундам

**Компоненты:**
- `SummaryCard`
- `DriverPointsChart`
- `ConstructorPointsChart`
- `NextRaceWidget` / `LastRaceWidget`

---

## Стек технологий

| Категория | Технология |
|-----------|------------|
| Сборка | Vite |
| UI | React, TypeScript |
| Роутинг | React Router |
| Серверное состояние | TanStack Query |
| Клиентское состояние | Zustand (опционально, только UI) |
| Стили | CSS Modules |
| UI-компоненты | Собственная библиотека (`components/ui/`) |
| Графики | Recharts |
| Валидация | Zod |
| Тесты | Vitest + Testing Library |
| Линтинг | ESLint + Prettier |
| Пакетный менеджер | **pnpm** |

---

## Источник данных

Для MVP — **один стабильный REST API** со своим слоем абстракции поверх.

**Рекомендация:** [Jolpica F1 API](https://api.jolpi.ca/ergast/f1/) — бесплатный, совместим с Ergast, покрывает все разделы MVP.

| API | Плюсы | Минусы |
|-----|-------|--------|
| Jolpica F1 API | seasons, races, results, standings | Нет live-данных |
| OpenF1 | Live и телеметрия | Сложнее, избыточен для MVP |

**Эндпоинты:**

```
GET /{season}/races.json                  → календарь
GET /{season}/{round}/results.json        → результаты гонки
GET /{season}/driverStandings.json        → таблица пилотов
GET /{season}/constructorStandings.json   → таблица конструкторов
```

---

## Архитектура

```
┌─────────────────────────────────────────────────┐
│                   Pages (Routes)                 │
│  Home │ Calendar │ RaceResults │ Standings │ Dash│
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              Feature Components                  │
│  RaceCard │ StandingsTable │ PointsChart │ ...  │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│         TanStack Query (cache, loading, error)   │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│    API Layer (fetch + Zod validation + mappers)  │
└──────────────────────┬──────────────────────────┘
                       │
                  Jolpica F1 API
```

### Zustand — только для UI-состояния

- выбранный сезон (если не хранить в URL)
- тема (light/dark)
- sidebar collapsed

Данные гонок и standings — через TanStack Query, не Zustand.

---

## Структура проекта

```
f1-dashboard/
├── src/
│   ├── app/                    # роутинг, провайдеры
│   │   ├── router.tsx
│   │   └── providers.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── RaceResultsPage.tsx
│   │   ├── StandingsPage.tsx
│   │   └── DashboardPage.tsx
│   ├── features/
│   │   ├── calendar/
│   │   ├── race-results/
│   │   ├── standings/
│   │   └── dashboard/
│   ├── components/
│   │   ├── ui/                 # Button, Card, Table, Tabs, ...
│   │   └── layout/             # Header, Nav, Footer
│   ├── styles/
│   │   ├── global.css          # CSS-переменные, reset, типографика
│   │   └── variables.css       # цвета, отступы, breakpoints
│   ├── api/
│   │   ├── client.ts
│   │   ├── endpoints/
│   │   └── schemas/            # Zod-схемы
│   ├── constants/              # строковые константы (статусы, labels, paths, colors)
│   ├── hooks/                  # useSeason, useRaces, ...
│   ├── lib/
│   │   ├── utils.ts
│   │   └── formatters.ts
│   ├── types/                  # доменные типы (после маппинга)
│   └── stores/                 # Zustand (если нужен)
├── docs/
│   ├── project-description.md  # этот файл
│   └── development-plan.md
└── tests/
```

---

## UI / UX

**Layout:**

```
┌──────────────────────────────────────────┐
│  🏎 F1 Dashboard    [Season ▼]   [🌙]   │  ← Header
├──────────┬───────────────────────────────┤
│ Home     │                               │
│ Calendar │         Main Content          │  ← Sidebar + Content
│ Standings│                               │
│ Dashboard│                               │
└──────────┴───────────────────────────────┘
```

**UI-компоненты для MVP** (каждый со своим `*.module.css`):
- `Button`, `Card`, `Table`, `Tabs`, `Select`, `Badge`, `Skeleton`

**Подход к стилям (CSS Modules):**
- Глобальные CSS-переменные в `styles/variables.css` (цвета, отступы, шрифты)
- Компонентные стили — `ComponentName.module.css` рядом с компонентом
- Именование классов: camelCase в TS (`styles.raceCard`), kebab-case в CSS (`.race-card`)
- Vite поддерживает CSS Modules из коробки — дополнительная настройка не нужна

**Визуальный стиль:**
- Тёмная тема по умолчанию (F1-эстетика)
- Акцентный цвет: красный `#E10600`

---

## Доменные типы

```typescript
type RaceStatus = 'completed' | 'upcoming';
// ↑ в коде: RACE_STATUS из src/constants/raceStatus.ts

interface Race {
  season: number;
  round: number;
  name: string;
  country: string;
  circuit: string;
  date: string;
  status: RaceStatus;  // RACE_STATUS.completed | RACE_STATUS.upcoming
}

interface RaceResult {
  position: number;
  driverName: string;
  constructor: string;
  points: number;
  status: string;
}

interface DriverStanding {
  position: number;
  driverName: string;
  constructor: string;
  points: number;
  wins: number;
}

interface ConstructorStanding {
  position: number;
  name: string;
  points: number;
  wins: number;
}
```

---

## Ключевые технические решения

| Решение | Выбор | Почему |
|---------|-------|--------|
| Стили | CSS Modules | Локальная область видимости, привычный CSS, без runtime |
| UI-компоненты | Свои, не shadcn | shadcn/ui завязан на Tailwind; свои компоненты — полный контроль |
| Пакетный менеджер | pnpm | Быстрее, экономнее по диску |
| Сезон в URL или store | URL query `?season=2026` | Shareable links, проще дебажить |
| Recharts vs ECharts | Recharts для MVP | Проще интеграция с React, меньше bundle |
| Zustand | Только UI state | Query уже кэширует серверные данные |
| Error handling | ErrorBoundary + Query error states | Достаточно для pet-проекта |
| Строковые значения | `src/constants/` | Статусы, labels, placeholders, column titles, API paths, chart colors — без magic strings |
| Feature folders | Да | Масштабируется без боли |

---

## Post-MVP (v2)

- Line chart накопления очков по раундам
- Детали пилота / команды
- Qualifying results
- Dark/Light theme toggle
- Кэш offline (service worker)
- Deploy на Vercel/Netlify
