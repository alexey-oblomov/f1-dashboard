import { z } from 'zod'
import { CircuitSchema, numericString } from './common'

const ApiRaceSchema = z.object({
  season: numericString,
  round: numericString,
  raceName: z.string(),
  date: z.string(),
  time: z.string().optional(),
  Circuit: CircuitSchema,
})

export const RacesResponseSchema = z.object({
  MRData: z.object({
    RaceTable: z.object({
      season: numericString,
      Races: z.array(ApiRaceSchema),
    }),
  }),
})

export type RacesResponse = z.infer<typeof RacesResponseSchema>
