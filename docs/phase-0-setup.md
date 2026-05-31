# F1 Dashboard — Фаза 0: Подготовка

> Подробный пошаговый план инициализации проекта.
>
> Связанные документы:
> - [project-description.md](./project-description.md) — описание проекта, стек, архитектура
> - [development-plan.md](./development-plan.md) — общий план MVP и все фазы

**Оценка:** 1–2 часа  
**Цель фазы:** проект запускается, CSS Modules работают, базовые UI-компоненты готовы, структура папок создана.

---

## Содержание

1. [Предварительные требования](#1-предварительные-требования)
2. [0.1 — Инициализация проекта Vite](#21--инициализация-проекта-vite)
3. [0.2 — Установка зависимостей](#22--установка-зависимостей)
4. [0.3 — Глобальные стили и CSS Modules](#23--глобальные-стили-и-css-modules)
5. [0.4 — Базовые UI-компоненты](#24--базовые-ui-компоненты)
6. [0.5 — ESLint и Prettier](#25--eslint-и-prettier)
7. [0.6 — Структура папок и точка входа](#26--структура-папок-и-точка-входа)
8. [0.7 — Проверка и приёмка фазы](#27--проверка-и-приёмка-фазы)
9. [Итоговая структура файлов](#итоговая-структура-файлов)
10. [Чеклист задач](#чеклист-задач)

---

## 1. Предварительные требования

Перед началом убедиться, что установлено:

| Инструмент | Минимальная версия | Проверка |
|------------|-------------------|----------|
| Node.js | 20+ | `node -v` |
| pnpm | 9+ | `pnpm -v` |

Если pnpm не установлен:

```bash
npm install -g pnpm
```

**Важно:** проект создаётся в корне репозитория `f1-dashboard/`, где уже лежит папка `docs/`. Шаблон Vite нужно развернуть **в текущей директории**, не создавая вложенную папку.

---

## 2.1 — Инициализация проекта Vite

### Задача

Создать React + TypeScript проект на Vite в корне репозитория.

### Команды

```bash
cd f:\_Projects\_PET\f1-dashboard
pnpm create vite . --template react-ts
pnpm install
```

> Если `create vite` спросит про непустую директорию — подтвердить (в ней только `docs/`).

### Что удалить / почистить после scaffold

Vite создаёт демо-файлы, которые не нужны:

- [ ] Удалить `src/App.css` (стили будут через CSS Modules и global.css)
- [ ] Упростить `src/App.tsx` — временный placeholder (будет заменён на роутинг в Фазе 2)
- [ ] Удалить ассеты демо, если не используются (`src/assets/react.svg`, `public/vite.svg` — опционально)

### Критерий готовности

```bash
pnpm dev
```

Dev-сервер стартует без ошибок, в браузере открывается дефолтная страница Vite.

---

## 2.2 — Установка зависимостей

### Production-зависимости

Устанавливаются сейчас, чтобы не возвращаться к `package.json` на каждой фазе:

```bash
pnpm add react-router-dom @tanstack/react-query zod recharts
```

| Пакет | Назначение | Когда используется |
|-------|------------|-------------------|
| `react-router-dom` | Роутинг SPA | Фаза 2 |
| `@tanstack/react-query` | Кэш и загрузка данных | Фаза 1+ |
| `zod` | Валидация API-ответов | Фаза 1 |
| `recharts` | Графики | Фаза 7 |

### Dev-зависимости

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

| Пакет | Назначение |
|-------|------------|
| `vitest` | Test runner (совместим с Vite) |
| `@testing-library/react` | Render-компоненты в тестах |
| `@testing-library/jest-dom` | DOM-матchers (`toBeInTheDocument` и т.д.) |
| `jsdom` | DOM-окружение для тестов |

### Настройка Vitest

Добавить в `vite.config.ts`:

```typescript
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

Создать `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

Добавить скрипты в `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### Критерий готовности

```bash
pnpm test
```

Vitest запускается (даже если тестов ещё нет — 0 tests, exit 0).

---

## 2.3 — Глобальные стили и CSS Modules

### Задача

Настроить дизайн-токены, reset и базовую типографику. CSS Modules — из коробки в Vite, доп. настройка не нужна.

### Файлы

#### `src/styles/variables.css`

CSS-переменные проекта:

```css
:root {
  /* Colors — F1 dark theme */
  --color-bg-primary: #0a0a0a;
  --color-bg-secondary: #141414;
  --color-bg-elevated: #1e1e1e;
  --color-border: #2a2a2a;
  --color-text-primary: #f5f5f5;
  --color-text-secondary: #a3a3a3;
  --color-text-muted: #737373;
  --color-accent: #e10600;
  --color-accent-hover: #ff1a0d;
  --color-success: #22c55e;
  --color-warning: #eab308;
  --color-error: #ef4444;

  /* Typography */
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;

  /* Layout */
  --sidebar-width: 220px;
  --header-height: 56px;
  --content-max-width: 1200px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
}
```

> Значения — стартовые. Можно уточнить при вёрстке Layout в Фазе 2.

#### `src/styles/global.css`

```css
@import './variables.css';

/* Reset */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: 1.5;
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  min-height: 100vh;
}

a {
  color: var(--color-accent);
  text-decoration: none;
}

a:hover {
  color: var(--color-accent-hover);
}

button {
  font-family: inherit;
  cursor: pointer;
}

img {
  max-width: 100%;
  display: block;
}

/* Utility */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

#### Подключение в `src/main.tsx`

```typescript
import './styles/global.css'
// ... остальной код main.tsx
```

### Соглашения по CSS Modules

| Правило | Пример |
|---------|--------|
| Файл рядом с компонентом | `Button.tsx` + `Button.module.css` |
| Имена классов в CSS — kebab-case | `.primary-button` |
| Обращение в TS — camelCase | `styles.primaryButton` |
| Импорт | `import styles from './Button.module.css'` |
| Не дублировать токены | Цвета/spacing только из `variables.css` через `var(--...)` |

### Критерий готовности

- [ ] `body` имеет тёмный фон и светлый текст
- [ ] Любой `.module.css` файл компилируется без ошибок
- [ ] Классы из module не «утекают» глобально (проверить в DevTools — хешированные имена)

---

## 2.4 — Базовые UI-компоненты

### Задача

Создать минимальную UI-библиотеку в `src/components/ui/`. Каждый компонент — отдельная папка или пара файлов.

### Общие принципы

- Props типизированы через TypeScript interface
- Компоненты — функциональные, без внешних UI-библиотек
- Стили — только CSS Modules + CSS-переменные
- Экспорт через barrel file `src/components/ui/index.ts`

---

### Button

**Файлы:** `Button.tsx`, `Button.module.css`

**Props:**

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}
```

**Поведение:**
- `primary` — акцентный красный фон (`--color-accent`)
- `secondary` — прозрачный с border
- `ghost` — без фона и border, hover-подсветка
- `disabled` и `isLoading` — некликабельный, reduced opacity
- При `isLoading` — текст «Loading...» или spinner (простой CSS)

**Пример использования (для проверки):**

```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary" size="sm">Secondary</Button>
<Button disabled>Disabled</Button>
```

---

### Card

**Файлы:** `Card.tsx`, `Card.module.css`

**Props:**

```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}
```

**Стили:**
- Фон `--color-bg-elevated`
- Border `--color-border`, radius `--radius-md`
- Shadow `--shadow-sm`
- Padding через модификатор

**Опционально (можно добавить позже):** sub-компоненты `CardHeader`, `CardBody` — не обязательны для Фазы 0.

---

### Badge

**Файлы:** `Badge.tsx`, `Badge.module.css`

**Props:**

```typescript
interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'accent'
}
```

**Использование:** статусы гонок (`completed`, `upcoming`), позиции, теги.

**Стили:** inline-flex, маленький padding, uppercase или small caps, цвет фона зависит от variant.

---

### Skeleton

**Файлы:** `Skeleton.tsx`, `Skeleton.module.css`

**Props:**

```typescript
interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string
  className?: string
}
```

**Стили:**
- Фон `--color-bg-secondary`
- CSS animation pulse (keyframes)
- Default: `width: 100%`, `height: 1rem`

**Использование:** placeholder при загрузке данных (Фаза 3+).

---

### Barrel export — `src/components/ui/index.ts`

```typescript
export { Button } from './Button'
export { Card } from './Card'
export { Badge } from './Badge'
export { Skeleton } from './Skeleton'
```

### Страница-песочница (временная)

Для проверки компонентов до Layout — временно обновить `App.tsx`:

```tsx
import { Button, Card, Badge, Skeleton } from './components/ui'

function App() {
  return (
    <main style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h1>F1 Dashboard — UI Kit</h1>
      <Card padding="md">
        <Badge variant="accent">Upcoming</Badge>
        <p style={{ marginTop: '1rem' }}>Card content</p>
        <Skeleton height={20} />
      </Card>
      <Button variant="primary">Primary Button</Button>
    </main>
  )
}

export default App
```

> Эту страницу заменим на Layout + Router в Фазе 2.

### Критерий готовности

- [ ] Все 4 компонента рендерятся без ошибок
- [ ] Варианты Button и Badge визуально различимы
- [ ] Skeleton анимируется
- [ ] Импорт `{ Button, Card, Badge, Skeleton } from '@/components/ui'` работает (если настроен alias) или через относительный путь

---

## 2.5 — ESLint и Prettier

### ESLint

Vite scaffold уже включает ESLint. Проверить и дополнить:

```bash
pnpm add -D prettier eslint-config-prettier eslint-plugin-prettier
```

#### `.prettierrc`

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

#### `.prettierignore`

```
dist
node_modules
pnpm-lock.yaml
```

#### Обновить ESLint config

Добавить `eslint-config-prettier` в extends, чтобы ESLint и Prettier не конфликтовали.

Пример для flat config (`eslint.config.js`):

```javascript
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  // ... существующие правила Vite
  eslintConfigPrettier,
]
```

### Скрипты в `package.json`

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,json}\""
  }
}
```

### TypeScript — path alias (рекомендуется)

В `tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

В `vite.config.ts`:

```typescript
import path from 'path'

export default defineConfig({
  // ...
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

> Потребуется `@types/node` для `path`: `pnpm add -D @types/node`

### Критерий готовности

```bash
pnpm lint      # 0 errors
pnpm format    # файлы форматируются без ошибок
pnpm build     # сборка проходит
```

---

## 2.6 — Структура папок и точка входа

### Задача

Создать скелет архитектуры из [project-description.md](./project-description.md). Папки и placeholder-файлы — чтобы следующие фазы не занимались организацией структуры.

### Дерево папок

```
src/
├── app/
│   ├── router.tsx          # placeholder — реализация в Фазе 2
│   └── providers.tsx       # placeholder — QueryClientProvider в Фазе 2
├── pages/
│   ├── HomePage.tsx
│   ├── CalendarPage.tsx
│   ├── RaceResultsPage.tsx
│   ├── StandingsPage.tsx
│   └── DashboardPage.tsx
├── features/
│   ├── calendar/
│   │   └── .gitkeep
│   ├── race-results/
│   │   └── .gitkeep
│   ├── standings/
│   │   └── .gitkeep
│   └── dashboard/
│       └── .gitkeep
├── components/
│   ├── ui/                   # Button, Card, Badge, Skeleton (Фаза 0)
│   └── layout/
│       ├── Header.tsx        # placeholder
│       ├── Sidebar.tsx       # placeholder
│       └── AppLayout.tsx     # placeholder
├── styles/
│   ├── variables.css         # Фаза 0
│   └── global.css            # Фаза 0
├── api/
│   ├── client.ts             # placeholder — Фаза 1
│   ├── endpoints/
│   │   └── .gitkeep
│   └── schemas/
│       └── .gitkeep
├── hooks/
│   └── .gitkeep
├── lib/
│   ├── utils.ts              # placeholder
│   └── formatters.ts         # placeholder
├── types/
│   └── index.ts              # placeholder — доменные типы в Фазе 1
├── stores/
│   └── .gitkeep              # Zustand — если понадобится
└── test/
    └── setup.ts              # Фаза 0
```

### Placeholder-страницы

Каждая страница — минимальный компонент для проверки роутинга в Фазе 2:

```tsx
// src/pages/HomePage.tsx
export function HomePage() {
  return <h1>Home</h1>
}
```

Аналогично для `CalendarPage`, `RaceResultsPage`, `StandingsPage`, `DashboardPage`.

### Placeholder `lib/utils.ts`

```typescript
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
```

> Простой helper для склеивания className. При необходимости расширить позже.

### `.gitkeep` vs пустые файлы

- Пустые папки Git не отслеживает — использовать `.gitkeep` или placeholder `.ts` файлы
- Не создавать лишних index-файлов там, где их ещё нет в плане

### Критерий готовности

- [ ] Все папки из дерева существуют
- [ ] `src/components/ui/` содержит 4 рабочих компонента
- [ ] Placeholder-страницы экспортируются
- [ ] Проект собирается: `pnpm build`

---

## 2.7 — Проверка и приёмка фазы

### Smoke-тесты

Выполнить все команды по порядку:

```bash
pnpm install       # без ошибок
pnpm dev           # dev-сервер, UI Kit виден в браузере
pnpm build         # dist/ создаётся
pnpm preview       # production preview работает
pnpm lint          # 0 errors
pnpm test          # 0 tests passed (или 1 placeholder test)
```

### Опциональный placeholder-тест

Минимальный тест, чтобы убедиться что Vitest настроен:

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('filters falsy values', () => {
    expect(cn('a', undefined, false, 'b')).toBe('a b')
  })
})
```

### Definition of Done — Фаза 0

| # | Критерий | Статус |
|---|----------|--------|
| 1 | Vite + React + TS проект в корне репозитория | ☐ |
| 2 | Все зависимости установлены (prod + dev) | ☐ |
| 3 | Vitest настроен, `pnpm test` работает | ☐ |
| 4 | `variables.css` + `global.css` подключены, тёмная тема | ☐ |
| 5 | UI: Button, Card, Badge, Skeleton — рабочие | ☐ |
| 6 | ESLint + Prettier настроены, `pnpm lint` чистый | ☐ |
| 7 | Path alias `@/` работает | ☐ |
| 8 | Структура папок создана (app, pages, features, api, …) | ☐ |
| 9 | Placeholder-страницы и layout-заглушки на месте | ☐ |
| 10 | `pnpm build` проходит без ошибок | ☐ |

---

## Итоговая структура файлов

После завершения Фазы 0 репозиторий должен выглядеть так:

```
f1-dashboard/
├── docs/
│   ├── project-description.md
│   ├── development-plan.md
│   └── phase-0-setup.md          ← этот файл
├── public/
├── src/
│   ├── app/
│   ├── pages/
│   ├── features/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   ├── Button.module.css
│   │   │   ├── Card.tsx
│   │   │   ├── Card.module.css
│   │   │   ├── Badge.tsx
│   │   │   ├── Badge.module.css
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Skeleton.module.css
│   │   │   └── index.ts
│   │   └── layout/
│   ├── styles/
│   ├── api/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── stores/
│   ├── test/
│   ├── App.tsx
│   └── main.tsx
├── .prettierrc
├── .prettierignore
├── eslint.config.js
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Чеклист задач

Копировать и отмечать по ходу работы:

### 0.1 — Инициализация
- [ ] `pnpm create vite . --template react-ts`
- [ ] `pnpm install`
- [ ] Удалить лишние demo-файлы
- [ ] `pnpm dev` работает

### 0.2 — Зависимости
- [ ] Production: react-router-dom, @tanstack/react-query, zod, recharts
- [ ] Dev: vitest, @testing-library/react, @testing-library/jest-dom, jsdom
- [ ] Vitest config в vite.config.ts
- [ ] src/test/setup.ts
- [ ] Скрипты test / test:watch

### 0.3 — Стили
- [ ] src/styles/variables.css
- [ ] src/styles/global.css
- [ ] Импорт global.css в main.tsx

### 0.4 — UI-компоненты
- [ ] Button (+ variants, sizes)
- [ ] Card
- [ ] Badge
- [ ] Skeleton (+ pulse animation)
- [ ] components/ui/index.ts
- [ ] Временная UI-песочница в App.tsx

### 0.5 — Lint / Format
- [ ] Prettier + eslint-config-prettier
- [ ] .prettierrc, .prettierignore
- [ ] Скрипты lint, lint:fix, format
- [ ] Path alias @/ (tsconfig + vite.config)
- [ ] @types/node

### 0.6 — Структура
- [ ] Папки app/, pages/, features/, api/, hooks/, lib/, types/, stores/
- [ ] Placeholder pages (5 шт.)
- [ ] Placeholder layout (Header, Sidebar, AppLayout)
- [ ] lib/utils.ts + опциональный тест

### 0.7 — Приёмка
- [ ] pnpm dev ✓
- [ ] pnpm build ✓
- [ ] pnpm lint ✓
- [ ] pnpm test ✓
- [ ] Чеклист Definition of Done — все пункты

---

## Что дальше

После завершения Фазы 0 переходить к **[Фаза 1 — API-слой](./development-plan.md#фаза-1--api-слой)**:

- HTTP-клиент `api/client.ts`
- Zod-схемы и мапперы
- Эндпоинты: races, results, standings
- Первый unit-тест на валидацию

---

## Заметки и решения

| Вопрос | Решение |
|--------|---------|
| Tailwind / shadcn? | Нет — CSS Modules, свои компоненты |
| Zustand в Фазе 0? | Нет — установим при необходимости (Фаза 2+) |
| Шрифт Inter | Подключить через Google Fonts в `index.html` или `@font-face` — на усмотрение при вёрстке |
| Favicon | Заменить vite.svg на F1-themed позже (Фаза 8) |
| README | Полный README — в Фазе 8; в Фазе 0 достаточно дефолтного от Vite |
