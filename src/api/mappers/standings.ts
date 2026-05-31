import { formatDriverName } from '@/api/schemas/common'
import type { ConstructorStandingsResponse, DriverStandingsResponse } from '@/api/schemas'
import type { ConstructorStanding, DriverStanding } from '@/types'

export function mapDriverStandings(response: DriverStandingsResponse): DriverStanding[] {
  const list = response.MRData.StandingsTable.StandingsLists.at(-1)

  if (!list) {
    return []
  }

  return list.DriverStandings.map((standing) => ({
    position: Number(standing.position),
    driverName: formatDriverName(standing.Driver),
    constructor: standing.Constructors[0].name,
    points: Number(standing.points),
    wins: Number(standing.wins),
  }))
}

export function mapConstructorStandings(
  response: ConstructorStandingsResponse,
): ConstructorStanding[] {
  const list = response.MRData.StandingsTable.StandingsLists.at(-1)

  if (!list) {
    return []
  }

  return list.ConstructorStandings.map((standing) => ({
    position: Number(standing.position),
    name: standing.Constructor.name,
    points: Number(standing.points),
    wins: Number(standing.wins),
  }))
}
