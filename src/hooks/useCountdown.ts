import { useEffect, useState } from 'react'
import { getCountdownParts, getRaceDateTime } from '@/lib/countdown'

export function useCountdown(date: string, time?: string) {
  const [parts, setParts] = useState(() =>
    getCountdownParts(getRaceDateTime(date, time)),
  )

  useEffect(() => {
    const target = getRaceDateTime(date, time)
    const tick = () => setParts(getCountdownParts(target))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [date, time])

  return parts
}
