import { DEFAULT_STANDINGS_TAB, STANDINGS_TAB, type StandingsTab } from '@/constants'

export function resolveStandingsTab(param: string | null): StandingsTab {
  const values = Object.values(STANDINGS_TAB)
  if (param && values.includes(param as StandingsTab)) {
    return param as StandingsTab
  }
  return DEFAULT_STANDINGS_TAB
}
