import { apiGet } from '@/api/client'
import { mapRaceResults } from '@/api/mappers'
import { ResultsResponseSchema } from '@/api/schemas'
import { API_PATHS } from '@/constants'
import type { RaceResultsData } from '@/types'

export async function getRaceResults(season: number, round: number): Promise<RaceResultsData> {
  const raw = await apiGet(API_PATHS.results(season, round))
  const validated = ResultsResponseSchema.parse(raw)
  return mapRaceResults(validated)
}
