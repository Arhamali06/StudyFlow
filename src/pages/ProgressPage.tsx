import { ChartColumn } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

/** Phase 1 skeleton. The real Progress page is built in Phase 7. */
export default function ProgressPage() {
  useDocumentTitle('Progress')

  return (
    <>
      <PageHeader title="Progress" subtitle="Track how your studies are going." />
      <div className="card">
        <EmptyState
          icon={ChartColumn}
          title="Your progress will appear here"
          description="Charts and completion stats are built in Phase 7."
        />
      </div>
    </>
  )
}
