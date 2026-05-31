import { useQuery } from '@tanstack/react-query'
import { getRaces } from '@/api/endpoints'
import { QUERY_KEYS } from '@/constants'

export function useRaces(season: number) {
  return useQuery({
    queryKey: QUERY_KEYS.races(season),
    queryFn: () => getRaces(season),
  })
}
