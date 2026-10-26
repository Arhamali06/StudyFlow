import { BookOpen, ListChecks } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'

interface ProgressEmptyStateProps {
  onLoadSample: () => void
}

export default function ProgressEmptyState({ onLoadSample }: ProgressEmptyStateProps) {
  return (
    <div className="card">
      <EmptyState
        icon={BookOpen}
        title="Start tracking your progress"
        description="Add a subject and tasks to see your completion statistics here."
        action={
          <div className="button-row">
            <Link className="btn btn--primary btn--md" to="/subjects">Add a subject</Link>
            <Button variant="secondary" onClick={onLoadSample}>Load sample data</Button>
          </div>
        }
      />
    </div>
  )
}

export function ProgressNoTasksState() {
  return (
    <div className="card progress-empty">
      <EmptyState
        icon={ListChecks}
        title="No tasks yet"
        description="Progress appears once you add tasks to your subjects."
        action={<Link className="btn btn--secondary btn--md" to="/tasks">Add a task</Link>}
      />
    </div>
  )
}
