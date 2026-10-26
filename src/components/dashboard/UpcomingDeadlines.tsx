import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import { getDueInfo } from '../../lib/tasks'
import type { Subject, Task } from '../../types'

const PAGE_SIZE = 5

interface UpcomingDeadlinesProps {
  tasks: Task[]
  subjects: Map<string, Subject>
  today: string
}

export default function UpcomingDeadlines({
  tasks,
  subjects,
  today,
}: UpcomingDeadlinesProps) {
  const visible = tasks.slice(0, PAGE_SIZE)

  return (
    <section className="card" aria-labelledby="deadlines-title">
      <div className="dash-deadlines__header">
        <div>
          <h2 id="deadlines-title" className="card__title">
            Upcoming deadlines
          </h2>
          <p className="card__subtitle">What's coming up next</p>
        </div>
        <Link className="dash-widget-link" to="/calendar">View calendar</Link>
      </div>

      {tasks.length === 0 ? (
        <p className="card__placeholder">No upcoming deadlines.</p>
      ) : (
        <ul className="dash-deadlines__list">
          {visible.map((task) => {
            const subject = subjects.get(task.subjectId)
            const due = getDueInfo(task, today)
            return (
              <li key={task.id} className="dash-deadlines__item">
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
                <span className="dash-deadlines__title">{task.title}</span>
                <span className="dash-deadlines__due">
                  {due.label}
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
