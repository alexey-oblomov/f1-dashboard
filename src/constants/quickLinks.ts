import { LABELS } from './labels'
import { ROUTES } from './routes'

export const QUICK_LINKS = [
  {
    id: 'calendar',
    label: LABELS.pageCalendar,
    description: LABELS.quickLinkCalendarDescription,
    path: ROUTES.calendar,
  },
  {
    id: 'standings',
    label: LABELS.pageStandings,
    description: LABELS.quickLinkStandingsDescription,
    path: ROUTES.standings,
  },
  {
    id: 'dashboard',
    label: LABELS.pageDashboard,
    description: LABELS.quickLinkDashboardDescription,
    path: ROUTES.dashboard,
  },
] as const

export type QuickLinkId = (typeof QUICK_LINKS)[number]['id']
