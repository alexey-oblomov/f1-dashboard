# F1 Dashboard — Фаза 8: Полировка

> Подробный пошаговый план финальной фазы MVP — responsive layout, QA, README.
>
> Связанные документы:
> - [project-description.md](./project-description.md) — концепция, стек, Post-MVP
> - [development-plan.md](./development-plan.md) — общий план MVP, чеклист качества
> - [phase-2-layout-routing.md](./phase-2-layout-routing.md) — AppLayout, Sidebar, Header
> - [phase-6-home.md](./phase-6-home.md) — Home grids (responsive отложен)
> - [phase-7-dashboard.md](./phase-7-dashboard.md) — Dashboard grids (responsive отложен)

**Оценка:** 2–3 часа  
**Цель фазы:** MVP готов к использованию — responsive на mobile, единообразные states, README, финальный QA. После завершения — **MVP complete**.

---

## Содержание

1. [Предварительные требования](#1-предварительные-требования)
2. [Обзор фазы](#2-обзор-фазы)
3. [Архитектура](#3-архитектура)
4. [8.0 — Константы](#80--константы)
5. [8.1 — Аудит Loading / Error / Empty](#81--аудит-loading--error--empty)
6. [8.2 — Responsive: breakpoint + CSS variables](#82--responsive-breakpoint--css-variables)
7. [8.3 — Mobile navigation (hamburger)](#83--mobile-navigation-hamburger)
8. [8.4 — Responsive page grids](#84--responsive-page-grids)
9. [8.5 — Форматтеры](#85--форматтеры)
10. [8.6 — Cleanup: мёртвый код и labels](#86--cleanup-мёртвый-код-и-labels)
11. [8.7 — Recharts code splitting (опционально)](#87--recharts-code-splitting-опционально)
12. [8.8 — README](#88--readme)
13. [8.9 — Тесты и финальный QA](#89--тесты-и-финальный-qa)
14. [Итоговая структура файлов](#итоговая-структура-файлов)
15. [Чеклист задач](#чеклист-задач)

---

## 1. Предварительные требования

Фазы 0–7 должны быть завершены:

| Критерий | Проверка |
|----------|----------|
| 5 страниц с данными | Home, Calendar, Race Results, Standings, Dashboard |
| Layout | `AppLayout`, `Header`, `Sidebar` |
| Loading/error на data pages | Calendar, Race Results, Standings, Home, Dashboard |
| `pnpm test` | 60+ тестов проходят |
| `pnpm build` | production-сборка OK |
| `recharts` в bundle | ~700 KB JS (warning допустим) |
| README | дефолтный Vite scaffold — **заменить** |

---

## 2. Обзор фазы

### Что делаем

| # | Задача | Результат |
|---|--------|-----------|
| 8.0 | `BREAKPOINTS`, nav labels | Константы для responsive |
| 8.1 | Аудит states на всех страницах | Таблица gaps + fixes |
| 8.2 | CSS breakpoint variables | `@media` queries единообразно |
| 8.3 | Hamburger + mobile sidebar | Навигация на `< 768px` |
| 8.4 | Responsive grids | Home, Dashboard, QuickLinks, Summary |
| 8.5 | `formatPoints`, `formatWins` | Единый формат чисел |
| 8.6 | Cleanup | Удалить «coming soon» labels, мёртвые файлы |
| 8.7 | Code splitting Recharts | (опционально) меньший initial bundle |
| 8.8 | README | Setup, stack, API, scripts |
| 8.9 | Финальный QA + тесты | MVP checklist green |

### Что **не** делаем

- Deploy на Vercel/Netlify (Post-MVP v2)
- Dark/Light theme toggle
- Service worker / offline cache
- E2E Playwright/Cypress
- Line chart накопления очков
- Полный a11y audit (WCAG) — только базовые aria для menu

### UX — Mobile (< 768px)

```
┌─────────────────────────────┐
│ 🏎 F1 Dashboard    [☰] [▼] │  ← Header: hamburger + season
├─────────────────────────────┤
│                             │
│   (page content full width) │
│                             │
└─────────────────────────────┘

Overlay open:
┌─────────────────────────────┐
│ 🏎 F1 Dashboard    [✕] [▼]   │
├──────────┬──────────────────┤
│ Home     │                  │
│ Calendar │   (dimmed main)  │
│ Standings│                  │
│ Dashboard│                  │
└──────────┴──────────────────┘
```

---

## 3. Архитектура

### Изменения по слоям

```
src/
├── constants/
│   └── layout.ts              # NEW — BREAKPOINTS
├── hooks/
│   └── useMediaQuery.ts       # NEW — matchMedia helper
├── components/layout/
│   ├── AppLayout.tsx          # UPDATE — mobile nav state
│   ├── AppLayout.module.css   # UPDATE
│   ├── Header.tsx             # UPDATE — MenuButton
│   ├── Header.module.css      # UPDATE
│   ├── Sidebar.tsx            # UPDATE — overlay mode
│   ├── Sidebar.module.css     # UPDATE — mobile drawer
│   └── MobileMenuButton.tsx   # NEW (optional inline in Header)
├── styles/
│   └── variables.css          # UPDATE — --breakpoint-md
├── lib/
│   └── formatters.ts          # UPDATE — formatPoints, formatWins
└── pages/ + features/         # UPDATE — responsive CSS modules
```

### Принципы

| Принцип | Решение |
|---------|---------|
| Breakpoint | `768px` — tablet/mobile граница |
| Mobile nav state | `useState` в `AppLayout`, не Zustand |
| Sidebar desktop | Как сейчас — fixed width column |
| Sidebar mobile | Overlay drawer + backdrop click to close |
| Close on navigate | `onNavigate` callback при NavLink click |
| Season in URL | Сохраняется при mobile nav (уже в Sidebar) |
| CSS-first grids | `@media (max-width: 768px)` в module CSS |
| Formatters | Централизовать `{n} pts` — не дублировать в JSX |
| README | Заменить Vite scaffold полностью |

---

## 8.0 — Константы

### `src/constants/layout.ts`

```typescript
export const BREAKPOINTS = {
  md: 768,
} as const

export const MEDIA_QUERIES = {
  mdDown: `(max-width: ${BREAKPOINTS.md}px)`,
  mdUp: `(min-width: ${BREAKPOINTS.md + 1}px)`,
} as const
```

### Дополнить `src/constants/labels.ts`

```typescript
export const LABELS = {
  // ...existing
  menuOpen: 'Open menu',
  menuClose: 'Close menu',
} as const
```

### Дополнить `src/styles/variables.css`

```css
:root {
  /* ...existing */
  --breakpoint-md: 768px;
}
```

### Barrel — `src/constants/index.ts`

```typescript
export { BREAKPOINTS, MEDIA_QUERIES } from './layout'
```

---

## 8.1 — Аудит Loading / Error / Empty

### Текущее состояние (после Фаз 3–7)

| Страница | Loading | Error + Retry | Empty | Примечание |
|----------|---------|---------------|-------|------------|
| Home | ✅ Skeleton | ✅ | ✅ next/latest | — |
| Calendar | ✅ | ✅ | ✅ noRaces | — |
| Race Results | ✅ | ✅ | ✅ noResults | ✅ invalid params |
| Standings | ✅ per tab | ✅ | ✅ noStandings | — |
| Dashboard | ✅ | ✅ | ✅ per card/chart | — |
| 404 | — | — | ✅ static | OK |

### Задачи аудита

1. Пройти каждую страницу вручную (offline → error, invalid season, empty season).
2. Убедиться, что **Retry** вызывает `refetch()` корректно.
3. Проверить консistency: error block использует `LABELS.error` + `LABELS.retry` везде.
4. **NotFoundPage** — без loading (static) — OK.

### Возможные доработки (если найдены gaps)

| Gap | Fix |
|-----|-----|
| Race Results: error при invalid round | Уже есть |
| Dashboard: partial error | Сейчас all-or-nothing — OK для MVP |
| Home: results error только в LatestResults | OK — partial empty |

### Критерий готовности

- [ ] Все 5 data-страниц имеют loading + error + empty (где применимо)
- [ ] Нет «белого экрана» при ошибке API

---

## 8.2 — Responsive: breakpoint + CSS variables

Единая точка для media queries — CSS variable + constants для JS (`useMediaQuery`).

### Pattern для module CSS

```css
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

> `480px` — optional second breakpoint для very small phones; можно только `768px` для MVP.

---

## 8.3 — Mobile navigation (hamburger)

### Hook: `src/hooks/useMediaQuery.ts`

```typescript
import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )

  useEffect(() => {
    const media = window.matchMedia(query)
    const listener = () => setMatches(media.matches)
    listener()
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}
```

### `AppLayout.tsx` — state + conditional sidebar

```typescript
import { useState } from 'react'
import { MEDIA_QUERIES } from '@/constants'
import { useMediaQuery } from '@/hooks/useMediaQuery'

export function AppLayout() {
  const isMobile = useMediaQuery(MEDIA_QUERIES.mdDown)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <div className={styles.layout}>
      <Header
        isMobile={isMobile}
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen((open) => !open)}
      />
      <div className={styles.body}>
        <Sidebar
          isMobile={isMobile}
          isOpen={isMenuOpen}
          onNavigate={closeMenu}
        />
        {isMobile && isMenuOpen && (
          <button
            type="button"
            className={styles.backdrop}
            aria-label={LABELS.menuClose}
            onClick={closeMenu}
          />
        )}
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

### `Header.tsx` — menu button

```typescript
interface HeaderProps {
  isMobile?: boolean
  isMenuOpen?: boolean
  onMenuToggle?: () => void
}

// В actions, перед SeasonSelector:
{isMobile && (
  <button
    type="button"
    className={styles.menuButton}
    onClick={onMenuToggle}
    aria-expanded={isMenuOpen}
    aria-label={isMenuOpen ? LABELS.menuClose : LABELS.menuOpen}
  >
    {isMenuOpen ? '✕' : '☰'}
  </button>
)}
```

> Иконки — unicode для MVP; позже SVG icon component.

### `Sidebar.tsx` — mobile drawer

```typescript
interface SidebarProps {
  isMobile?: boolean
  isOpen?: boolean
  onNavigate?: () => void
}

// NavLink onClick:
onClick={onNavigate}

// className на nav:
cn(
  styles.sidebar,
  isMobile && styles.sidebarMobile,
  isMobile && isOpen && styles.sidebarOpen,
)
```

### `Sidebar.module.css` — mobile styles

```css
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: var(--header-height);
    left: 0;
    bottom: 0;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform var(--transition-base);
    width: min(var(--sidebar-width), 80vw);
  }

  .sidebarOpen {
    transform: translateX(0);
  }
}
```

### `AppLayout.module.css` — backdrop

```css
.backdrop {
  position: fixed;
  inset: 0;
  top: var(--header-height);
  background: rgba(0, 0, 0, 0.5);
  border: none;
  z-index: 99;
  cursor: pointer;
}
```

### Barrel — `hooks/index.ts`

```typescript
export { useMediaQuery } from './useMediaQuery'
```

### Критерий готовности

- [ ] `< 768px`: sidebar скрыт, hamburger открывает drawer
- [ ] Клик по backdrop / NavLink закрывает menu
- [ ] `aria-expanded`, `aria-label` на кнопке
- [ ] `≥ 768px`: sidebar always visible, hamburger hidden

---

## 8.4 — Responsive page grids

### Файлы для обновления

| Файл | Desktop | Tablet (≤768px) | Mobile (≤480px) |
|------|---------|-----------------|-----------------|
| `HomePage.module.css` `.grid` | 2 col | 1 col | 1 col |
| `DashboardPage` → `SummaryCardsGrid.module.css` | 4 col | 2 col | 1 col |
| `QuickLinksGrid.module.css` | 3 col | 2 col | 1 col |
| `AppLayout.module.css` `.main` | padding 24px | padding 16px | padding 12px |
| `Header.module.css` | — | меньше padding | — |

### Пример — `HomePage.module.css`

```css
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

### Таблицы (Calendar, Standings, Results)

```css
/* RaceTable.module.css / ResultsTable — optional */
@media (max-width: 768px) {
  .table {
    font-size: var(--font-size-sm);
  }
}
```

> Horizontal scroll для wide tables — optional:

```css
.tableWrapper {
  overflow-x: auto;
}
```

---

## 8.5 — Форматтеры

### Дополнить `src/lib/formatters.ts`

```typescript
export function formatPoints(points: number): string {
  return `${points} pts`
}

export function formatWins(wins: number): string {
  return wins === 1 ? '1 win' : `${wins} wins`
}
```

> Альтернатива с `LABELS`: `LABELS.summaryPoints.replace('{points}', String(points))` — если нужна i18n позже.

### Где применить (refactor)

| Место | Было | Станет |
|-------|------|--------|
| `LatestResultsPreview` | `{result.points} pts` | `formatPoints(result.points)` |
| `SummaryCardsGrid` meta | inline template | можно оставить LABELS templates |
| Charts tooltip | `` `${value} pts` `` | `formatPoints(Number(value))` |

> Минимальный scope: добавить функции + 1–2 использования + test. Полный refactor всех `pts` — optional.

### Unit-test — `src/lib/formatters.test.ts`

```typescript
describe('formatPoints', () => {
  it('formats points with pts suffix', () => {
    expect(formatPoints(25)).toBe('25 pts')
    expect(formatPoints(0)).toBe('0 pts')
  })
})
```

---

## 8.6 — Cleanup: мёртвый код и labels

### Удалить неиспользуемые placeholder labels

Из `src/constants/labels.ts` (если нигде не импортируются):

```typescript
// REMOVE:
pageHomeDescription
pageCalendarDescription
pageStandingsDescription
pageDashboardDescription
```

> Проверить `grep` перед удалением.

### Удалить `src/pages/page.module.css`

Если ни один page не импортирует — удалить файл.

### Удалить неиспользуемые Vite assets

- `src/assets/react.svg` — если не используется

### Optional: перенести `SeasonSelector`

Из `features/calendar/` → `components/SeasonSelector/` — не блокер Фазы 8.

---

## 8.7 — Recharts code splitting (опционально)

Build warning: bundle > 500 KB из-за Recharts.

### Lazy load Dashboard charts

```typescript
// DashboardPage.tsx
import { lazy, Suspense } from 'react'

const DriverPointsChart = lazy(() =>
  import('@/features/dashboard/DriverPointsChart').then((m) => ({
    default: m.DriverPointsChart,
  })),
)
```

```typescript
<Suspense fallback={<Skeleton height={300} />}>
  <DriverPointsChart data={driverChartData} isLoading={...} />
</Suspense>
```

> **Optional** — только если есть время; не блокирует MVP complete.

---

## 8.8 — README

### Заменить `README.md` (корень проекта)

Структура:

```markdown
# F1 Dashboard

Pet-project SPA для данных Formula 1 (календарь, результаты, standings, dashboard).

## Stack

- Vite, React 19, TypeScript
- React Router, TanStack Query
- Zod, CSS Modules, Recharts
- Vitest, ESLint, Prettier, pnpm

## Data source

[Jolpica F1 API](https://api.jolpi.ca/ergast/f1/) — бесплатный Ergast-compatible REST API.

## Getting started

### Prerequisites

- Node.js 20+
- pnpm

### Install & run

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

Open http://localhost:5173

### Scripts

| Command | Description |
|---------|-------------|
| pnpm dev | Dev server |
| pnpm build | Production build |
| pnpm preview | Preview production build |
| pnpm test | Run tests |
| pnpm lint | ESLint |

## Project structure

\`\`\`
src/
├── api/          # HTTP client, Zod schemas, mappers
├── app/          # Router, providers
├── components/   # UI kit + layout
├── constants/    # No magic strings
├── features/     # Feature modules
├── hooks/        # TanStack Query hooks
├── lib/          # Utilities, formatters
├── pages/        # Route pages
└── types/        # Domain types
\`\`\`

## Routes

| Path | Description |
|------|-------------|
| / | Home — season overview |
| /calendar | Race calendar |
| /races/:season/:round | Race results |
| /standings | Driver & constructor standings |
| /dashboard | Summary cards + charts |

Season filter: `?season=2024` (synced via Header).

## Docs

See `docs/` for development phases and architecture.

## License

Private pet project.
```

---

## 8.9 — Тесты и финальный QA

### Новые тесты (минимум)

| Файл | Что проверяет |
|------|---------------|
| `hooks/useMediaQuery.test.ts` | matchMedia mock |
| `lib/formatters.test.ts` | `formatPoints`, `formatWins` |
| `components/layout/Sidebar.test.tsx` | mobile class + onNavigate |
| `components/layout/Header.test.tsx` | menu button aria |

> Тесты из `development-plan.md` (Zod, getNextRace, StandingsTable) **уже есть** — не дублировать:

| Уже покрыто | Файл |
|-------------|------|
| Zod schemas | `api/schemas/*.test.ts` |
| getNextRace | `lib/raceSchedule.test.ts` |
| StandingsTable | `DriverStandingsTable.test.tsx`, `ConstructorStandingsTable.test.tsx` |

### Пример — useMediaQuery

```typescript
import { renderHook, act } from '@testing-library/react'
import { useMediaQuery } from './useMediaQuery'

it('returns true when media matches', () => {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: true,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))

  const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))
  expect(result.current).toBe(true)
})
```

### Финальный QA checklist (из development-plan.md)

```bash
pnpm dev
pnpm build
pnpm test
pnpm lint
```

| # | Проверка | OK |
|---|----------|-----|
| 1 | App starts without errors | ☐ |
| 2 | Production build passes | ☐ |
| 3 | All tests pass | ☐ |
| 4 | No lint errors | ☐ |
| 5 | All 5 sections show real API data | ☐ |
| 6 | Loading + error on every data page | ☐ |
| 7 | Navigation: sidebar, quick links, race click | ☐ |
| 8 | Season sync across pages | ☐ |
| 9 | Mobile: hamburger works | ☐ |
| 10 | README accurate | ☐ |

### Manual cross-browser (optional)

- Chrome / Firefox / Edge — layout OK
- Mobile emulation 375px — grids stack, menu works

---

## Итоговая структура файлов

```
src/
├── constants/
│   ├── layout.ts                    # NEW
│   └── labels.ts                    # UPDATE — menu labels, remove placeholders
├── hooks/
│   ├── useMediaQuery.ts             # NEW
│   ├── useMediaQuery.test.ts        # NEW
│   └── index.ts                     # UPDATE
├── components/layout/
│   ├── AppLayout.tsx                # UPDATE
│   ├── AppLayout.module.css         # UPDATE — backdrop, main padding
│   ├── Header.tsx                   # UPDATE — menu button
│   ├── Header.module.css            # UPDATE
│   ├── Sidebar.tsx                  # UPDATE — mobile drawer
│   ├── Sidebar.module.css           # UPDATE
│   ├── Sidebar.test.tsx             # NEW
│   └── Header.test.tsx              # NEW (optional)
├── lib/
│   ├── formatters.ts                # UPDATE
│   └── formatters.test.ts           # NEW
├── styles/
│   └── variables.css                # UPDATE — breakpoint
├── pages/
│   ├── HomePage.module.css          # UPDATE — responsive grid
│   └── page.module.css              # DELETE if unused
├── features/
│   ├── home/QuickLinksGrid.module.css    # UPDATE
│   └── dashboard/SummaryCardsGrid.module.css  # UPDATE
README.md                              # REPLACE
```

---

## Чеклист задач

### 8.0 — Константы
- [ ] `BREAKPOINTS`, `MEDIA_QUERIES` в `layout.ts`
- [ ] `LABELS.menuOpen`, `menuClose`
- [ ] `--breakpoint-md` в variables.css

### 8.1 — States audit
- [ ] Пройти 5 страниц: loading / error / empty
- [ ] Fix gaps если найдены

### 8.2 — Mobile nav
- [ ] `useMediaQuery` hook + test
- [ ] Header menu button + aria
- [ ] Sidebar mobile drawer + backdrop
- [ ] Close on navigate

### 8.3 — Responsive grids
- [ ] HomePage 2→1 col
- [ ] SummaryCardsGrid 4→2→1 col
- [ ] QuickLinksGrid 3→2→1 col
- [ ] Main padding на mobile

### 8.4 — Formatters
- [ ] `formatPoints`, `formatWins`
- [ ] `formatters.test.ts`
- [ ] (optional) refactor usages

### 8.5 — Cleanup
- [ ] Remove unused «coming soon» labels
- [ ] Delete `page.module.css` if unused
- [ ] Remove unused Vite assets

### 8.6 — README
- [ ] Replace Vite scaffold with project README
- [ ] Stack, API, scripts, routes, structure

### 8.7 — Optional
- [ ] Recharts lazy load on Dashboard
- [ ] Table horizontal scroll on mobile

### 8.8 — Final QA
- [ ] `pnpm dev` / `test` / `lint` / `build`
- [ ] MVP checklist — all green
- [ ] Mobile manual test

---

## Что дальше (Post-MVP v2)

После **MVP complete** возможные направления:

| Направление | Описание |
|-------------|----------|
| Deploy | Vercel / Netlify + CI |
| Line chart | Накопление очков по раундам |
| Driver/team pages | `/drivers/:id`, `/teams/:id` |
| Qualifying | Results qualifying session |
| Theme toggle | Dark/Light |
| E2E tests | Playwright smoke suite |
| PWA | Service worker offline cache |

---

## Заметки и решения

| Вопрос | Решение |
|--------|---------|
| Breakpoint 768 vs 640? | 768px — стандарт tablet; aligns with Tailwind `md` |
| Menu state: URL vs local | Local `useState` — не shareable, достаточно для MVP |
| Hamburger icon | Unicode ☰/✕ для MVP; SVG later |
| Body scroll lock | Optional — backdrop достаточно |
| useMediaQuery SSR | Vite SPA — `window` always available in browser |
| Tests from dev plan 8.4 | Уже покрыты в фазах 1–7 — добавить только новые |
| README language | English (как UI labels) или bilingual — English для MVP |
| Deploy in phase 8? | Post-MVP — упомянуть в README, не реализовывать |
| formatWins vs LABELS | `formatWins` для plain text; templates для summary meta |
| Delete placeholder labels | grep first — безопасное удаление |

---

## Порядок реализации (рекомендуемый)

```
constants + useMediaQuery
  → mobile nav (Header + Sidebar + AppLayout)
  → responsive CSS grids
  → formatters + cleanup
  → README
  → states audit + final QA
```

После **mobile nav** можно проверить на DevTools 375px до grids и README.

---

## Definition of Done — MVP Complete

| # | Критерий |
|---|----------|
| 1 | Все фазы 0–8 завершены |
| 2 | 5 разделов с реальными данными |
| 3 | Responsive mobile navigation |
| 4 | README с setup и stack |
| 5 | `pnpm test` / `lint` / `build` — OK |
| 6 | Финальный QA checklist — green |
| 7 | **MVP ready for demo / deploy prep** |
