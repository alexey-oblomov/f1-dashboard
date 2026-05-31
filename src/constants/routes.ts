export const ROUTES = {
  home: '/',
  calendar: '/calendar',
  raceResults: '/races/:season/:round',
  standings: '/standings',
  dashboard: '/dashboard',
} as const

export const routePaths = {
  home: () => ROUTES.home,
  calendar: () => ROUTES.calendar,
  raceResults: (season: number, round: number) => `/races/${season}/${round}`,
  standings: () => ROUTES.standings,
  dashboard: () => ROUTES.dashboard,
} as const
