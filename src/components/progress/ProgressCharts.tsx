import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import type { WeeklyTrendPoint } from '../../lib/statistics'

interface ProgressChartsProps {
  trend: WeeklyTrendPoint[]
  prefersReducedMotion: boolean
}

export default function ProgressCharts({ trend, prefersReducedMotion }: ProgressChartsProps) {
  return (
      <section className="card progress-chart-card" aria-labelledby="progress-trend-title">
        <div className="progress-chart-card__header">
          <div>
            <h2 id="progress-trend-title" className="card__title">Last 8 weeks</h2>
            <p className="card__subtitle">Completed tasks by local week</p>
          </div>
        </div>
        <table className="visually-hidden"><caption>Tasks completed in the last 8 weeks</caption><tbody>
          {trend.map((week) => <tr key={week.weekStart}><th>{week.label}</th><td>{week.count}</td></tr>)}
        </tbody></table>
        {trend.every((week) => week.count === 0) ? <p className="progress-chart__empty">No completions in the last 8 weeks yet.</p> : (
          <div className="progress-chart" role="img" aria-label="Completion trend for the last 8 weeks">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 16, right: 8, bottom: 12, left: 8 }} accessibilityLayer={false}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis hide allowDecimals={false} />
                <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={3} dot={{ fill: 'var(--color-primary)' }} isAnimationActive={!prefersReducedMotion} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
  )
}
