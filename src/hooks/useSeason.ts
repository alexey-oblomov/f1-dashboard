import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AVAILABLE_SEASONS, SEARCH_PARAMS, type Season } from '@/constants'
import { resolveSeason } from '@/lib/season'

export function useSeason() {
  const [searchParams, setSearchParams] = useSearchParams()

  const season = resolveSeason(searchParams.get(SEARCH_PARAMS.season))

  const setSeason = useCallback(
    (next: Season) => {
      setSearchParams(
        (prev) => {
          prev.set(SEARCH_PARAMS.season, String(next))
          return prev
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return { season, setSeason, availableSeasons: AVAILABLE_SEASONS }
}
