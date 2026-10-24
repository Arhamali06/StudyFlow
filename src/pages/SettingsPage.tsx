import { Settings } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

/** Phase 1 skeleton. The real Settings page is built in Phase 8. */
export default function SettingsPage() {
  useDocumentTitle('Settings')

  return (
    <>
      <PageHeader title="Settings" subtitle="Make StudyFlow work the way you like." />
      <div className="card">
        <EmptyState
          icon={Settings}
          title="Settings will appear here"
          description="Themes and data options are built in Phase 8."
        />
      </div>
    </>
  )
}
