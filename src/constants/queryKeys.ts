export const QUERY_KEYS = {
  races: (season: number) => ['races', season] as const,
  raceResults: (season: number, round: number) => ['raceResults', season, round] as const,
  driverStandings: (season: number) => ['driverStandings', season] as const,
  constructorStandings: (season: number) => ['constructorStandings', season] as const,
} as const
