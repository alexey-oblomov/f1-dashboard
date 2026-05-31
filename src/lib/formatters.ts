import { LABELS } from '@/constants'
import type { CountdownParts } from './countdown'

export function formatRaceDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatCountdown(parts: CountdownParts): string {
  if (parts.isPast) return LABELS.countdownPast
  if (parts.isSoon) return LABELS.countdownSoon

  return LABELS.countdownFormat
    .replace('{days}', String(parts.days))
    .replace('{hours}', String(parts.hours))
    .replace('{minutes}', String(parts.minutes))
}
