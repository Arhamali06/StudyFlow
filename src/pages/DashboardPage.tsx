import { useMemo, useState } from 'react'
import { CheckCheck, CircleAlert, Hourglass, ListChecks } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import DashboardWelcome from '../components/dashboard/DashboardWelcome'
import QuickAddCard from '../components/dashboard/QuickAddCard'
import SubjectProgressList from '../components/dashboard/SubjectProgressList'
import TodayTasks from '../components/dashboard/TodayTasks'
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines'
import WeeklyChart from '../components/dashboard/WeeklyChart'
import TaskModal from '../components/tasks/TaskModal'
import StatCard from '../components/ui/StatCard'
import { useAppData } from '../hooks/useAppData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useToast } from '../hooks/useToast'
import { useToday } from '../hooks/useToday'
import { DEFAULT_USER_NAME } from '../lib/constants'
import { addDays, formatDate, parseDateString, toDateString } from '../lib/dates'
import {
  countCompletionsInDays,
  getCompletionsPerDay,
  getSubjectProgressMap,
  getTaskCounts,
  getTodayAndOverdueTasks,
  getUpcomingTasks,
  getWeekDays,
  getWeeklyChangePercent,
} from '../lib/statistics'

/**
 * Phase 5: live dashboard driven entirely by real data.
 *
 * Layout (matches the approved skeleton):
 *  Row 1 — Greeting + today's date
 *  Row 2 — 4 stat cards (Total, Pending, Completed, Overdue)
 *  Row 3 — Weekly completion chart (Recharts)
 *  Row 4 — Quick-add dark card | Upcoming deadlines
 *  Row 5 — Today's tasks | Subject progress   ← NEW
 *
 * When there are zero subjects AND zero tasks, rows 3-5 are replaced by a
 * single welcome card with CTAs.
 */
export default function DashboardPage() {
  useDocumentTitle('Dashboard')
  const { subjects, tasks, userName, toggleTaskCompleted, loadSampleData } = useAppData()
  const { showToast } = useToast()
  const today = useToday()

  const [isAddingTask, setIsAddingTask] = useState(false)

  /* ----- Greeting ----- */

  const greeting = userName === DEFAULT_USER_NAME ? 'Hello there!' : `Hello, ${userName}!`
  const dateDisplay = useMemo(() => {
    const now = parseDateString(today)
    return now ? formatDate(today, now) : today
  }, [today])

  /* ----- Stat counts ----- */

  const counts = useMemo(() => getTaskCounts(tasks, today), [tasks, today])

  /* ----- Subject lookups ----- */

  const subjectsById = useMemo(
    () => new Map(subjects.map((s) => [s.id, s])),
    [subjects],
  )
  const progressMap = useMemo(() => getSubjectProgressMap(tasks), [tasks])

  /* ----- Weekly chart data ----- */

  const currentWeekDays = useMemo(() => getWeekDays(today), [today])

  const previousWeekDays = useMemo(() => {
    const todayDate = parseDateString(today)
    if (!todayDate) return [] as string[]
    return getWeekDays(toDateString(addDays(todayDate, -7)))
  }, [today])

  const chartData = useMemo(
    () => getCompletionsPerDay(tasks, currentWeekDays, today),
    [tasks, currentWeekDays, today],
  )

  const weeklyTotal = useMemo(
    () => chartData.reduce((sum, d) => sum + d.count, 0),
    [chartData],
  )

  const previousWeekTotal = useMemo(
    () => countCompletionsInDays(tasks, previousWeekDays),
    [tasks, previousWeekDays],
  )

  const weeklyChange = useMemo(
    () => getWeeklyChangePercent(weeklyTotal, previousWeekTotal),
    [weeklyTotal, previousWeekTotal],
  )

  /* ----- Today + overdue, upcoming ----- */

  const todayTasks = useMemo(
    () => getTodayAndOverdueTasks(tasks, today),
    [tasks, today],
  )

  const upcoming = useMemo(
    () => getUpcomingTasks(tasks, today),
    [tasks, today],
  )

  /* ----- Empty state check ----- */

  const isEmpty = subjects.length === 0 && tasks.length === 0

  /* ----- Handlers ----- */

  function handleToggle(taskId: string) {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const result = toggleTaskCompleted(taskId)
    if (!result.ok) showToast(result.error, 'error')
    else if (result.data.status === 'completed') showToast(`Completed "${task.title}"`)
  }

  function handleLoadSample() {
    const result = loadSampleData()
    if (result.ok) showToast('Sample data loaded')
    else showToast(result.error, 'error')
  }

  /* ----- Render ----- */

  return (
    <>
      <PageHeader title={greeting} subtitle={dateDisplay} />

      {/* Row 2 — stat cards (always visible, even when empty) */}
      <section className="stat-grid" aria-label="Task summary">
        <StatCard
          icon={ListChecks}
          tone="dark"
          value={counts.total}
          unit="tasks"
          label="Total"
          href="/tasks"
          linkLabel={`Total: ${counts.total} tasks, view all tasks`}
        />
        <StatCard
          icon={Hourglass}
          tone="muted"
          value={counts.pending}
          unit="tasks"
          label="Pending"
          href="/tasks?tab=pending"
          linkLabel={`Pending: ${counts.pending} tasks, view pending tasks`}
        />
        <StatCard
          icon={CheckCheck}
          tone="primary"
          value={counts.completed}
          unit="tasks"
          label="Completed"
          href="/tasks?tab=completed"
          linkLabel={`Completed: ${counts.completed} tasks, view completed tasks`}
        />
        <StatCard
          icon={CircleAlert}
          tone="accent"
          value={counts.overdue}
          unit="tasks"
          label="Overdue"
          href="/tasks?tab=pending"
          linkLabel={`Overdue: ${counts.overdue} tasks, view tasks`}
        />
      </section>

      {isEmpty ? (
        /* No data at all — show welcome card instead of the full dashboard */
        <DashboardWelcome onLoadSample={handleLoadSample} />
      ) : (
        <>
          {/* Row 3 — weekly completion chart */}
          <WeeklyChart
            data={chartData}
            weeklyTotal={weeklyTotal}
            weeklyChange={weeklyChange}
          />

          {/* Row 4 — quick add + upcoming deadlines */}
          <div className="split-grid">
            <QuickAddCard
              hasSubjects={subjects.length > 0}
              onAddTask={() => setIsAddingTask(true)}
            />
            <UpcomingDeadlines
              tasks={upcoming}
              subjects={subjectsById}
              today={today}
            />
          </div>

          {/* Row 5 — today's tasks + subject progress (NEW) */}
          <div className="split-grid">
            <TodayTasks
              tasks={todayTasks}
              subjects={subjectsById}
              today={today}
              onToggle={handleToggle}
            />
            <SubjectProgressList
              subjects={subjects}
              progressMap={progressMap}
            />
          </div>
        </>
      )}

      {/* Task modal opened from the quick-add card */}
      {isAddingTask && <TaskModal onClose={() => setIsAddingTask(false)} />}
    </>
  )
}
