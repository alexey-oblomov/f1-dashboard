# F1 Dashboard

Pet-project SPA for Formula 1 season data — calendar, race results, standings, and analytics dashboard.

## Stack

- Vite, React 19, TypeScript
- React Router, TanStack Query
- Zod, CSS Modules, Recharts
- Vitest, ESLint, Prettier, pnpm

## Data source

[Jolpica F1 API](https://api.jolpi.ca/ergast/f1/) — free Ergast-compatible REST API.

Endpoints used:

- `/{season}/races.json` — race calendar
- `/{season}/{round}/results.json` — race results
- `/{season}/driverStandings.json` — driver championship
- `/{season}/constructorStandings.json` — constructor championship

## Getting started

### Prerequisites

- Node.js 20+
- pnpm

### Install and run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

## Live demo

After enabling GitHub Pages (Settings → Pages → Source: **GitHub Actions**), the app is published at:

**https://alexey-oblomov.github.io/f1-dashboard/**

Deploy runs automatically on push to `main` via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

Local preview of the GitHub Pages build:

```bash
pnpm preview:gh-pages
```

Open [http://localhost:4173/f1-dashboard/](http://localhost:4173/f1-dashboard/)

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm build:gh-pages` | Production build for GitHub Pages |
| `pnpm preview` | Preview production build |
| `pnpm preview:gh-pages` | Build and preview GitHub Pages output |
| `pnpm test` | Run tests |
| `pnpm test:watch` | Tests in watch mode |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier format |

## Project structure

```
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
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Home — season overview, next race, latest results |
| `/calendar` | Race calendar |
| `/races/:season/:round` | Race results |
| `/standings` | Driver and constructor standings |
| `/dashboard` | Summary cards and points charts |

Season filter: `?season=2024` (synced via Header across all pages).

## Docs

See [`docs/`](docs/) for development phases, architecture, and implementation plans.

## License

Private pet project.
