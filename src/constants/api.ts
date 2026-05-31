export const API_BASE_URL = 'https://api.jolpi.ca/ergast/f1'

export const API_PATHS = {
  races: (season: number) => `/${season}/races.json`,
  results: (season: number, round: number) => `/${season}/${round}/results.json`,
  driverStandings: (season: number) => `/${season}/driverStandings.json`,
  constructorStandings: (season: number) => `/${season}/constructorStandings.json`,
} as const
