import { describe, it, expect } from 'vitest'
import { RacesResponseSchema } from './races'
import racesFixture from '@/test/fixtures/races-2024.json'

describe('RacesResponseSchema', () => {
  it('parses valid races response', () => {
    const result = RacesResponseSchema.parse(racesFixture)
    expect(result.MRData.RaceTable.Races).toHaveLength(1)
  })
})
