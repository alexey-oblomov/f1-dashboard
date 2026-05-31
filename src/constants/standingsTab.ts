export const STANDINGS_TAB = {
  drivers: 'drivers',
  constructors: 'constructors',
} as const

export type StandingsTab = (typeof STANDINGS_TAB)[keyof typeof STANDINGS_TAB]

export const DEFAULT_STANDINGS_TAB = STANDINGS_TAB.drivers satisfies StandingsTab
