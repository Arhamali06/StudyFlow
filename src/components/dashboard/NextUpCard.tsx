import type { CSSProperties } from 'react'
import Button from '../ui/Button'
import { getDueInfo } from '../../lib/tasks'
import type { Subject, Task } from '../../types'

interface NextUpCardProps {
  task?: Task
  subject?: Subject
  today: string
  onComplete: (taskId: string) => void
}

export default function NextUpCard({ task, subject, today, onComplete }: NextUpCardProps) {
  return (
    <section className="card dash-next-up" aria-labelledby="next-up-title">
      <h2 id="next-up-title" className="card__title">Next up</h2>
      <p className="card__subtitle">The best place to start.</p>
      {!task ? <p className="card__placeholder">You are all caught up.</p> : (
        <div className="dash-next-up__content">
          <span className="dash-next-up__subject">
            <span
              className="subject-chip__dot"
              style={{ '--subject-color': subject?.color ?? 'var(--color-ink-subtle)' } as CSSProperties}
              aria-hidden="true"
            />
            {subject?.name ?? 'Unknown subject'}
          </span>
          <strong>{task.title}</strong>
          <span className="dash-next-up__due">{getDueInfo(task, today).label}</span>
          <Button size="sm" onClick={() => onComplete(task.id)}>Mark done</Button>
        </div>
      )}
    </section>
  )
}
