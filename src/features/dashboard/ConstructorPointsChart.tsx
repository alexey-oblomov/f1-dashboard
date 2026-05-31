import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/components/ui'
import { CHART_CONFIG, LABELS } from '@/constants'
import type { ChartDataPoint } from '@/lib/chartData'
import { formatPoints } from '@/lib/formatters'
import styles from './PointsChart.module.css'

interface ConstructorPointsChartProps {
  data: ChartDataPoint[]
  isLoading?: boolean
}

export function ConstructorPointsChart({ data, isLoading }: ConstructorPointsChartProps) {
  return (
    <Card padding="md" className={styles.chartCard}>
      <h2 className={styles.title}>{LABELS.chartConstructorPointsTitle}</h2>

      {isLoading && <div className={styles.placeholder}>…</div>}

      {!isLoading && data.length === 0 && (
        <p className={styles.empty}>{LABELS.chartNoData}</p>
      )}

      {!isLoading && data.length > 0 && (
        <ResponsiveContainer width="100%" height={CHART_CONFIG.height}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
            <CartesianGrid stroke={CHART_CONFIG.gridColor} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: CHART_CONFIG.axisColor, fontSize: 12 }}
              angle={-35}
              textAnchor="end"
              interval={0}
              height={60}
            />
            <YAxis
              tick={{ fill: CHART_CONFIG.axisColor, fontSize: 12 }}
              label={{
                value: LABELS.chartAxisPoints,
                angle: -90,
                position: 'insideLeft',
                fill: CHART_CONFIG.axisColor,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: CHART_CONFIG.tooltipBg,
                border: `1px solid ${CHART_CONFIG.gridColor}`,
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'var(--color-text-primary)' }}
              formatter={(value) => [formatPoints(Number(value)), LABELS.chartAxisPoints]}
            />
            <Bar dataKey="points" fill={CHART_CONFIG.barColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
