import { apiGet } from '@/api/client'
import { mapConstructorStandings } from '@/api/mappers'
import { ConstructorStandingsResponseSchema } from '@/api/schemas'
import { API_PATHS } from '@/constants'
import type { ConstructorStanding } from '@/types'

export async function getConstructorStandings(season: number): Promise<ConstructorStanding[]> {
  const raw = await apiGet(API_PATHS.constructorStandings(season))
  const validated = ConstructorStandingsResponseSchema.parse(raw)
  return mapConstructorStandings(validated)
}
