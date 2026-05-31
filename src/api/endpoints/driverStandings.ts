import { apiGet } from '@/api/client'
import { mapDriverStandings } from '@/api/mappers'
import { DriverStandingsResponseSchema } from '@/api/schemas'
import { API_PATHS } from '@/constants'
import type { DriverStanding } from '@/types'

export async function getDriverStandings(season: number): Promise<DriverStanding[]> {
  const raw = await apiGet(API_PATHS.driverStandings(season))
  const validated = DriverStandingsResponseSchema.parse(raw)
  return mapDriverStandings(validated)
}
