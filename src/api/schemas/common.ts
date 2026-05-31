import { z } from 'zod'

export const numericString = z.string().regex(/^\d+$/)

export const DriverSchema = z.object({
  givenName: z.string(),
  familyName: z.string(),
})

export const ConstructorSchema = z.object({
  name: z.string(),
})

export const LocationSchema = z.object({
  country: z.string(),
  locality: z.string().optional(),
})

export const CircuitSchema = z.object({
  circuitName: z.string(),
  Location: LocationSchema,
})

export function formatDriverName(driver: z.infer<typeof DriverSchema>): string {
  return `${driver.givenName} ${driver.familyName}`
}
