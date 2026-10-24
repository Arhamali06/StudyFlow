import { CalendarDays } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

/** Phase 1 skeleton. The real Calendar page is built in Phase 6. */
export default function CalendarPage() {
  useDocumentTitle('Calendar')

  return (
    <>
      <PageHeader title="Calendar" subtitle="See your deadlines by date." />
      <div className="card">
        <EmptyState
          icon={CalendarDays}
          title="Your calendar will appear here"
          description="The monthly calendar is built in Phase 6."
        />
      </div>
    </>
  )
}
