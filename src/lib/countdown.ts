export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
  isSoon: boolean
}

export function getRaceDateTime(date: string, time?: string): Date {
  if (time) {
    return new Date(`${date}T${time}`)
  }
  return new Date(`${date}T00:00:00`)
}

export function getCountdownParts(target: Date, now = new Date()): CountdownParts {
  const diffMs = target.getTime() - now.getTime()
  const isPast = diffMs <= 0
  const isSoon = !isPast && diffMs < 60 * 60 * 1000

  if (isPast) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, isSoon: false }
  }

  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, isPast: false, isSoon }
}
