export const AVAILABLE_SEASONS = [2024, 2025, 2026] as const

export type Season = (typeof AVAILABLE_SEASONS)[number]

export const DEFAULT_SEASON = 2026 satisfies Season
