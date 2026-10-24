import { useState, type CSSProperties } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Badge from '../ui/Badge'
import { getDueInfo } from '../../lib/tasks'
import type { Subject, Task } from '../../types'

const PAGE_SIZE = 3

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
  const [page, setPage] = useState(0)

  // Clamp page when the list shrinks — derived during render, no effect needed.
  const lastPage = Math.max(0, Math.ceil(tasks.length / PAGE_SIZE) - 1)
  const currentPage = Math.min(page, lastPage)
  const start = currentPage * PAGE_SIZE
  const visible = tasks.slice(start, start + PAGE_SIZE)

  return (
    <section className="card" aria-labelledby="deadlines-title">
      <div className="dash-deadlines__header">
        <div>
          <h2 id="deadlines-title" className="card__title">
            Upcoming deadlines
          </h2>
          <p className="card__subtitle">What's coming up next</p>
        </div>
        {lastPage > 0 && (
          <div className="dash-deadlines__pager">
            <button
              type="button"
              className="icon-button icon-button--subtle icon-button--sm"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 0}
              aria-label="Previous deadlines"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="icon-button icon-button--subtle icon-button--sm"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= lastPage}
              aria-label="Next deadlines"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        )}
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
                <div className="dash-deadlines__text">
                  <span className="dash-deadlines__title">{task.title}</span>
                  <span className="dash-deadlines__due">
                    {due.label}
                    {task.isSample && <Badge>Sample</Badge>}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
