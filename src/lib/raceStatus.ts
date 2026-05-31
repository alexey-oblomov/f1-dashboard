import { RACE_STATUS, type RaceStatus } from '@/constants'

export function getRaceStatus(date: string): RaceStatus {
  const raceDate = new Date(`${date}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return raceDate < today ? RACE_STATUS.completed : RACE_STATUS.upcoming
}
