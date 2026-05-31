import { useQuery } from '@tanstack/react-query'
import { getConstructorStandings } from '@/api/endpoints'
import { QUERY_KEYS } from '@/constants'

export function useConstructorStandings(season: number, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.constructorStandings(season),
    queryFn: () => getConstructorStandings(season),
    enabled: enabled && season > 0,
  })
}
