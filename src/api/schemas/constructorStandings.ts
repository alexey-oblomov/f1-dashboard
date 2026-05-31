import { z } from 'zod'
import { numericString } from './common'

const ApiConstructorStandingSchema = z.object({
  position: numericString,
  points: numericString,
  wins: numericString,
  Constructor: z.object({
    name: z.string(),
  }),
})

export const ConstructorStandingsResponseSchema = z.object({
  MRData: z.object({
    StandingsTable: z.object({
      StandingsLists: z
        .array(
          z.object({
            ConstructorStandings: z.array(ApiConstructorStandingSchema),
          }),
        )
        .min(1),
    }),
  }),
})

export type ConstructorStandingsResponse = z.infer<typeof ConstructorStandingsResponseSchema>
