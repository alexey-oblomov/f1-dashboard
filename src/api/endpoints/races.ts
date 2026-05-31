import { apiGet } from '@/api/client'
import { mapRaces } from '@/api/mappers'
import { RacesResponseSchema } from '@/api/schemas'
import { API_PATHS } from '@/constants'
import type { Race } from '@/types'

export async function getRaces(season: number): Promise<Race[]> {
  const raw = await apiGet(API_PATHS.races(season))
  const validated = RacesResponseSchema.parse(raw)
  return mapRaces(validated)
}
