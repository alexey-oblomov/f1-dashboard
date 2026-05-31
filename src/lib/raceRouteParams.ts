export interface RaceRouteParams {
  season: number
  round: number
}

export function parseRaceRouteParams(
  seasonParam: string | undefined,
  roundParam: string | undefined,
): RaceRouteParams | null {
  if (!seasonParam || !roundParam) return null

  const season = Number(seasonParam)
  const round = Number(roundParam)

  if (!Number.isInteger(season) || season < 1950) return null
  if (!Number.isInteger(round) || round < 1) return null

  return { season, round }
}
