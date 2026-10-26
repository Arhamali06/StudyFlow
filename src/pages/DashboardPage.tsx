import { CheckCheck, CircleAlert, Hourglass, ListChecks } from 'lucide-react'
import { useMemo, useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import DashboardWelcome from '../components/dashboard/DashboardWelcome'
import NeedsAttention from '../components/dashboard/NeedsAttention'
import NextSevenDays from '../components/dashboard/NextSevenDays'
import NextUpCard from '../components/dashboard/NextUpCard'
import QuickAddCard from '../components/dashboard/QuickAddCard'
import StreakChip from '../components/dashboard/StreakChip'
import TodayTasks from '../components/dashboard/TodayTasks'
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines'
import TaskModal from '../components/tasks/TaskModal'
import StatCard from '../components/ui/StatCard'
import { useAppData } from '../hooks/useAppData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useStudyStatistics } from '../hooks/useStudyStatistics'
import { useToast } from '../hooks/useToast'
import { DEFAULT_USER_NAME } from '../lib/constants'
import { formatDate, parseDateString } from '../lib/dates'

export default function DashboardPage() {
  useDocumentTitle('Dashboard')
  const { subjects, tasks, userName, toggleTaskCompleted, loadSampleData } = useAppData()
  const { showToast } = useToast()
  const { today, counts, nextUp, streaks } = useStudyStatistics(tasks)
  const [isAddingTask, setIsAddingTask] = useState(false)

  const greeting = userName === DEFAULT_USER_NAME ? 'Hello there!' : `Hello, ${userName}!`
  const dateDisplay = useMemo(() => {
    const now = parseDateString(today)
    return now ? formatDate(today, now) : today
  }, [today])
  const subjectsById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  )
  const todayTasks = useMemo(
    () => tasks.filter((task) => task.status === 'pending' && task.dueDate <= today),
    [tasks, today],
  )
  const upcoming = useMemo(
    () =>
      tasks
        .filter((task) => task.status === 'pending' && task.dueDate > today)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [tasks, today],
  )
  const isEmpty = subjects.length === 0 && tasks.length === 0

  function handleToggle(taskId: string) {
    const task = tasks.find((item) => item.id === taskId)
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

  return (
    <>
      <PageHeader
        title={greeting}
        subtitle={dateDisplay}
        actions={!isEmpty && <StreakChip current={streaks.current} />}
      />
      <section className="stat-grid" aria-label="Task summary">
        <StatCard icon={ListChecks} tone="dark" value={counts.total} unit="tasks" label="Total" href="/tasks" linkLabel={`Total: ${counts.total} tasks, view all tasks`} />
        <StatCard icon={Hourglass} tone="muted" value={counts.pending} unit="tasks" label="Pending" href="/tasks?tab=pending" linkLabel={`Pending: ${counts.pending} tasks, view pending tasks`} />
        <StatCard icon={CheckCheck} tone="primary" value={counts.completed} unit="tasks" label="Completed" href="/tasks?tab=completed" linkLabel={`Completed: ${counts.completed} tasks, view completed tasks`} />
        <StatCard icon={CircleAlert} tone="accent" value={counts.overdue} unit="tasks" label="Overdue" href="/tasks?tab=pending&overdue=true" linkLabel={`Overdue: ${counts.overdue} tasks, view overdue tasks`} />
      </section>

      {isEmpty ? <DashboardWelcome onLoadSample={handleLoadSample} /> : (
        <>
          <NextUpCard task={nextUp} subject={nextUp ? subjectsById.get(nextUp.subjectId) : undefined} today={today} onComplete={handleToggle} />
          <div className="dashboard-action-layout">
            <div className="dashboard-action-layout__left">
              <TodayTasks tasks={todayTasks} subjects={subjectsById} today={today} onToggle={handleToggle} />
              <UpcomingDeadlines tasks={upcoming} subjects={subjectsById} today={today} />
            </div>
            <div className="dashboard-action-layout__right">
            <NextSevenDays tasks={tasks} today={today} />
            <NeedsAttention subjects={subjects} tasks={tasks} today={today} />
            <QuickAddCard hasSubjects={subjects.length > 0} onAddTask={() => setIsAddingTask(true)} />
            </div>
          </div>
        </>
      )}

      {isAddingTask && <TaskModal onClose={() => setIsAddingTask(false)} />}
    </>
  )
}
