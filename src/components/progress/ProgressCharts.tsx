import { Bar, BarChart, Cell, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import type { WeeklySummary, WeeklyTrendPoint } from '../../lib/statistics'

interface ProgressChartsProps {
  weekly: WeeklySummary
  trend: WeeklyTrendPoint[]
  prefersReducedMotion: boolean
}

export default function ProgressCharts({ weekly, trend, prefersReducedMotion }: ProgressChartsProps) {
  return (
    <>
      <section className="card progress-chart-card" aria-labelledby="progress-weekly-title">
        <div className="progress-chart-card__header">
          <div>
            <h2 id="progress-weekly-title" className="card__title">This week</h2>
            <p className="card__subtitle">{weekly.total} completed · Sunday to Saturday</p>
          </div>
          {weekly.changePercent !== null && <span className="badge badge--success">{weekly.changePercent > 0 ? '+' : ''}{weekly.changePercent}% vs last week</span>}
        </div>
        <table className="visually-hidden"><caption>Tasks completed each day this week</caption><tbody>
          {weekly.days.map((day) => <tr key={day.day}><th>{day.fullDayLabel}</th><td>{day.count}</td></tr>)}
        </tbody></table>
        <div className="progress-chart" role="img" aria-label={`Weekly completion chart: ${weekly.total} tasks completed this week`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly.days} accessibilityLayer={false}>
              <XAxis dataKey="dayLabel" axisLine={false} tickLine={false} />
              <YAxis hide allowDecimals={false} />
              <Bar dataKey="count" radius={[999, 999, 999, 999]} isAnimationActive={!prefersReducedMotion}>
                {weekly.days.map((day) => <Cell key={day.day} fill={day.isToday ? 'var(--color-primary)' : 'var(--color-primary-200)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
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
              <LineChart data={trend} accessibilityLayer={false}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis hide allowDecimals={false} />
                <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={3} dot={{ fill: 'var(--color-primary)' }} isAnimationActive={!prefersReducedMotion} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </>
  )
}
