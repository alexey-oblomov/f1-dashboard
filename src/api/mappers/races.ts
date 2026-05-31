import type { RacesResponse } from '@/api/schemas'
import { getRaceStatus } from '@/lib/raceStatus'
import type { Race } from '@/types'

export function mapRaces(response: RacesResponse): Race[] {
  return response.MRData.RaceTable.Races.map((race) => ({
    season: Number(race.season),
    round: Number(race.round),
    name: race.raceName,
    country: race.Circuit.Location.country,
    circuit: race.Circuit.circuitName,
    date: race.date,
    time: race.time,
    status: getRaceStatus(race.date),
  }))
}
