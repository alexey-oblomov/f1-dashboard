import { useQuery } from '@tanstack/react-query'
import { getRaceResults } from '@/api/endpoints'
import { QUERY_KEYS } from '@/constants'

export function useRaceResults(season: number, round: number) {
  return useQuery({
    queryKey: QUERY_KEYS.raceResults(season, round),
    queryFn: () => getRaceResults(season, round),
    enabled: season > 0 && round > 0,
  })
}
