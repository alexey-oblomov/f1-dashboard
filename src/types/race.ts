import type { RaceStatus } from '@/constants'

export interface Race {
  season: number
  round: number
  name: string
  country: string
  circuit: string
  date: string
  time?: string
  status: RaceStatus
}
