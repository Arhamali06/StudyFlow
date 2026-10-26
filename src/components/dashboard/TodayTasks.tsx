import type { CSSProperties } from 'react'
import { Check, ClipboardCheck } from 'lucide-react'
import Badge from '../ui/Badge'
import { getDueInfo, isTaskOverdue } from '../../lib/tasks'
import type { Subject, Task } from '../../types'

interface TodayTasksProps {
  tasks: Task[]
  subjects: Map<string, Subject>
  today: string
  onToggle: (taskId: string) => void
}

export default function TodayTasks({ tasks, subjects, today, onToggle }: TodayTasksProps) {
  return (
    <section className="card" aria-labelledby="today-title">
      <h2 id="today-title" className="card__title">
        Today's tasks
      </h2>
      <p className="card__subtitle">What needs your attention today</p>

      {tasks.length === 0 ? (
        <div className="dash-today__empty">
          <ClipboardCheck size={22} aria-hidden="true" />
          <p>Nothing due today — enjoy your free time!</p>
        </div>
      ) : (
        <ul className="dash-today__list">
          {tasks.map((task) => {
            const subject = subjects.get(task.subjectId)
            const overdue = isTaskOverdue(task, today)
            const due = getDueInfo(task, today)
            return (
              <li
                key={task.id}
                className={`dash-today__item${overdue ? ' is-overdue' : ''}`}
              >
                <label className="task-check">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => onToggle(task.id)}
                    aria-label={`Mark "${task.title}" as completed`}
                  />
                  <span className="task-check__box">
                    <Check size={14} strokeWidth={3} aria-hidden="true" />
                  </span>
                </label>
                <span
                  className="subject-chip__dot"
                  style={
                    {
                      '--subject-color':
                        subject?.color ?? 'var(--color-ink-subtle)',
                    } as CSSProperties
                  }
                  aria-hidden="true"
                />
                <span className="dash-today__title">{task.title}</span>
                <span className="dash-today__meta">
                  <span
                    className={`dash-today__due${overdue ? ' is-overdue' : ''}`}
                  >
                    {due.label}
                  </span>
                  {overdue && <Badge tone="danger">Overdue</Badge>}
                  {task.isSample && <Badge>Sample</Badge>}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
