import { useMemo, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, CheckCircle2, Clock3, ListChecks, Plus, SearchX } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import TaskFilters from '../components/tasks/TaskFilters'
import TaskItem from '../components/tasks/TaskItem'
import TaskDrawer from '../components/tasks/TaskDrawer'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import { useAppData } from '../hooks/useAppData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useTaskFilters } from '../hooks/useTaskFilters'
import { useToast } from '../hooks/useToast'
import { useToday } from '../hooks/useToday'
import { countTasksByTab, filterTasks, sortTasks } from '../lib/tasks'
import { calculatePercentage, getTaskCounts } from '../lib/statistics'
import { compareDateStrings, getDayDifference } from '../lib/dates'
import { formatShortCalendarDay } from '../lib/calendar'
import type { Task } from '../types'

type TaskGroupKey = 'overdue' | 'today' | 'week' | 'later' | 'completed'
type TaskGroup = { key: TaskGroupKey; title: string; tasks: Task[] }

const GROUP_LABELS: Record<TaskGroupKey, string> = {
  overdue: 'Overdue',
  today: 'Today',
  week: 'Next 7 days',
  later: 'Later',
  completed: 'Completed',
}

function getTaskGroup(task: Task, today: string): TaskGroupKey {
  if (task.status === 'completed') return 'completed'
  const difference = getDayDifference(today, task.dueDate)
  if (difference < 0) return 'overdue'
  if (difference === 0) return 'today'
  if (difference <= 6) return 'week'
  return 'later'
}

export default function TasksPage() {
  useDocumentTitle('My Tasks')
  const { subjects, tasks, toggleTaskCompleted, deleteTask, loadSampleData } = useAppData()
  const { showToast } = useToast()
  const today = useToday()
  const { filters, sort, updateFilters, resetFilters, hasActiveFilters } = useTaskFilters(subjects)

  const [view, setView] = useState<'list' | 'board'>('list')
  // Only groups the user has explicitly opened/closed are stored here; everything
  // else follows the default rules in isGroupOpen below.
  const [groupOverrides, setGroupOverrides] = useState<Partial<Record<TaskGroupKey, boolean>>>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const subjectsById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  )
  const counts = useMemo(() => countTasksByTab(tasks, filters, today), [tasks, filters, today])
  const visibleTasks = useMemo(
    () => sortTasks(filterTasks(tasks, filters, today), sort),
    [tasks, filters, sort, today],
  )
  const selectedTask = tasks.find((task) => task.id === selectedId)
  // If the task being edited disappears (deleted elsewhere, data cleared) the drawer
  // closes instead of silently turning into a "New task" form.
  const drawerTask = selectedId && selectedId !== 'new' ? selectedTask : undefined
  const showDrawer = selectedId === 'new' || drawerTask !== undefined
  const deletingTask = tasks.find((task) => task.id === deletingId)

  const groups = useMemo<TaskGroup[]>(() => {
    const grouped = new Map<TaskGroupKey, Task[]>()
    for (const task of visibleTasks) {
      const key = getTaskGroup(task, today)
      grouped.set(key, [...(grouped.get(key) ?? []), task])
    }
    return (['overdue', 'today', 'week', 'later', 'completed'] as TaskGroupKey[])
      .map((key) => ({ key, title: GROUP_LABELS[key], tasks: grouped.get(key) ?? [] }))
      .filter((group) => group.tasks.length > 0)
  }, [today, visibleTasks])

  const summary = useMemo(() => {
    const counts = getTaskCounts(tasks, today)
    const dueSoon = tasks.filter((task) => {
      if (task.status !== 'pending') return false
      const difference = getDayDifference(today, task.dueDate)
      return difference >= 0 && difference <= 6
    }).length
    return { overdue: counts.overdue, dueSoon, pending: counts.pending }
  }, [tasks, today])

  const weekTasks = useMemo(
    () =>
      tasks
        .filter(
          (task) =>
            task.status === 'pending' &&
            getDayDifference(today, task.dueDate) >= 0 &&
            getDayDifference(today, task.dueDate) <= 6,
        )
        .sort((a, b) => compareDateStrings(a.dueDate, b.dueDate))
        .slice(0, 5),
    [tasks, today],
  )

  const subjectCounts = useMemo(() => {
    const result = new Map<string, number>()
    for (const task of tasks) {
      if (task.status === 'pending') result.set(task.subjectId, (result.get(task.subjectId) ?? 0) + 1)
    }
    return result
  }, [tasks])
  const completedTotal = tasks.filter((task) => task.status === 'completed').length
  const completedPercent = calculatePercentage(completedTotal, tasks.length)

  function isGroupOpen(key: TaskGroupKey): boolean {
    // On the "Completed" tab the completed group is the whole page: never hide it.
    if (key === 'completed' && filters.tab === 'completed') return true
    const override = groupOverrides[key]
    if (override !== undefined) return override
    // Completed work starts collapsed, unless it is all there is to show or the
    // user is searching (a collapsed group would hide matching results).
    if (key !== 'completed') return true
    return filters.query.trim() !== '' || groups.length === 1
  }

  function handleToggle(task: Task) {
    const result = toggleTaskCompleted(task.id)
    if (!result.ok) showToast(result.error, 'error')
    else if (result.data.status === 'completed') showToast(`Completed “${task.title}”`)
  }

  function handleLoadSample() {
    const result = loadSampleData()
    if (result.ok) showToast('Sample data loaded')
    else showToast(result.error, 'error')
  }

  function handleConfirmDelete(task: Task) {
    const result = deleteTask(task.id)
    setDeletingId(null)
    if (result.ok) {
      if (selectedId === task.id) setSelectedId(null)
      showToast(`Deleted “${task.title}”`)
    } else showToast(result.error, 'error')
  }

  function toggleGroup(key: TaskGroupKey) {
    setGroupOverrides((current) => ({ ...current, [key]: !isGroupOpen(key) }))
  }

  function renderTask(task: Task, variant: 'list' | 'board' = 'list') {
    return (
      <TaskItem
        key={task.id}
        task={task}
        subject={subjectsById.get(task.subjectId)}
        today={today}
        variant={variant}
        onToggle={handleToggle}
        onOpen={(item) => setSelectedId(item.id)}
        onEdit={(item) => setSelectedId(item.id)}
        onDelete={(item) => setDeletingId(item.id)}
      />
    )
  }

  if (subjects.length === 0) {
    return (
      <>
        <PageHeader title="My Tasks" subtitle="Everything you need to get done." />
        <div className="card">
          <EmptyState
            icon={BookOpen}
            title="Create a subject first"
            description="Every task belongs to a subject, so add one before creating tasks."
            action={
              <div className="button-row">
                <Link className="btn btn--primary btn--md" to="/subjects">
                  Go to subjects
                </Link>
                <Button variant="secondary" onClick={handleLoadSample}>
                  Load sample data
                </Button>
              </div>
            }
          />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="My Tasks"
        subtitle="Everything you need to get done."
        actions={
          <Button icon={<Plus size={18} aria-hidden="true" />} onClick={() => setSelectedId('new')}>
            New task
          </Button>
        }
      />

      {tasks.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ListChecks}
            title="No tasks yet"
            description="Add your first task to start planning your studies."
            action={
              <Button icon={<Plus size={18} aria-hidden="true" />} onClick={() => setSelectedId('new')}>
                Add task
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="task-summary" aria-label="Task summary">
            <span className={summary.overdue > 0 ? 'is-danger' : ''}>
              {summary.overdue} Overdue
            </span>
            <span>{summary.dueSoon} Due in next 7 days</span>
            <span>{summary.pending} Pending</span>
          </div>

          <TaskFilters
            filters={filters}
            sort={sort}
            subjects={subjects}
            counts={counts}
            visibleCount={visibleTasks.length}
            totalCount={tasks.length}
            hasActiveFilters={hasActiveFilters}
            view={view}
            onViewChange={setView}
            onChange={updateFilters}
            onReset={resetFilters}
          />

          <div className="tasks-layout">
            <section className="tasks-main" aria-label="Task results">
              {visibleTasks.length === 0 ? (
                <div className="card">
                  <EmptyState
                    icon={SearchX}
                    title="No tasks match your filters"
                    description="Try a different search or clear the filters to see everything."
                    action={<Button variant="secondary" onClick={resetFilters}>Clear filters</Button>}
                  />
                </div>
              ) : view === 'board' ? (
                <div className="task-board" aria-label="Tasks by status">
                  <section className="task-board__column">
                    <h2><Clock3 size={17} aria-hidden="true" /> To do <span>{visibleTasks.filter((task) => task.status === 'pending').length}</span></h2>
                    <ul>{visibleTasks.filter((task) => task.status === 'pending').map((task) => renderTask(task, 'board'))}</ul>
                  </section>
                  <section className="task-board__column">
                    <h2><CheckCircle2 size={17} aria-hidden="true" /> Done <span>{visibleTasks.filter((task) => task.status === 'completed').length}</span></h2>
                    <ul>{visibleTasks.filter((task) => task.status === 'completed').map((task) => renderTask(task, 'board'))}</ul>
                  </section>
                </div>
              ) : (
                <div className="task-groups">
                  {groups.map((group) => (
                    <section key={group.key} className={`task-group task-group--${group.key}`}>
                      <button type="button" className="task-group__header" onClick={() => toggleGroup(group.key)} aria-expanded={isGroupOpen(group.key)}>
                        <span>{group.title}</span>
                        <span className="task-group__count">{group.tasks.length}</span>
                        <span aria-hidden="true">{isGroupOpen(group.key) ? '−' : '+'}</span>
                      </button>
                      {isGroupOpen(group.key) && <ul className="task-list">{group.tasks.map((task) => renderTask(task))}</ul>}
                    </section>
                  ))}
                </div>
              )}
            </section>

            <aside className="task-side-panel" aria-label="Task overview">
              <section className="card task-side-card">
                <h2>Progress</h2>
                <div className="task-progress-ring">
                  <strong>{completedPercent}%</strong>
                  <span>{completedTotal}/{tasks.length} done</span>
                </div>
                <ProgressBar value={completedPercent} label="Overall completion" />
              </section>
              <section className="card task-side-card">
                <h2>Next 7 days</h2>
                {weekTasks.length ? (
                  <ul className="task-side-list">
                    {weekTasks.map((task) => <li key={task.id}><span>{task.title}</span><small>{formatShortCalendarDay(task.dueDate)}</small></li>)}
                  </ul>
                ) : <p className="card__placeholder">Nothing due in the next 7 days.</p>}
              </section>
              <section className="card task-side-card">
                <h2>By subject</h2>
                <ul className="task-side-list">
                  {subjects.map((subject) => (
                    <li key={subject.id}>
                      <span className="task-side-subject"><i style={{ '--subject-color': subject.color } as CSSProperties} />{subject.name}</span>
                      <Badge>{subjectCounts.get(subject.id) ?? 0}</Badge>
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
        </>
      )}

      {showDrawer && (
        <TaskDrawer
          task={drawerTask}
          initialValues={selectedId === 'new' && filters.subjectId !== 'all' ? { subjectId: filters.subjectId } : undefined}
          onClose={() => setSelectedId(null)}
        />
      )}
      {deletingTask && (
        <ConfirmDialog
          title="Delete task?"
          description={`“${deletingTask.title}” will be permanently deleted. This can’t be undone.`}
          confirmLabel="Delete task"
          onConfirm={() => handleConfirmDelete(deletingTask)}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </>
  )
}
