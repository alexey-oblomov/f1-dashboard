import { LABELS } from './labels'
import { ROUTES } from './routes'

export const NAV_ITEMS = [
  { label: LABELS.pageHome, path: ROUTES.home },
  { label: LABELS.pageCalendar, path: ROUTES.calendar },
  { label: LABELS.pageStandings, path: ROUTES.standings },
  { label: LABELS.pageDashboard, path: ROUTES.dashboard },
] as const
