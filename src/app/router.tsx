import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ROUTES } from '@/constants'
import { getBasename } from '@/lib/getBasename'
import { CalendarPage } from '@/pages/CalendarPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RaceResultsPage } from '@/pages/RaceResultsPage'
import { StandingsPage } from '@/pages/StandingsPage'

export function AppRouter() {
  return (
    <BrowserRouter basename={getBasename()}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.calendar} element={<CalendarPage />} />
          <Route path={ROUTES.raceResults} element={<RaceResultsPage />} />
          <Route path={ROUTES.standings} element={<StandingsPage />} />
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
