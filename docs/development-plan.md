# F1 Dashboard — план разработки MVP

> Контекстный документ. Читать перед началом новой задачи или фазы разработки.
>
> Описание проекта: [project-description.md](./project-description.md)

---

## Обзор

| Параметр | Значение |
|----------|----------|
| Оценка MVP | ~18–22 часа |
| Пакетный менеджер | **pnpm** |
| Стили | **CSS Modules** |
| API | Jolpica F1 API |
| Графики | Recharts |

---

## Приоритеты

### MVP Core (must have)

- [ ] Setup + API layer
- [ ] Calendar
- [ ] Race Results
- [ ] Driver Standings

### MVP Extended

- [ ] Home page
- [ ] Constructor Standings
- [ ] Dashboard charts

### Post-MVP (v2)

- [ ] Line chart накопления очков по раундам
- [ ] Детали пилота / команды
- [ ] Qualifying results
- [ ] Dark/Light theme toggle
- [ ] Кэш offline (service worker)
- [ ] Deploy на Vercel/Netlify

---

## Фаза 0 — Подготовка

**Оценка:** 1–2 часа

### Задачи

- [ ] **0.1** Инициализация проекта

  ```bash
  pnpm create vite f1-dashboard --template react-ts
  cd f1-dashboard
  pnpm install
  ```

- [ ] **0.2** Установка зависимостей

  ```bash
  pnpm add react-router-dom @tanstack/react-query zod recharts
  pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
  ```

- [ ] **0.3** Настройка CSS Modules и глобальных стилей
  - `src/styles/variables.css` — CSS-переменные (цвета, отступы, шрифты)
  - `src/styles/global.css` — reset, базовая типографика, импорт variables
  - Подключить `global.css` в `main.tsx`

- [ ] **0.4** Базовые UI-комponentы с CSS Modules:
  - `Button`, `Card`, `Badge`, `Skeleton`
  - Каждый компонент: `Component.tsx` + `Component.module.css`

- [ ] **0.5** Настройка ESLint + Prettier
- [ ] **0.6** Создание структуры папок: `pages/`, `features/`, `api/`, `components/layout/`, `styles/`

### Результат фазы

Проект запускается (`pnpm dev`), глобальные стили и CSS Modules работают, базовые UI-компоненты готовы, структура папок создана.

---

## Фаза 1 — API-слой

**Оценка:** 2–3 часа

### Задачи

- [ ] **1.0** Константы — `src/constants/` (`RACE_STATUS`, `RESULT_STATUS`, `API_PATHS`, …)
- [ ] **1.1** HTTP-клиент — `api/client.ts` с базовым `fetch`
- [ ] **1.2** Zod-схемы — `RaceSchema`, `ResultSchema`, `DriverStandingSchema`, `ConstructorStandingSchema`
- [ ] **1.3** Эндпоинты:
  - `getRaces(season)`
  - `getRaceResults(season, round)`
  - `getDriverStandings(season)`
  - `getConstructorStandings(season)`
- [ ] **1.4** Мапперы — API response → доменные типы (`Race`, `RaceResult`, `Standing`)
- [ ] **1.5** Unit-тест — Zod-схема с fixture JSON

### Результат фазы

API-слой типобезопасен, данные валидируются через Zod, один тест проходит.

---

## Фаза 2 — Layout и роутинг

**Оценка:** 1–2 часа

### Задачи

- [ ] **2.1** React Router — 5 маршрутов:

  | Путь | Страница |
  |------|----------|
  | `/` | HomePage |
  | `/calendar` | CalendarPage |
  | `/races/:season/:round` | RaceResultsPage |
  | `/standings` | StandingsPage |
  | `/dashboard` | DashboardPage |

- [ ] **2.2** Layout — `AppLayout` с Header + Sidebar (`AppLayout.module.css`)
- [ ] **2.3** Providers — `QueryClientProvider`, опционально ThemeProvider
- [ ] **2.4** 404 страница

### Результат фазы

Навигация между разделами работает, layout отображается на всех страницах.

---

## Фаза 3 — Календарь

**Оценка:** 2–3 часа

### Задачи

- [ ] **3.1** Hook — `useRaces(season)` через TanStack Query
- [ ] **3.2** `CalendarPage` — таблица гонок
- [ ] **3.3** `RaceStatusBadge` — completed / upcoming
- [ ] **3.4** `SeasonSelector` — dropdown 2024–2026
- [ ] **3.5** `Table`, `Select` — UI-компоненты (если ещё не созданы в фазе 0)
- [ ] **3.6** Skeleton при загрузке, error state
- [ ] **3.7** Ссылка из строки таблицы → `/races/:season/:round`

### Результат фазы

Можно просматривать список гонок сезона с фильтром по году.

---

## Фаза 4 — Результаты гонки

**Оценка:** 2 часа

### Задачи

- [ ] **4.1** Hook — `useRaceResults(season, round)`
- [ ] **4.2** `RaceResultsPage` — динамический роут
- [ ] **4.3** `ResultsTable` — с форматированием статуса (Finished / Retired / DSQ)
- [ ] **4.4** `RaceHeader` — название гонки, раунд, дата

### Результат фазы

По клику из календаря открывается финишная классификация гонки.

---

## Фаза 5 — Турнирные таблицы

**Оценка:** 2 часа

### Задачи

- [ ] **5.1** Hooks — `useDriverStandings`, `useConstructorStandings`
- [ ] **5.2** `Tabs` — UI-компонент (если ещё не создан в фазе 0)
- [ ] **5.3** `StandingsPage` — Tabs (Drivers / Constructors)
- [ ] **5.4** `DriverStandingsTable` — pos, driver, team, points, wins
- [ ] **5.5** `ConstructorStandingsTable` — pos, team, points, wins
- [ ] **5.6** `SeasonSelector` — переиспользовать из календаря

### Результат фазы

Таблицы пилотов и конструкторов с фильтром по сезону.

---

## Фаза 6 — Главная

**Оценка:** 2 часа

### Задачи

- [ ] **6.1** Утилиты — `getNextRace(races)`, `getLastCompletedRace(races)`
- [ ] **6.2** `NextRaceCard` — ближайшая гонка с countdown
- [ ] **6.3** `LatestResultsPreview` — топ-3 последней гонки
- [ ] **6.4** `QuickLinksGrid` — карточки-ссылки на разделы
- [ ] **6.5** `HomePage` — сборка всех блоков

### Результат фазы

Главная страница даёт обзор сезона и быстрый доступ к разделам.

---

## Фаза 7 — Дашборд

**Оценка:** 3–4 часа

### Задачи

- [ ] **7.1** `SummaryCard` — переиспользуемый компонент
- [ ] **7.2** 4 summary-карточки: лидер пилотов, лидер команд, ближайшая гонка, последняя гонка
- [ ] **7.3** `DriverPointsChart` — Recharts BarChart, top 10
- [ ] **7.4** `ConstructorPointsChart` — Recharts BarChart, top 10
- [ ] **7.5** `DashboardPage` — сборка карточек и графиков

### Результат фазы

Дашборд с summary-карточками и bar charts по очкам.

---

## Фаза 8 — Полировка

**Оценка:** 2–3 часа

### Задачи

- [ ] **8.1** Loading / Error / Empty states на всех страницах
- [ ] **8.2** Responsive — sidebar → hamburger на mobile
- [ ] **8.3** Форматтеры — даты, очки, имена пилотов (`lib/formatters.ts`)
- [ ] **8.4** Тесты (минимум 3):
  - Zod schema validation
  - `getNextRace` utility
  - render `StandingsTable`
- [ ] **8.5** README — как запустить, откуда данные, стек

### Результат фазы

MVP готов к использованию и дальнейшему развитию.

---

## Чеклист качества MVP

Перед завершением проверить:

- [ ] `pnpm dev` — приложение запускается без ошибок
- [ ] `pnpm build` — production-сборка проходит
- [ ] `pnpm test` — тесты проходят
- [ ] `pnpm lint` — нет lint-ошибок
- [ ] Все 5 разделов отображают реальные данные из API
- [ ] Loading и error states есть на каждой странице
- [ ] Навигация работает (sidebar, quick links, клик по гонке)
- [ ] Season selector синхронизирован между страницами

---

## Порядок разработки (рекомендуемый)

```
Фаза 0 → Фаза 1 → Фаза 2 → Фаза 3 → Фаза 4 → Фаза 5 → Фаза 6 → Фаза 7 → Фаза 8
 Setup    API     Layout   Calendar  Results  Standings  Home   Dashboard  Polish
```

После **Фазы 3** уже есть первый рабочий раздел. После **Фазы 5** — MVP Core complete.

---

## Команды проекта

```bash
pnpm dev          # dev-сервер
pnpm build        # production-сборка
pnpm preview      # preview production-сборки
pnpm test         # запуск тестов
pnpm test:watch   # тесты в watch-режиме
pnpm lint         # ESLint
```
