import { Badge } from '@/components/ui'
import { BADGE_LABELS, RACE_STATUS, type RaceStatus } from '@/constants'

const VARIANT_MAP = {
  [RACE_STATUS.completed]: 'success',
  [RACE_STATUS.upcoming]: 'accent',
} as const satisfies Record<RaceStatus, 'success' | 'accent'>

interface RaceStatusBadgeProps {
  status: RaceStatus
}

export function RaceStatusBadge({ status }: RaceStatusBadgeProps) {
  return <Badge variant={VARIANT_MAP[status]}>{BADGE_LABELS[status]}</Badge>
}
