import { useMemo, useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import CalendarMonth from '../components/calendar/CalendarMonth'
import DayPanel from '../components/calendar/DayPanel'
import TaskDrawer from '../components/tasks/TaskDrawer'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useAppData } from '../hooks/useAppData'
import { useCalendarDate } from '../hooks/useCalendarDate'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useToast } from '../hooks/useToast'
import { useToday } from '../hooks/useToday'
import { Plus } from 'lucide-react'
import type { Task } from '../types'

export default function CalendarPage() {
  useDocumentTitle('Calendar')
  const { subjects, tasks, toggleTaskCompleted, deleteTask } = useAppData()
  const { showToast } = useToast()
  const today = useToday()
  const { selectedDate, selectDate } = useCalendarDate(today)
  const [isAdding, setIsAdding] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | undefined>()

  // Look the task up by id so the drawer always edits the latest saved version, and
  // closes by itself if the task disappears.
  const editingTask = editingTaskId ? tasks.find((task) => task.id === editingTaskId) : undefined

  const subjectsById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  )

  function handleToggle(task: Task) {
    const result = toggleTaskCompleted(task.id)
    if (!result.ok) showToast(result.error, 'error')
    else if (result.data.status === 'completed') showToast(`Completed “${task.title}”`)
  }

  function handleDelete(task: Task) {
    const result = deleteTask(task.id)
    setDeletingTask(undefined)
    if (result.ok) showToast(`Deleted “${task.title}”`)
    else showToast(result.error, 'error')
  }

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle="See your deadlines by date."
        actions={
          subjects.length > 0 ? (
            <Button icon={<Plus size={18} aria-hidden="true" />} onClick={() => setIsAdding(true)}>
              New task
            </Button>
          ) : undefined
        }
      />

      <div className="calendar-layout">
        <CalendarMonth
          selectedDate={selectedDate}
          today={today}
          tasks={tasks}
          subjects={subjectsById}
          onSelectDate={(date) => selectDate(date)}
        />
        <DayPanel
          selectedDate={selectedDate}
          today={today}
          tasks={tasks}
          subjects={subjects}
          subjectsById={subjectsById}
          onAddTask={() => setIsAdding(true)}
          onToggle={handleToggle}
          onOpenTask={(task) => setEditingTaskId(task.id)}
          onDeleteTask={setDeletingTask}
        />
      </div>

      {isAdding && (
        <TaskDrawer
          initialValues={{ dueDate: selectedDate }}
          onClose={() => setIsAdding(false)}
        />
      )}
      {editingTask && <TaskDrawer task={editingTask} onClose={() => setEditingTaskId(null)} />}
      {deletingTask && (
        <ConfirmDialog
          title="Delete task?"
          description={`“${deletingTask.title}” will be permanently deleted. This can’t be undone.`}
          confirmLabel="Delete task"
          onConfirm={() => handleDelete(deletingTask)}
          onCancel={() => setDeletingTask(undefined)}
        />
      )}
    </>
  )
}
