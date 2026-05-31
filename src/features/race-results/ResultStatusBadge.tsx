import { Badge } from '@/components/ui'
import { formatResultStatus, getResultStatusVariant } from '@/lib/resultStatus'

interface ResultStatusBadgeProps {
  status: string
}

export function ResultStatusBadge({ status }: ResultStatusBadgeProps) {
  return (
    <Badge variant={getResultStatusVariant(status)}>{formatResultStatus(status)}</Badge>
  )
}
