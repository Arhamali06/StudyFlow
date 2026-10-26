import { useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Badge from '../ui/Badge'
import type { DayCompletion } from '../../lib/statistics'

interface WeeklyChartProps {
  data: DayCompletion[]
  weeklyTotal: number
  weeklyChange: number | null
}

/* ----- Sub-components (outside the main component to avoid re-creation) ----- */

interface BarTrackProps {
  x?: number
  y?: number
  width?: number
  height?: number
}

/** Full-height pill "track" rendered behind each bar. */
function BarTrack({ x = 0, y = 0, width = 0, height = 0 }: BarTrackProps) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      className="dash-chart__track"
      rx={width / 2}
    />
  )
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ payload: DayCompletion }>
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.[0]) return null
  const { fullDayLabel, count } = payload[0].payload
  return (
    <div className="dash-chart__tooltip">
      <strong>{fullDayLabel}</strong>
      <span>
        {count} {count === 1 ? 'task' : 'tasks'} completed
      </span>
    </div>
  )
}

/* ----- Main component ----- */

export default function WeeklyChart({ data, weeklyTotal, weeklyChange }: WeeklyChartProps) {
  // Read once on mount; not called on every render.
  const [prefersReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  const hasData = weeklyTotal > 0

  return (
    <section className="card trend-card" aria-labelledby="trend-title">
      <div className="trend-card__summary">
        <h2 id="trend-title" className="card__title">
          Weekly completion
        </h2>
        <p className="card__subtitle">Tasks completed each day</p>
        <div className="trend-card__total">
          <p className="trend-card__total-value">{weeklyTotal}</p>
          <p className="trend-card__total-label">completed this week</p>
          {weeklyChange !== null && (
            <p className="trend-card__change">
              <Badge tone={weeklyChange >= 0 ? 'success' : 'warning'}>
                {weeklyChange > 0 ? '+' : ''}
                {weeklyChange}% vs last week
              </Badge>
            </p>
          )}
        </div>

        {/* Accessible text alternative for the chart */}
        <table className="visually-hidden">
          <caption>Tasks completed this week</caption>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Completed</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.day}>
                <td>{d.fullDayLabel}</td>
                <td>{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasData ? (
        <div
          className="dash-chart"
          role="img"
          aria-label={`Weekly completion chart: ${weeklyTotal} tasks completed this week`}
        >
          <ResponsiveContainer width="100%" height="100%" minHeight={200}>
            <BarChart
              data={data}
              accessibilityLayer={false}
              margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
            >
              <XAxis
                dataKey="dayLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-ink-muted)', fontSize: 18 }}
              />
              <YAxis hide allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={false} />
              <Bar
                dataKey="count"
                radius={[999, 999, 999, 999]}
                background={<BarTrack />}
                isAnimationActive={!prefersReducedMotion}
                maxBarSize={68}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.day}
                    fill={
                      entry.isToday
                        ? 'var(--color-primary)'
                        : 'var(--color-primary-200)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="dash-chart dash-chart--empty">
          <p className="dash-chart__empty-text">
            No tasks completed this week yet.
            <br />
            Complete a task to see your progress here!
          </p>
        </div>
      )}
    </section>
  )
}
