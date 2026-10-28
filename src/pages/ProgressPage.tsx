import { CalendarCheck, Flame, Lightbulb, Target, TrendingUp } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import PageHeader from '../components/layout/PageHeader'
import OverallProgress from '../components/progress/OverallProgress'
import ProgressCharts from '../components/progress/ProgressCharts'
import ProgressEmptyState from '../components/progress/ProgressEmptyState'
import SubjectProgressRows from '../components/progress/SubjectProgressRows'
import Badge from '../components/ui/Badge'
import StatCard from '../components/ui/StatCard'
import { useAppData } from '../hooks/useAppData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useStudyStatistics } from '../hooks/useStudyStatistics'
import { useToast } from '../hooks/useToast'
import type { ProgressRange } from '../lib/statistics'

// These are rolling windows ending today, so the labels say exactly that.
const RANGE_OPTIONS: Array<{ value: ProgressRange; label: string; description: string }> = [
  { value: 'week', label: '7 days', description: 'Last 7 days' },
  { value: 'month', label: '30 days', description: 'Last 30 days' },
  { value: 'threeMonths', label: '90 days', description: 'Last 90 days' },
  { value: 'all', label: 'All time', description: 'All time' },
]

const pluralDays = (count: number) => (count === 1 ? 'day' : 'days')

const formatLabel = (label: string) => label.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^\w/, (letter) => letter.toUpperCase())

export default function ProgressPage() {
  useDocumentTitle('Progress')
  const { subjects, tasks, loadSampleData } = useAppData()
  const { showToast } = useToast()
  const [range, setRange] = useState<ProgressRange>('all')
  const [prefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const stats = useStudyStatistics(tasks, range)

  function handleLoadSample() {
    const result = loadSampleData()
    if (result.ok) showToast('Sample data loaded')
    else showToast(result.error, 'error')
  }

  if (subjects.length === 0 && tasks.length === 0) {
    return (
      <>
        <PageHeader title="Progress" subtitle="See how your study habits grow over time." />
        <ProgressEmptyState onLoadSample={handleLoadSample} />
      </>
    )
  }

  const hasActivity = stats.activityTasks.length > 0
  const message = stats.overall.total === 0
    ? 'No tasks are due in this range yet.'
    : stats.overall.completed === 0
      ? 'Complete your first task to see your progress grow.'
      : stats.overall.completed === stats.overall.total
        ? 'Amazing work — every task in this range is complete!'
        : 'Keep going — every completed task moves you forward.'
  const bestWeek = stats.bestWeek.count > 0 ? `${stats.bestWeek.count} tasks` : '—'
  const weeklyDelta = stats.weekly.total - stats.weekly.previousTotal
  const change = stats.weekly.total === 0 && stats.weekly.previousTotal === 0
    ? '—'
    : `${weeklyDelta > 0 ? '+' : ''}${weeklyDelta} tasks`

  return (
    <>
      <PageHeader
        title="Progress"
        subtitle="See how your study habits grow over time."
        actions={
          <div className="tabs progress-range" role="group" aria-label="Progress date range">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`tab${range === option.value ? ' is-active' : ''}`}
                aria-pressed={range === option.value}
                aria-label={option.description}
                onClick={() => setRange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />
      <div className="progress-page">
        <div className="progress-hero">
          <OverallProgress progress={stats.overall} message={message} />
          <section className="progress-stats" aria-label="Progress metrics">
            <StatCard icon={Target} tone="primary" value={stats.onTimeRate === null ? '—' : `${stats.onTimeRate}%`} label="On-time rate" />
            <StatCard icon={Flame} tone="accent" value={stats.streaks.current} unit={pluralDays(stats.streaks.current)} label="Streak · all time" detail={`Longest: ${stats.streaks.longest} ${pluralDays(stats.streaks.longest)} · all time`} />
            <StatCard icon={TrendingUp} tone="dark" value={bestWeek} label="Best week · selected range" />
            <StatCard icon={CalendarCheck} tone="primary" value={change} label="Week over week · all time" detail={stats.weekly.changePercent === null ? undefined : stats.weekly.previousTotal === 0 ? 'New completions' : `${stats.weekly.changePercent > 0 ? '+' : ''}${stats.weekly.changePercent}% vs last week`} />
          </section>
        </div>
        {!hasActivity && (
          <section className="card progress-range-empty" aria-live="polite">
            <p>No completions in this range yet. The last-8-weeks trend below always covers the same 8 weeks.</p>
          </section>
        )}
        <div className="progress-columns">
          <div className="progress-column">
            <ProgressCharts trend={stats.trend} prefersReducedMotion={prefersReducedMotion} />
            <SubjectProgressRows subjects={subjects} progressMap={stats.subjectProgress} />
          </div>
          <div className="progress-column">
            <InsightsCard hasActivity={hasActivity} stats={stats} />
            <WeekdayCard values={stats.weekdayBreakdown} />
            <BreakdownCard id="type" title="By task type" values={stats.typeBreakdown.map((item) => ({ label: formatLabel(item.label), completed: item.completed, total: item.total }))} />
            <PriorityCard values={stats.priorityBreakdown} />
          </div>
        </div>
      </div>
    </>
  )
}

function InsightsCard({ hasActivity, stats }: { hasActivity: boolean; stats: ReturnType<typeof useStudyStatistics> }) {
  // Only name a "most productive weekday" when exactly one day is the clear winner.
  const topCount = Math.max(...stats.weekdayBreakdown.map((day) => day.count), 0)
  const topDays = stats.weekdayBreakdown.filter((day) => day.count === topCount)
  const topDay = topCount > 0 && topDays.length === 1 ? topDays[0] : null
  const lines = [
    stats.onTimeRate !== null ? `${stats.onTimeRate}% of completed tasks were on time.` : null,
    stats.streaks.current > 0 ? `You’re on a ${stats.streaks.current}-day streak.` : null,
    stats.bestWeek.count > 0 ? `Your best week in this range had ${stats.bestWeek.count} ${stats.bestWeek.count === 1 ? 'completion' : 'completions'}.` : null,
    topDay ? `Your most productive weekday is ${topDay.label}.` : null,
  ].filter((line): line is string => line !== null).slice(0, 4)
  return (
    <section className="card progress-insights" aria-labelledby="insights-title">
      <div className="progress-section__header">
        <div><h2 id="insights-title" className="card__title">Insights</h2><p className="card__subtitle">A quick read of your activity.</p></div>
        <Lightbulb size={20} aria-hidden="true" />
      </div>
      {!hasActivity || lines.length === 0 ? <p className="card__placeholder">Not enough data yet.</p> : <ul>{lines.map((line) => <li key={line}>{line}</li>)}</ul>}
    </section>
  )
}

function WeekdayCard({ values }: { values: Array<{ label: string; count: number }> }) {
  const strongest = Math.max(...values.map((value) => value.count), 0)
  return (
    <section className="card progress-breakdown" aria-labelledby="weekday-title">
      <h2 id="weekday-title" className="card__title">Productivity by weekday</h2>
      <p className="card__subtitle">Completed tasks in the selected range.</p>
      <div className="weekday-bars">{values.map((value) => <div className="weekday-bars__item" key={value.label}><span>{value.label.slice(0, 3)}</span><i className={value.count === strongest && strongest > 0 ? 'is-strongest' : ''} style={{ '--bar-size': `${strongest ? (value.count / strongest) * 100 : 0}%` } as CSSProperties} /><strong>{value.count}</strong></div>)}</div>
    </section>
  )
}

function BreakdownCard({ id, title, values }: { id: string; title: string; values: Array<{ label: string; completed: number; total: number }> }) {
  return (
    <section className="card progress-breakdown" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="card__title">{title}</h2>
      <p className="card__subtitle">Completed out of the tasks due in this range.</p>
      <div className="progress-breakdown__list">{values.length === 0 ? <p className="card__placeholder">No tasks in this range.</p> : values.map((value) => <div className="progress-breakdown__row" key={value.label}><span>{formatLabel(value.label)}</span><div className="progress-breakdown__track"><i style={{ '--bar-size': `${value.total ? (value.completed / value.total) * 100 : 0}%` } as CSSProperties} /></div><strong>{value.completed}/{value.total}</strong></div>)}</div>
    </section>
  )
}

function PriorityCard({ values }: { values: Array<{ label: string; completed: number; pending: number }> }) {
  return (
    <section className="card progress-breakdown" aria-labelledby="priority-title">
      <h2 id="priority-title" className="card__title">By priority</h2>
      <p className="card__subtitle">Tasks due in this range, by status.</p>
      <div className="progress-priority-list">{values.map((value) => <div className="progress-priority-row" key={value.label}><span>{value.label}</span><Badge tone="success">{value.completed} done</Badge><Badge>{value.pending} pending</Badge></div>)}</div>
    </section>
  )
}
