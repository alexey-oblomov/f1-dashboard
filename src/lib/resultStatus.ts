import { RESULT_STATUS } from '@/constants'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'accent'

export function formatResultStatus(status: string): string {
  return status
}

export function getResultStatusVariant(status: string): BadgeVariant {
  if (status === RESULT_STATUS.finished) return 'success'
  if (status === RESULT_STATUS.retired || status === RESULT_STATUS.disqualified) return 'error'
  if (
    status === RESULT_STATUS.lapped ||
    status === RESULT_STATUS.plusLap ||
    status.startsWith('+')
  ) {
    return 'warning'
  }
  return 'default'
}
