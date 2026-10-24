import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Button from '../ui/Button'

interface QuickAddCardProps {
  hasSubjects: boolean
  onAddTask: () => void
}

export default function QuickAddCard({
  hasSubjects,
  onAddTask,
}: QuickAddCardProps) {
  return (
    <section className="card card--dark" aria-labelledby="quick-add-title">
      <h2 id="quick-add-title" className="card__title">
        Quick add task
      </h2>
      <p className="card__subtitle">Create a task in two clicks from here.</p>
      <div className="dash-quick__action">
        {hasSubjects ? (
          <Button
            className="btn--on-dark"
            icon={<Plus size={18} aria-hidden="true" />}
            onClick={onAddTask}
          >
            New task
          </Button>
        ) : (
          <Link className="dash-quick__link" to="/subjects">
            Create a subject first →
          </Link>
        )}
      </div>
    </section>
  )
}
