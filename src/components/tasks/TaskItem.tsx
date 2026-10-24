import type { CSSProperties } from 'react'
import { CalendarDays, Check, Pencil, Trash2 } from 'lucide-react'
import Badge, { type BadgeTone } from '../ui/Badge'
import { TASK_PRIORITY_LABELS, TASK_TYPE_LABELS } from '../../lib/constants'
import { getDueInfo } from '../../lib/tasks'
import type { Subject, Task, TaskPriority } from '../../types'

interface TaskItemProps {
  task: Task
  /** The subject this task belongs to (used for its name and color). */
  subject: Subject | undefined
  /** Today as "YYYY-MM-DD", used to decide what is overdue. */
  today: string
  onToggle: (task: Task) => void
  onOpen: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  variant?: 'list' | 'board'
}

const PRIORITY_TONES: Record<TaskPriority, BadgeTone> = {
  high: 'danger',
  medium: 'warning',
  low: 'neutral',
}

export default function TaskItem({
  task,
  subject,
  today,
  onToggle,
  onOpen,
  onEdit,
  onDelete,
  variant = 'list',
}: TaskItemProps) {
  const isDone = task.status === 'completed'
  const due = getDueInfo(task, today)

  const className = ['task-item', `task-item--${variant}`, isDone && 'is-done', due.isOverdue && 'is-overdue']
    .filter(Boolean)
    .join(' ')

  return (
    <li
      className={className}
      tabIndex={0}
      onClick={() => onOpen(task)}
      onKeyDown={(event) => {
        if (
          event.target !== event.currentTarget &&
          event.target instanceof HTMLElement &&
          event.target.closest('button, input, select, textarea, a')
        ) {
          return
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(task)
        }
      }}
    >
      <label className="task-check">
        <input
          type="checkbox"
          checked={isDone}
          onClick={(event) => event.stopPropagation()}
          onChange={() => onToggle(task)}
          aria-label={isDone ? `Mark “${task.title}” as pending` : `Mark “${task.title}” as completed`}
        />
        <span className="task-check__box">
          <Check size={14} strokeWidth={3} aria-hidden="true" />
        </span>
      </label>

      <div className="task-item__main">
        <p className="task-item__title">{task.title}</p>
        {task.description && <p className="task-item__description">{task.description}</p>}

        <div className="task-item__meta">
          <span
            className="subject-chip"
            style={{ '--subject-color': subject?.color ?? 'var(--color-ink-subtle)' } as CSSProperties}
          >
            <span className="subject-chip__dot" aria-hidden="true" />
            {subject?.name ?? 'Unknown subject'}
          </span>
          <Badge>{TASK_TYPE_LABELS[task.type]}</Badge>
          <Badge tone={PRIORITY_TONES[task.priority]}>{TASK_PRIORITY_LABELS[task.priority]}</Badge>
        </div>
      </div>

      <div className="task-item__status">
        {isDone ? (
          <Badge tone="success">Completed</Badge>
        ) : due.isOverdue ? (
          <Badge tone="danger">Overdue</Badge>
        ) : (
          <Badge tone="primary">Pending</Badge>
        )}
        {task.isSample && <Badge>Sample</Badge>}
      </div>

      <span className={`task-item__due${due.isOverdue ? ' is-overdue' : ''}`}>
        <CalendarDays size={14} aria-hidden="true" />
        {due.label}
      </span>

      <div className="task-item__actions">
        <button
          type="button"
          className="icon-button icon-button--subtle icon-button--sm"
          onClick={(event) => {
            event.stopPropagation()
            onEdit(task)
          }}
          aria-label={`Edit “${task.title}”`}
        >
          <Pencil size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="icon-button icon-button--subtle icon-button--sm icon-button--danger"
          onClick={(event) => {
            event.stopPropagation()
            onDelete(task)
          }}
          aria-label={`Delete “${task.title}”`}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    </li>
  )
}
