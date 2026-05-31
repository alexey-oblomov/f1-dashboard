export const BREAKPOINTS = {
  md: 768,
} as const

export const MEDIA_QUERIES = {
  mdDown: `(max-width: ${BREAKPOINTS.md}px)`,
  mdUp: `(min-width: ${BREAKPOINTS.md + 1}px)`,
} as const
