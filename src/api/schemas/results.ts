import { z } from 'zod'
import { CircuitSchema, ConstructorSchema, DriverSchema, numericString } from './common'

const ApiResultSchema = z.object({
  position: numericString,
  points: numericString,
  status: z.string(),
  Driver: DriverSchema,
  Constructor: ConstructorSchema,
})

const ApiRaceWithResultsSchema = z.object({
  season: numericString,
  round: numericString,
  raceName: z.string(),
  date: z.string(),
  Circuit: CircuitSchema,
  Results: z.array(ApiResultSchema),
})

export const ResultsResponseSchema = z.object({
  MRData: z.object({
    RaceTable: z.object({
      Races: z.array(ApiRaceWithResultsSchema).min(1),
    }),
  }),
})

export type ResultsResponse = z.infer<typeof ResultsResponseSchema>
