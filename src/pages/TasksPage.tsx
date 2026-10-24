import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ListChecks, Plus, SearchX } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import TaskFilters from '../components/tasks/TaskFilters'
import TaskItem from '../components/tasks/TaskItem'
import TaskModal from '../components/tasks/TaskModal'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import { useAppData } from '../hooks/useAppData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useTaskFilters } from '../hooks/useTaskFilters'
import { useToast } from '../hooks/useToast'
import { useToday } from '../hooks/useToday'
import { countTasksByTab, filterTasks, sortTasks } from '../lib/tasks'
import type { Task } from '../types'

export default function TasksPage() {
  useDocumentTitle('My Tasks')
  const { subjects, tasks, toggleTaskCompleted, deleteTask, loadSampleData } = useAppData()
  const { showToast } = useToast()
  const today = useToday()
  const { filters, sort, updateFilters, resetFilters, hasActiveFilters } = useTaskFilters(subjects)

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const subjectsById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  )
  const counts = useMemo(() => countTasksByTab(tasks, filters), [tasks, filters])
  const visibleTasks = useMemo(
    () => sortTasks(filterTasks(tasks, filters), sort),
    [tasks, filters, sort],
  )

  const editingTask = tasks.find((task) => task.id === editingId)
  const deletingTask = tasks.find((task) => task.id === deletingId)

  function handleToggle(task: Task) {
    const result = toggleTaskCompleted(task.id)
    if (!result.ok) showToast(result.error, 'error')
    else if (result.data.status === 'completed') showToast(`Completed “${task.title}”`)
  }

  function handleConfirmDelete(task: Task) {
    const result = deleteTask(task.id)
    setDeletingId(null)
    if (result.ok) showToast(`Deleted “${task.title}”`)
    else showToast(result.error, 'error')
  }

  function handleLoadSample() {
    const result = loadSampleData()
    if (result.ok) showToast('Sample data loaded')
    else showToast(result.error, 'error')
  }

  /* ----- No subjects: tasks need a subject, so guide the person there first ----- */
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
          <Button icon={<Plus size={18} aria-hidden="true" />} onClick={() => setIsCreating(true)}>
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
              <Button icon={<Plus size={18} aria-hidden="true" />} onClick={() => setIsCreating(true)}>
                Add task
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <TaskFilters
            filters={filters}
            sort={sort}
            subjects={subjects}
            counts={counts}
            hasActiveFilters={hasActiveFilters}
            onChange={updateFilters}
            onReset={resetFilters}
          />

          <p className="results-count" aria-live="polite">
            Showing {visibleTasks.length} of {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </p>

          {visibleTasks.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={SearchX}
                title="No tasks match your filters"
                description="Try a different search or clear the filters to see everything."
                action={
                  <Button variant="secondary" onClick={resetFilters}>
                    Clear filters
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="task-list" aria-label="Tasks">
              {visibleTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  subject={subjectsById.get(task.subjectId)}
                  today={today}
                  onToggle={handleToggle}
                  onEdit={(item) => setEditingId(item.id)}
                  onDelete={(item) => setDeletingId(item.id)}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {isCreating && (
        <TaskModal
          initialValues={filters.subjectId !== 'all' ? { subjectId: filters.subjectId } : undefined}
          onClose={() => setIsCreating(false)}
        />
      )}
      {editingTask && <TaskModal task={editingTask} onClose={() => setEditingId(null)} />}
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
