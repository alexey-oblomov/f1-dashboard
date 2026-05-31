import { AVAILABLE_SEASONS, DEFAULT_SEASON, type Season } from '@/constants/seasons'

export function parseSeason(value: string | null): Season | null {
  if (!value) return null
  const num = Number(value)
  return AVAILABLE_SEASONS.includes(num as Season) ? (num as Season) : null
}

export function resolveSeason(value: string | null): Season {
  return parseSeason(value) ?? DEFAULT_SEASON
}
