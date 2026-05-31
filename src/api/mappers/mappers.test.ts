import { describe, it, expect } from 'vitest'
import {
  ConstructorStandingsResponseSchema,
  DriverStandingsResponseSchema,
  RacesResponseSchema,
  ResultsResponseSchema,
} from '@/api/schemas'
import { mapRaces } from './races'
import { mapRaceResults } from './results'
import { mapDriverStandings, mapConstructorStandings } from './standings'
import { RACE_STATUS, RESULT_STATUS } from '@/constants'
import racesFixture from '@/test/fixtures/races-2024.json'
import resultsFixture from '@/test/fixtures/results-2024-1.json'
import driverStandingsFixture from '@/test/fixtures/driverStandings-2024.json'
import constructorStandingsFixture from '@/test/fixtures/constructorStandings-2024.json'

describe('mapRaces', () => {
  it('maps API race to domain Race', () => {
    const parsed = RacesResponseSchema.parse(racesFixture)
    const races = mapRaces(parsed)

    expect(races[0]).toMatchObject({
      season: 2024,
      round: 1,
      name: 'Bahrain Grand Prix',
      country: 'Bahrain',
      circuit: 'Bahrain International Circuit',
      status: RACE_STATUS.completed,
    })
  })
})

describe('mapRaceResults', () => {
  it('maps API results to domain RaceResultsData', () => {
    const parsed = ResultsResponseSchema.parse(resultsFixture)
    const data = mapRaceResults(parsed)

    expect(data.raceName).toBe('Bahrain Grand Prix')
    expect(data.results[0]).toMatchObject({
      position: 1,
      driverName: 'Max Verstappen',
      constructor: 'Red Bull',
      points: 25,
      status: RESULT_STATUS.finished,
    })
  })
})

describe('mapDriverStandings', () => {
  it('maps API driver standings to domain type', () => {
    const parsed = DriverStandingsResponseSchema.parse(driverStandingsFixture)
    const standings = mapDriverStandings(parsed)

    expect(standings[0]).toMatchObject({
      position: 1,
      driverName: 'Max Verstappen',
      constructor: 'Red Bull',
      points: 437,
      wins: 9,
    })
  })
})

describe('mapConstructorStandings', () => {
  it('maps API constructor standings to domain type', () => {
    const parsed = ConstructorStandingsResponseSchema.parse(constructorStandingsFixture)
    const standings = mapConstructorStandings(parsed)

    expect(standings[0]).toMatchObject({
      position: 1,
      name: 'McLaren',
      points: 666,
      wins: 14,
    })
  })
})
