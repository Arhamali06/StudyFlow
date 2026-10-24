import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Page not found')

  return (
    <>
      <PageHeader title="Page not found" subtitle="That address doesn’t exist in StudyFlow." />
      <div className="card">
        <EmptyState
          icon={Compass}
          title="Nothing here"
          description="Check the link, or head back to your dashboard."
          action={
            <Link className="btn btn--primary btn--md" to="/">
              Go to dashboard
            </Link>
          }
        />
      </div>
    </>
  )
}
