# F1 Dashboard — Фаза 2: Layout и роутинг

> Подробный пошаговый план настройки навигации и каркаса приложения.
>
> Связанные документы:
> - [project-description.md](./project-description.md) — layout, UI/UX, архитектура
> - [development-plan.md](./development-plan.md) — общий план MVP и все фазы
> - [phase-0-setup.md](./phase-0-setup.md) — UI-компоненты, стили, структура
> - [phase-1-api-layer.md](./phase-1-api-layer.md) — API-слой (завершена)

**Оценка:** 1–2 часа  
**Цель фазы:** приложение с рабочей навигацией, единым layout на всех страницах, подключённым TanStack Query. Страницы пока — placeholder-контент (данные подключим в Фазах 3–7).

---

## Содержание

1. [Предварительные требования](#1-предварительные-требования)
2. [Обзор фазы](#2-обзор-фазы)
3. [Архитектура](#3-архитектура)
4. [2.0 — Константы навигации и labels](#20--константы-навигации-и-labels)
5. [2.1 — Providers (QueryClient)](#21--providers-queryclient)
6. [2.2 — React Router](#22--react-router)
7. [2.3 — AppLayout, Header, Sidebar](#23--applayout-header-sidebar)
8. [2.4 — Страницы и 404](#24--страницы-и-404)
9. [2.5 — Точка входа и сборка App](#25--точка-входа-и-сборка-app)
10. [2.6 — Проверка и приёмка фазы](#26--проверка-и-приёмка-фазы)
11. [Итоговая структура файлов](#итоговая-структура-файлов)
12. [Чеклист задач](#чеклист-задач)

---

## 1. Предварительные требования

Фазы 0 и 1 должны быть завершены:

| Критерий | Проверка |
|----------|----------|
| UI-компоненты готовы | `Button`, `Card`, `Badge`, `Skeleton` в `components/ui/` |
| CSS-переменные layout | `--sidebar-width`, `--header-height` в `variables.css` |
| `react-router-dom` установлен | `package.json` → dependencies |
| `@tanstack/react-query` установлен | `package.json` → dependencies |
| API-слой готов | `@/api/endpoints` — 4 функции |
| Placeholder-страницы | 5 файлов в `src/pages/` |
| Placeholder layout | `Header`, `Sidebar`, `AppLayout` |
| `pnpm test` / `pnpm build` | проходят без ошибок |

---

## 2. Обзор фазы

### Что делаем

| # | Задача | Результат |
|---|--------|-----------|
| 2.0 | Константы `ROUTES`, `NAV_ITEMS`, `LABELS` | Нет magic strings в навигации |
| 2.1 | `QueryClientProvider` | TanStack Query готов к хукам в Фазе 3 |
| 2.2 | React Router — 6 маршрутов (5 + 404) | URL → страница |
| 2.3 | Layout — Header + Sidebar | Единая оболочка приложения |
| 2.4 | Обновить страницы, добавить `NotFoundPage` | Контент в `<main>`, params на RaceResults |
| 2.5 | Пересобрать `main.tsx` / `App.tsx` | Убрать UI Kit sandbox |

### Что **не** делаем в этой фазе

- Загрузка данных с API (Фазы 3–7)
- `SeasonSelector` с логикой (Фаза 3; в Header — опциональный visual placeholder)
- Hamburger / mobile sidebar (Фаза 8)
- Dark/Light theme toggle (Post-MVP)
- Zustand (пока не нужен)

### Маршруты MVP

| Путь | Компонент | Примечание |
|------|-----------|------------|
| `/` | `HomePage` | Главная |
| `/calendar` | `CalendarPage` | Календарь |
| `/races/:season/:round` | `RaceResultsPage` | Динамический роут |
| `/standings` | `StandingsPage` | Турнирные таблицы |
| `/dashboard` | `DashboardPage` | Дашборд |
| `*` | `NotFoundPage` | 404 |

---

## 3. Архитектура

### Дерево компонентов

```
main.tsx
└── StrictMode
    └── AppProviders          ← QueryClientProvider
        └── BrowserRouter
            └── AppRouter     ← Route definitions
                └── AppLayout ← Header + Sidebar + <Outlet />
                    ├── HomePage
                    ├── CalendarPage
                    ├── RaceResultsPage
                    ├── StandingsPage
                    ├── DashboardPage
                    └── NotFoundPage (catch-all)
```

### Поток рендера

```
main.tsx
  → import global.css
  → render <App /> или <AppProviders><AppRouter /></AppProviders>

AppRouter
  → Routes внутри AppLayout (layout route)
  → Outlet рендерит активную страницу
```

### Принципы

| Принцип | Решение |
|---------|---------|
| Layout route | `AppLayout` оборачивает все страницы через `<Outlet />` |
| Константы для путей | `ROUTES.home`, `ROUTES.calendar` — не `'/'`, `'/calendar'` |
| Active link | `NavLink` из react-router + CSS module для `.active` |
| QueryClient один на app | Создаётся в `providers.tsx`, не в каждой странице |
| Страницы — тонкие | Только UI placeholder; логика данных — в features (Фаза 3+) |
| Сезон в URL | Query `?season=2026` — инфраструктура в Фазе 3; в Фазе 2 не блокирует |

### Wireframe (desktop)

```
┌──────────────────────────────────────────────────────────┐
│  🏎 F1 Dashboard                              [Season ▼] │  ← Header (56px)
├──────────────┬───────────────────────────────────────────┤
│  Home        │                                           │
│  Calendar    │              <Outlet />                   │
│  Standings   │           (page content)                  │
│  Dashboard   │                                           │
│              │                                           │
│  220px       │           max-width: 1200px               │
└──────────────┴───────────────────────────────────────────┘
```

---

## 2.0 — Константы навигации и labels

> По [конвенции проекта](./phase-1-api-layer.md#4-конвенция-строковые-константы): все строки — в `src/constants/`.

### Новые файлы

```
src/constants/
├── routes.ts       # ROUTES — path patterns
├── navigation.ts   # NAV_ITEMS — sidebar links
├── labels.ts       # LABELS — app title, 404, nav (если не в NAV_ITEMS)
└── index.ts        # обновить barrel
```

### `src/constants/routes.ts`

```typescript
export const ROUTES = {
  home: '/',
  calendar: '/calendar',
  raceResults: '/races/:season/:round',
  standings: '/standings',
  dashboard: '/dashboard',
} as const

/** Helpers для программной навигации */
export const routePaths = {
  home: () => ROUTES.home,
  calendar: () => ROUTES.calendar,
  raceResults: (season: number, round: number) => `/races/${season}/${round}`,
  standings: () => ROUTES.standings,
  dashboard: () => ROUTES.dashboard,
} as const
```

> `ROUTES.raceResults` — pattern для `<Route path={...}>`.  
> `routePaths.raceResults(2024, 1)` — для `<Link to={...}>` и `navigate()`.

### `src/constants/navigation.ts`

```typescript
import { ROUTES } from './routes'

export const NAV_ITEMS = [
  { label: 'Home', path: ROUTES.home },
  { label: 'Calendar', path: ROUTES.calendar },
  { label: 'Standings', path: ROUTES.standings },
  { label: 'Dashboard', path: ROUTES.dashboard },
] as const
```

> `label` — пока на английском (как в MVP docs). Локализация — Post-MVP.

### `src/constants/labels.ts`

```typescript
export const LABELS = {
  appTitle: 'F1 Dashboard',
  appLogo: '🏎',
  notFoundTitle: '404 — Page Not Found',
  notFoundMessage: 'The page you are looking for does not exist.',
  notFoundBack: 'Back to Home',
  seasonSelector: 'Season',
  seasonSelectorPlaceholder: '2026',
} as const
```

### Обновить `src/constants/index.ts`

```typescript
export { ROUTES, routePaths } from './routes'
export { NAV_ITEMS } from './navigation'
export { LABELS } from './labels'
// ... существующие экспорты из Фазы 1
```

### Критерий готовности

- [ ] Нет строк `'/'`, `'Calendar'`, `'F1 Dashboard'` в layout/router
- [ ] `routePaths.raceResults(2024, 5)` используется в тестах ссылок (Фаза 3+)

---

## 2.1 — Providers (QueryClient)

### Задача

Подключить TanStack Query на уровне приложения. Хуки `useRaces` и др. появятся в Фазе 3, но Provider нужен уже сейчас.

### Файл: `src/app/providers.tsx`

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min — F1 data rarely changes mid-session
      retry: 1,
    },
  },
})

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

### Константы для Query (опционально)

```typescript
// src/constants/query.ts
export const QUERY_STALE_TIME = {
  default: 1000 * 60 * 5,
} as const
```

> Вынести `staleTime` в константу — по желанию, но соответствует конвенции.

### React Query DevTools (опционально)

```bash
pnpm add -D @tanstack/react-query-devtools
```

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
// внутри AppProviders, только import.meta.env.DEV
```

Не обязательно для MVP — можно добавить позже.

### Критерий готовности

- [ ] `AppProviders` оборачивает всё приложение в `main.tsx`
- [ ] Страницы могут использовать `useQuery` без доп. провайдеров

---

## 2.2 — React Router

### Задача

Настроить маршрутизацию с layout route и catch-all 404.

### Файл: `src/app/router.tsx`

```typescript
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ROUTES } from '@/constants'
import { CalendarPage } from '@/pages/CalendarPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RaceResultsPage } from '@/pages/RaceResultsPage'
import { StandingsPage } from '@/pages/StandingsPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.calendar} element={<CalendarPage />} />
          <Route path={ROUTES.raceResults} element={<RaceResultsPage />} />
          <Route path={ROUTES.standings} element={<StandingsPage />} />
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

### Альтернатива: `createBrowserRouter`

Для MVP достаточно `<BrowserRouter>` + `<Routes>`. Data Router (`createBrowserRouter`) — не нужен.

### Typed routes (опционально)

Можно типизировать params через module augmentation react-router — **не обязательно** для MVP.

### `RaceResultsPage` — чтение params

```typescript
import { useParams } from 'react-router-dom'

export function RaceResultsPage() {
  const { season, round } = useParams<{ season: string; round: string }>()

  return (
    <div>
      <h1>Race Results</h1>
      <p>
        Season: {season}, Round: {round}
      </p>
    </div>
  )
}
```

> Валидация `season`/`round` как number — в Фазе 4 при загрузке данных.

### Критерий готовности

- [ ] Все 5 маршрутов открываются по URL
- [ ] `/races/2024/1` показывает season и round
- [ ] `/unknown-page` → 404
- [ ] Layout (Header + Sidebar) виден на каждой странице

---

## 2.3 — AppLayout, Header, Sidebar

### Задача

Реализовать каркас приложения с CSS Modules. Заменить placeholder-компоненты.

### Файлы

```
src/components/layout/
├── AppLayout.tsx
├── AppLayout.module.css
├── Header.tsx
├── Header.module.css
├── Sidebar.tsx
├── Sidebar.module.css
└── index.ts              # barrel export (опционально)
```

---

### AppLayout

**`AppLayout.tsx`:**

```typescript
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import styles from './AppLayout.module.css'

export function AppLayout() {
  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.body}>
        <Sidebar />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

**`AppLayout.module.css`:**

```css
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.body {
  display: flex;
  flex: 1;
}

.main {
  flex: 1;
  padding: var(--space-6);
  max-width: var(--content-max-width);
  width: 100%;
}
```

---

### Header

**Содержимое:**
- Логотип + название приложения (`LABELS.appLogo`, `LABELS.appTitle`)
- Season selector — **visual placeholder** (disabled `<select>` или статичный текст `2026`) до Фазы 3

**`Header.tsx`:**

```typescript
import { LABELS } from '@/constants'
import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          {LABELS.appLogo}
        </span>
        <span className={styles.title}>{LABELS.appTitle}</span>
      </div>

      <div className={styles.actions}>
        <label className={styles.seasonLabel}>
          <span className="visually-hidden">{LABELS.seasonSelector}</span>
          <select className={styles.seasonSelect} disabled defaultValue="2026">
            <option value="2026">{LABELS.seasonSelectorPlaceholder}</option>
          </select>
        </label>
      </div>
    </header>
  )
}
```

**`Header.module.css`** — ключевые стили:

```css
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 var(--space-6);
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

.title {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.seasonSelect {
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
}
```

---

### Sidebar

**`Sidebar.tsx`:**

```typescript
import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/constants'
import { cn } from '@/lib/utils'
import styles from './Sidebar.module.css'

export function Sidebar() {
  return (
    <nav className={styles.sidebar} aria-label="Main navigation">
      <ul className={styles.list}>
        {NAV_ITEMS.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => cn(styles.link, isActive && styles.active)}
              end={item.path === '/'}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

> `end={item.path === '/'}` — чтобы `/` не подсвечивался на всех вложенных путях.  
> Лучше: `end={item.path === ROUTES.home}` — через константу.

**`Sidebar.module.css`:**

```css
.sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  padding: var(--space-4) 0;
}

.link {
  display: block;
  padding: var(--space-3) var(--space-6);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.link:hover {
  color: var(--color-text-primary);
  background-color: var(--color-bg-elevated);
}

.active {
  color: var(--color-accent);
  border-right: 3px solid var(--color-accent);
  background-color: var(--color-bg-elevated);
}
```

### Критерий готовности

- [ ] Header фиксированной высоты `--header-height`
- [ ] Sidebar ширины `--sidebar-width`
- [ ] Active link визуально выделен
- [ ] Семантика: `<header>`, `<nav>`, `<main>`
- [ ] Стили только через CSS Modules + CSS variables

---

## 2.4 — Страницы и 404

### Задача

Обновить placeholder-страницы и добавить `NotFoundPage`. Контент минимальный — достаточно заголовка и описания раздела.

### Общий паттерн страницы

```typescript
import { LABELS } from '@/constants'
import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Home</h1>
      <p className={styles.description}>Season overview — coming in Phase 6.</p>
    </div>
  )
}
```

> Тексты «coming in Phase X» — только для dev placeholder; заменить в соответствующих фазах.  
> Альтернатива: использовать `LABELS.homeDescription` из constants.

### Страницы — минимальный контент

| Страница | Заголовок | Placeholder-текст (constants) |
|----------|-----------|-------------------------------|
| `HomePage` | Home | Season overview |
| `CalendarPage` | Calendar | Race calendar |
| `StandingsPage` | Standings | Driver & constructor standings |
| `DashboardPage` | Dashboard | Charts and summary |
| `RaceResultsPage` | Race Results | Season + round из `useParams` |
| `NotFoundPage` | 404 | `LABELS.notFoundTitle`, link to home |

### `NotFoundPage`

**Файл:** `src/pages/NotFoundPage.tsx`

```typescript
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { LABELS, routePaths } from '@/constants'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{LABELS.notFoundTitle}</h1>
      <p className={styles.message}>{LABELS.notFoundMessage}</p>
      <Button variant="primary" asChild>
        <Link to={routePaths.home()}>{LABELS.notFoundBack}</Link>
      </Button>
    </div>
  )
}
```

> Если `Button` не поддерживает `asChild` — обернуть `Link` в `Button` через `onClick` + `navigate`, или стилизовать `Link` как кнопку. **Проще для MVP:** использовать `Link` + класс из Button styles или добавить prop `href` позже.

**Упрощённый вариант без `asChild`:**

```typescript
<Link to={routePaths.home()}>
  <Button variant="primary">{LABELS.notFoundBack}</Button>
</Link>
```

### CSS страниц

Общие стили можно вынести в `Page.module.css` или дублировать минимально:

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

.description {
  color: var(--color-text-secondary);
}
```

### Дополнить `LABELS`

```typescript
export const LABELS = {
  // ...existing
  pageHome: 'Home',
  pageCalendar: 'Calendar',
  pageStandings: 'Standings',
  pageDashboard: 'Dashboard',
  pageRaceResults: 'Race Results',
  pageHomeDescription: 'Season overview — coming soon.',
  pageCalendarDescription: 'Race calendar — coming soon.',
  // ...
} as const
```

### Критерий готовности

- [ ] `NotFoundPage` создан
- [ ] Все страницы рендерятся внутри `<main>`
- [ ] `RaceResultsPage` показывает params из URL
- [ ] Заголовки страниц из `LABELS`, не hardcoded (где применимо)

---

## 2.5 — Точка входа и сборка App

### Задача

Собрать приложение: Providers → Router. Удалить UI Kit sandbox.

### `src/main.tsx`

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/app/providers'
import { AppRouter } from '@/app/router'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
)
```

### `src/App.tsx`

**Вариант A — удалить** `App.tsx` и `App.module.css` (роутинг полностью в `app/`).

**Вариант B — оставить тонкую обёртку:**

```typescript
import { AppProviders } from '@/app/providers'
import { AppRouter } from '@/app/router'

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}
```

Рекомендация: **Вариант A** — `main.tsx` напрямую рендерит Providers + Router; `App.tsx` удалить.

### Обновить `index.html`

```html
<title>F1 Dashboard</title>
```

(Уже должно быть с Фазы 0.)

### Критерий готовности

- [ ] UI Kit sandbox удалён
- [ ] `pnpm dev` — layout + navigation работают
- [ ] Нет неиспользуемых импортов / мёртвых файлов

---

## 2.6 — Проверка и приёмка фазы

### Smoke-тесты

```bash
pnpm dev           # ручная проверка навигации
pnpm build         # production-сборка
pnpm lint          # 0 errors
pnpm test          # существующие тесты Фазы 0–1 не сломаны
```

### Ручная проверка в браузере

| # | Действие | Ожидание |
|---|----------|----------|
| 1 | Открыть `/` | Home, layout, Home active в sidebar |
| 2 | Клик Calendar | URL `/calendar`, Calendar active |
| 3 | Клик Standings | URL `/standings` |
| 4 | Клик Dashboard | URL `/dashboard` |
| 5 | Открыть `/races/2024/5` | Race Results, season=2024, round=5 |
| 6 | Открыть `/foo` | 404, кнопка Back to Home |
| 7 | Back to Home с 404 | URL `/` |
| 8 | Refresh на `/calendar` | Страница не 404 (SPA routing OK) |

> Для production SPA на хостинге понадобится fallback на `index.html` — в Фазе 8 (deploy).

### Опциональный тест роутера

```typescript
// src/app/router.test.tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { ROUTES } from '@/constants'

describe('routing', () => {
  it('renders HomePage at /', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.home]}>
        <Routes>
          <Route path={ROUTES.home} element={<HomePage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /home/i })).toBeInTheDocument()
  })
})
```

Не обязателен для MVP — 1 тест достаточно, если добавляем.

### Definition of Done — Фаза 2

| # | Критерий | Статус |
|---|----------|--------|
| 1 | `ROUTES`, `NAV_ITEMS`, `LABELS` в constants | ☐ |
| 2 | `QueryClientProvider` подключён | ☐ |
| 3 | 5 маршрутов + 404 работают | ☐ |
| 4 | `AppLayout` — Header + Sidebar + Outlet | ☐ |
| 5 | NavLink active state | ☐ |
| 6 | `RaceResultsPage` читает `:season/:round` | ☐ |
| 7 | UI Kit sandbox удалён | ☐ |
| 8 | `pnpm dev` / `pnpm build` / `pnpm lint` — OK | ☐ |
| 9 | Layout на всех страницах включая 404 | ☐ |
| 10 | Нет magic strings в router/layout | ☐ |

---

## Итоговая структура файлов

После завершения Фазы 2:

```
src/
├── app/
│   ├── providers.tsx         # QueryClientProvider
│   ├── router.tsx            # BrowserRouter + Routes
│   └── router.test.tsx       # опционально
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── AppLayout.module.css
│   │   ├── Header.tsx
│   │   ├── Header.module.css
│   │   ├── Sidebar.tsx
│   │   ├── Sidebar.module.css
│   │   └── index.ts
│   └── ui/                   # без изменений
├── constants/
│   ├── routes.ts             # NEW
│   ├── navigation.ts         # NEW
│   ├── labels.ts             # NEW
│   ├── query.ts              # опционально
│   ├── raceStatus.ts
│   ├── resultStatus.ts
│   ├── api.ts
│   └── index.ts
├── pages/
│   ├── HomePage.tsx
│   ├── HomePage.module.css
│   ├── CalendarPage.tsx
│   ├── CalendarPage.module.css
│   ├── RaceResultsPage.tsx
│   ├── StandingsPage.tsx
│   ├── DashboardPage.tsx
│   ├── NotFoundPage.tsx      # NEW
│   └── NotFoundPage.module.css
├── main.tsx                  # Providers + Router
└── (App.tsx удалён)
```

---

## Чеклист задач

### 2.0 — Константы
- [ ] `constants/routes.ts` — `ROUTES`, `routePaths`
- [ ] `constants/navigation.ts` — `NAV_ITEMS`
- [ ] `constants/labels.ts` — `LABELS` (app, 404, pages)
- [ ] Обновить `constants/index.ts`

### 2.1 — Providers
- [ ] `app/providers.tsx` — `QueryClientProvider`
- [ ] (опционально) `constants/query.ts` — staleTime
- [ ] (опционально) React Query DevTools в dev

### 2.2 — Router
- [ ] `app/router.tsx` — layout route + 5 pages + 404
- [ ] `RaceResultsPage` — `useParams`
- [ ] `NotFoundPage` — link на home через `routePaths`

### 2.3 — Layout
- [ ] `AppLayout` + CSS module
- [ ] `Header` + CSS module (brand, season placeholder)
- [ ] `Sidebar` + CSS module (NavLink, active)
- [ ] (опционально) `layout/index.ts`

### 2.4 — Страницы
- [ ] Обновить 5 страниц — заголовок + placeholder из `LABELS`
- [ ] CSS module для страниц (или shared)
- [ ] `NotFoundPage`

### 2.5 — Entry point
- [ ] `main.tsx` — AppProviders + AppRouter
- [ ] Удалить `App.tsx`, `App.module.css`

### 2.6 — Приёмка
- [ ] Ручная проверка 8 пунктов из таблицы
- [ ] `pnpm dev` ✓
- [ ] `pnpm build` ✓
- [ ] `pnpm lint` ✓
- [ ] `pnpm test` ✓
- [ ] Definition of Done — все пункты

---

## Что дальше

После завершения Фазы 2 переходить к **[Фаза 3 — Календарь](./development-plan.md#фаза-3--календарь)**:

- Hook `useRaces(season)` через TanStack Query
- `CalendarPage` с таблицей гонок
- `SeasonSelector` — оживить placeholder в Header
- UI: `Table`, `Select`, `RaceStatusBadge`
- Ссылка на `/races/:season/:round`

---

## Заметки и решения

| Вопрос | Решение |
|--------|---------|
| `BrowserRouter` vs `createBrowserRouter` | `BrowserRouter` + `Routes` — проще для MVP |
| Season в URL | Query `?season=2026` — синхронизация в Фазе 3 |
| SeasonSelector в Header | Disabled placeholder в Фазе 2; логика в Фазе 3 |
| Theme toggle 🌙 | Post-MVP; не добавлять в Фазе 2 |
| Mobile sidebar | Фаза 8 (responsive) |
| `App.tsx` | Удалить — entry point в `main.tsx` |
| Magic strings | `ROUTES`, `NAV_ITEMS`, `LABELS` — обязательно |
| Button + Link на 404 | `<Link><Button>` или styled Link — без radix asChild |
| Zustand | Не нужен — сезон в URL query (Фаза 3) |

---

## Порядок реализации (рекомендуемый)

```
constants (routes, nav, labels)
  → providers
  → layout (AppLayout, Header, Sidebar)
  → router + NotFoundPage
  → update pages
  → main.tsx, delete App sandbox
  → manual QA
```

После **layout + router** можно проверять навигацию до polish страниц.
