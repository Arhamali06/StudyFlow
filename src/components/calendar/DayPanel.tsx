import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Plus } from 'lucide-react'
import TaskItem from '../tasks/TaskItem'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import { formatCalendarDay, getDaySummary, sortDayTasks } from '../../lib/calendar'
import type { Subject, Task } from '../../types'

interface DayPanelProps {
  selectedDate: string
  today: string
  tasks: Task[]
  subjects: Subject[]
  subjectsById: Map<string, Subject>
  onAddTask: () => void
  onToggle: (task: Task) => void
  onOpenTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
}

export default function DayPanel({
  selectedDate,
  today,
  tasks,
  subjects,
  subjectsById,
  onAddTask,
  onToggle,
  onOpenTask,
  onDeleteTask,
}: DayPanelProps) {
  const summary = getDaySummary(tasks, selectedDate, today)
  const dayTasks = useMemo(() => sortDayTasks(summary.tasks), [summary.tasks])

  return (
    <section className="day-panel card" aria-labelledby="selected-day-title">
      <div className="day-panel__header">
        <div>
          <h2 id="selected-day-title">{formatCalendarDay(selectedDate)}</h2>
          <p>
            {summary.tasks.length === 0
              ? 'No tasks'
              : `${summary.tasks.length} ${summary.tasks.length === 1 ? 'task' : 'tasks'} · ${summary.overdue} overdue`}
          </p>
        </div>
        {subjects.length > 0 && (
          <Button size="sm" icon={<Plus size={16} aria-hidden="true" />} onClick={onAddTask}>
            Add task
          </Button>
        )}
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Create a subject first"
          description="Tasks belong to a subject, so create one before adding a task."
          action={<Link className="btn btn--secondary btn--sm" to="/subjects">Go to subjects</Link>}
        />
      ) : dayTasks.length === 0 ? (
        <p className="day-panel__empty">No tasks scheduled for this day.</p>
      ) : (
        <ul className="task-list" aria-label={`Tasks for ${formatCalendarDay(selectedDate)}`}>
          {dayTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              subject={subjectsById.get(task.subjectId)}
              today={today}
              onToggle={onToggle}
              onOpen={onOpenTask}
              onEdit={onOpenTask}
              onDelete={onDeleteTask}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
