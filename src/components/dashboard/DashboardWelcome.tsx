import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'

interface DashboardWelcomeProps {
  onLoadSample: () => void
}

export default function DashboardWelcome({
  onLoadSample,
}: DashboardWelcomeProps) {
  return (
    <div className="card">
      <EmptyState
        icon={Sparkles}
        title="Welcome to StudyFlow!"
        description="Start by adding your first subject, or load sample data to explore the app."
        action={
          <div className="button-row">
            <Link className="btn btn--primary btn--md" to="/subjects">
              Add a subject
            </Link>
            <Button variant="secondary" onClick={onLoadSample}>
              Load sample data
            </Button>
          </div>
        }
      />
    </div>
  )
}
