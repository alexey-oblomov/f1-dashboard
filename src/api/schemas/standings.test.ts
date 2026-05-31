import { describe, it, expect } from 'vitest'
import { ResultsResponseSchema } from './results'
import { DriverStandingsResponseSchema } from './driverStandings'
import { ConstructorStandingsResponseSchema } from './constructorStandings'
import resultsFixture from '@/test/fixtures/results-2024-1.json'
import driverStandingsFixture from '@/test/fixtures/driverStandings-2024.json'
import constructorStandingsFixture from '@/test/fixtures/constructorStandings-2024.json'

describe('ResultsResponseSchema', () => {
  it('parses valid results response', () => {
    const result = ResultsResponseSchema.parse(resultsFixture)
    expect(result.MRData.RaceTable.Races[0].Results).toHaveLength(2)
  })
})

describe('DriverStandingsResponseSchema', () => {
  it('parses valid driver standings response', () => {
    const result = DriverStandingsResponseSchema.parse(driverStandingsFixture)
    expect(result.MRData.StandingsTable.StandingsLists[0].DriverStandings).toHaveLength(1)
  })
})

describe('ConstructorStandingsResponseSchema', () => {
  it('parses valid constructor standings response', () => {
    const result = ConstructorStandingsResponseSchema.parse(constructorStandingsFixture)
    expect(result.MRData.StandingsTable.StandingsLists[0].ConstructorStandings).toHaveLength(1)
  })
})
