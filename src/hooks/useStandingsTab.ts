import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SEARCH_PARAMS, type StandingsTab } from '@/constants'
import { resolveStandingsTab } from '@/lib/standingsTab'

export function useStandingsTab() {
  const [searchParams, setSearchParams] = useSearchParams()

  const tab = resolveStandingsTab(searchParams.get(SEARCH_PARAMS.tab))

  const setTab = useCallback(
    (next: StandingsTab) => {
      setSearchParams(
        (prev) => {
          prev.set(SEARCH_PARAMS.tab, next)
          return prev
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return { tab, setTab }
}
