import { CHART_CONFIG } from '@/constants'
import type { ConstructorStanding, DriverStanding } from '@/types'

export interface ChartDataPoint {
  name: string
  points: number
  fullName: string
}

export function mapDriverChartData(
  standings: DriverStanding[],
  topN = CHART_CONFIG.topN,
): ChartDataPoint[] {
  return standings.slice(0, topN).map((standing) => ({
    name: standing.driverName,
    points: standing.points,
    fullName: standing.driverName,
  }))
}

export function mapConstructorChartData(
  standings: ConstructorStanding[],
  topN = CHART_CONFIG.topN,
): ChartDataPoint[] {
  return standings.slice(0, topN).map((standing) => ({
    name: standing.name,
    points: standing.points,
    fullName: standing.name,
  }))
}
