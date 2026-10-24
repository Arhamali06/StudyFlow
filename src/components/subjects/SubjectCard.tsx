import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Pencil, Trash2 } from 'lucide-react'
import Badge from '../ui/Badge'
import ProgressBar from '../ui/ProgressBar'
import type { SubjectProgress } from '../../lib/statistics'
import type { Subject } from '../../types'

interface SubjectCardProps {
  subject: Subject
  progress: SubjectProgress
  onEdit: (subject: Subject) => void
  onDelete: (subject: Subject) => void
}

export default function SubjectCard({ subject, progress, onEdit, onDelete }: SubjectCardProps) {
  const style = { '--subject-color': subject.color } as CSSProperties

  return (
    <article className="card subject-card" style={style}>
      <div className="subject-card__top">
        <span className="subject-card__icon">
          <BookOpen size={22} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="subject-card__actions">
          <button
            type="button"
            className="icon-button icon-button--subtle icon-button--sm"
            onClick={() => onEdit(subject)}
            aria-label={`Edit ${subject.name}`}
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-button icon-button--subtle icon-button--sm icon-button--danger"
            onClick={() => onDelete(subject)}
            aria-label={`Delete ${subject.name}`}
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="subject-card__heading">
        <h2 className="subject-card__name">{subject.name}</h2>
        {subject.isSample && <Badge>Sample</Badge>}
      </div>

      <p className="subject-card__count">
        {progress.total}
        <span className="subject-card__unit">{progress.total === 1 ? 'task' : 'tasks'}</span>
      </p>

      <div className="subject-card__progress">
        <ProgressBar value={progress.percent} label={`${subject.name} completion`} color={subject.color} />
        <p className="subject-card__progress-text">
          {progress.total === 0
            ? 'No tasks yet'
            : `${progress.completed} of ${progress.total} completed · ${progress.percent}%`}
        </p>
      </div>

      <Link className="btn btn--secondary btn--sm subject-card__link" to={`/tasks?subject=${subject.id}`}>
        View tasks
      </Link>
    </article>
  )
}
