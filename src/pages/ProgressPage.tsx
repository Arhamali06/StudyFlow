import { CheckCheck, CircleAlert, Hourglass, ListChecks } from 'lucide-react'
import { useMemo, useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import OverallProgress from '../components/progress/OverallProgress'
import ProgressCharts from '../components/progress/ProgressCharts'
import ProgressEmptyState, { ProgressNoTasksState } from '../components/progress/ProgressEmptyState'
import SubjectProgressRows from '../components/progress/SubjectProgressRows'
import StatCard from '../components/ui/StatCard'
import { useAppData } from '../hooks/useAppData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useToast } from '../hooks/useToast'
import { useToday } from '../hooks/useToday'
import {
  getDetailedSubjectProgressMap,
  getOverallProgress,
  getTaskCounts,
  getWeeklySummary,
  getWeeklyTrend,
} from '../lib/statistics'

export default function ProgressPage() {
  useDocumentTitle('Progress')
  const { subjects, tasks, loadSampleData } = useAppData()
  const { showToast } = useToast()
  const today = useToday()
  const [prefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  const counts = useMemo(() => getTaskCounts(tasks, today), [tasks, today])
  const overall = useMemo(() => getOverallProgress(tasks), [tasks])
  const weekly = useMemo(() => getWeeklySummary(tasks, today), [tasks, today])
  const trend = useMemo(() => getWeeklyTrend(tasks, today), [tasks, today])
  const subjectProgress = useMemo(() => getDetailedSubjectProgressMap(tasks, today), [tasks, today])
  const isEmpty = subjects.length === 0 && tasks.length === 0
  const message = isEmpty
    ? 'Add subjects and tasks to begin.'
    : overall.total === 0
      ? 'Add a task to start tracking progress.'
      : overall.completed === 0
        ? 'Complete your first task to see your progress grow.'
        : overall.completed === overall.total
          ? 'Amazing work — every task is complete!'
          : 'Keep going — every completed task moves you forward.'

  function handleLoadSample() {
    const result = loadSampleData()
    if (result.ok) showToast('Sample data loaded')
    else showToast(result.error, 'error')
  }

  return (
    <>
      <PageHeader title="Progress" subtitle="Track how your studies are going." />
      {isEmpty ? <ProgressEmptyState onLoadSample={handleLoadSample} /> : (
        <div className={`progress-page${prefersReducedMotion ? ' prefers-reduced-motion' : ''}`}>
          <OverallProgress progress={overall} message={message} />
          <section className="progress-stats" aria-label="Task summary">
            <StatCard icon={ListChecks} tone="dark" value={counts.total} unit="tasks" label="Total" href="/tasks" linkLabel={`Total: ${counts.total} tasks, view all tasks`} />
            <StatCard icon={Hourglass} tone="muted" value={counts.pending} unit="tasks" label="Pending" href="/tasks?tab=pending" linkLabel={`Pending: ${counts.pending} tasks, view pending tasks`} />
            <StatCard icon={CheckCheck} tone="primary" value={counts.completed} unit="tasks" label="Completed" href="/tasks?tab=completed" linkLabel={`Completed: ${counts.completed} tasks, view completed tasks`} />
            <StatCard icon={CircleAlert} tone="accent" value={counts.overdue} unit="tasks" label="Overdue" href="/tasks?tab=pending" linkLabel={`Overdue: ${counts.overdue} tasks, view pending tasks`} />
          </section>
          {tasks.length === 0 && <ProgressNoTasksState />}
          {tasks.length > 0 && <ProgressCharts weekly={weekly} trend={trend} prefersReducedMotion={prefersReducedMotion} />}
          <SubjectProgressRows subjects={subjects} progressMap={subjectProgress} />
        </div>
      )}
    </>
  )
}
