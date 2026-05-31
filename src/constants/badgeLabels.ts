import { RACE_STATUS } from './raceStatus'

export const BADGE_LABELS = {
  [RACE_STATUS.completed]: 'Completed',
  [RACE_STATUS.upcoming]: 'Upcoming',
} as const
