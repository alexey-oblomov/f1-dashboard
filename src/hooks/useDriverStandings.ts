import { useQuery } from '@tanstack/react-query'
import { getDriverStandings } from '@/api/endpoints'
import { QUERY_KEYS } from '@/constants'

export function useDriverStandings(season: number, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.driverStandings(season),
    queryFn: () => getDriverStandings(season),
    enabled: enabled && season > 0,
  })
}
