import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import ProgressBar from '../ui/ProgressBar'
import type { DetailedSubjectProgress } from '../../lib/statistics'
import type { Subject } from '../../types'

interface SubjectProgressRowsProps {
  subjects: Subject[]
  progressMap: Map<string, DetailedSubjectProgress>
}

export default function SubjectProgressRows({ subjects, progressMap }: SubjectProgressRowsProps) {
  return (
    <section className="card progress-section" aria-labelledby="subject-progress-title">
      <div className="progress-section__header">
        <div>
          <h2 id="subject-progress-title" className="card__title">Progress by subject</h2>
          <p className="card__subtitle">See how each subject is moving forward.</p>
        </div>
      </div>
      <div className="progress-subject-list">
        {subjects.map((subject) => {
          const progress = progressMap.get(subject.id) ?? {
            total: 0, completed: 0, pending: 0, percent: 0, overdue: 0,
          }
          const style = { '--subject-color': subject.color } as CSSProperties
          return (
            <Link
              key={subject.id}
              className="progress-subject-row"
              style={style}
              to={`/tasks?subject=${encodeURIComponent(subject.id)}`}
              aria-label={`View tasks for ${subject.name}`}
            >
              <span className="progress-subject-row__heading">
                <span className="subject-chip__dot" aria-hidden="true" />
                <strong>{subject.name}</strong>
                {subject.isSample && <Badge>Sample</Badge>}
              </span>
              <span className="progress-subject-row__percent">{progress.percent}%</span>
              <span className="progress-subject-row__bar">
                <ProgressBar value={progress.percent} label={`${subject.name} completion`} color={subject.color} />
              </span>
              <span className="progress-subject-row__details">
                {progress.total === 0
                  ? 'No tasks yet'
                  : `${progress.completed} of ${progress.total} completed · ${progress.pending} pending · ${progress.overdue} overdue`}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
