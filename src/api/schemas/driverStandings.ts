import { z } from 'zod'
import { ConstructorSchema, DriverSchema, numericString } from './common'

const ApiDriverStandingSchema = z.object({
  position: numericString,
  points: numericString,
  wins: numericString,
  Driver: DriverSchema,
  Constructors: z.array(ConstructorSchema).min(1),
})

export const DriverStandingsResponseSchema = z.object({
  MRData: z.object({
    StandingsTable: z.object({
      season: numericString,
      StandingsLists: z
        .array(
          z.object({
            DriverStandings: z.array(ApiDriverStandingSchema),
          }),
        )
        .min(1),
    }),
  }),
})

export type DriverStandingsResponse = z.infer<typeof DriverStandingsResponseSchema>
