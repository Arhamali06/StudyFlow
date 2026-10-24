import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import Badge from '../ui/Badge'
import ProgressBar from '../ui/ProgressBar'
import { getProgressForSubject, type SubjectProgress } from '../../lib/statistics'
import type { Subject } from '../../types'

interface SubjectProgressListProps {
  subjects: Subject[]
  progressMap: Map<string, SubjectProgress>
}

export default function SubjectProgressList({
  subjects,
  progressMap,
}: SubjectProgressListProps) {
  return (
    <section className="card" aria-labelledby="subject-progress-title">
      <h2 id="subject-progress-title" className="card__title">
        Subject progress
      </h2>
      <p className="card__subtitle">Completion by subject</p>

      {subjects.length === 0 ? (
        <p className="dash-subjects__empty">
          <BookOpen
            size={18}
            aria-hidden="true"
            style={{ display: 'inline', verticalAlign: 'text-bottom' }}
          />{' '}
          No subjects yet.{' '}
          <Link to="/subjects" className="dash-subjects__link">
            Add a subject
          </Link>{' '}
          to start tracking.
        </p>
      ) : (
        <ul className="dash-subjects__list">
          {subjects.map((subject) => {
            const progress = getProgressForSubject(progressMap, subject.id)
            return (
              <li key={subject.id}>
                <Link
                  to={`/tasks?subject=${subject.id}`}
                  className="dash-subjects__item"
                >
                  <span
                    className="subject-chip__dot"
                    style={
                      { '--subject-color': subject.color } as CSSProperties
                    }
                    aria-hidden="true"
                  />
                  <span className="dash-subjects__name">{subject.name}</span>
                  {subject.isSample && <Badge>Sample</Badge>}
                  <span className="dash-subjects__percent">
                    {progress.percent}%
                  </span>
                  <ProgressBar
                    value={progress.percent}
                    label={`${subject.name} completion`}
                    color={subject.color}
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
