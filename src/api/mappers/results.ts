import { formatDriverName } from '@/api/schemas/common'
import type { ResultsResponse } from '@/api/schemas'
import type { RaceResultsData } from '@/types'

export function mapRaceResults(response: ResultsResponse): RaceResultsData {
  const race = response.MRData.RaceTable.Races[0]

  return {
    season: Number(race.season),
    round: Number(race.round),
    raceName: race.raceName,
    date: race.date,
    results: race.Results.map((result) => ({
      position: Number(result.position),
      driverName: formatDriverName(result.Driver),
      constructor: result.Constructor.name,
      points: Number(result.points),
      status: result.status,
    })),
  }
}
