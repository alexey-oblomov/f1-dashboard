export const RACE_STATUS = {
  completed: 'completed',
  upcoming: 'upcoming',
} as const

export type RaceStatus = (typeof RACE_STATUS)[keyof typeof RACE_STATUS]
