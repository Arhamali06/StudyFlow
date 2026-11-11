import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import EmptyState from '../ui/EmptyState'

export default function DashboardWelcome() {
  return (
    <div className="card">
      <EmptyState
        icon={Sparkles}
        title="Welcome to StudyFlow!"
        description="Start by adding your first subject to get organized."
        action={
          <div className="button-row">
            <Link className="btn btn--primary btn--md" to="/subjects">
              Add a subject
            </Link>
          </div>
        }
      />
    </div>
  )
}
