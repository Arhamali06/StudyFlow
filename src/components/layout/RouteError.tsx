import { CircleAlert } from 'lucide-react'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

/**
 * Shown when a page crashes while rendering. It replaces the page (not the sidebar),
 * so the app never turns into a blank screen. Your saved data is not affected.
 */
export default function RouteError() {
  useDocumentTitle('Something went wrong')

  return (
    <div className="card">
      <EmptyState
        icon={CircleAlert}
        title="Something went wrong"
        description="This page hit an unexpected problem. Your saved tasks and subjects are safe. Try reloading, or go back to the dashboard."
        action={
          <div className="button-row">
            <Button onClick={() => window.location.reload()}>Reload page</Button>
            {/* A normal link (full page load) so a broken screen can't keep the error alive. */}
            <a className="btn btn--secondary btn--md" href="/">Go to dashboard</a>
          </div>
        }
      />
    </div>
  )
}
