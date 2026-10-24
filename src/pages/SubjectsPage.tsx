import { useMemo, useState } from 'react'
import { BookOpen, Plus } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import SubjectCard from '../components/subjects/SubjectCard'
import SubjectModal from '../components/subjects/SubjectModal'
import DeleteSubjectDialog from '../components/subjects/DeleteSubjectDialog'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { useAppData } from '../hooks/useAppData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useToast } from '../hooks/useToast'
import { getProgressForSubject, getSubjectProgressMap } from '../lib/statistics'
import type { Subject, SubjectDeletionStrategy } from '../types'

export default function SubjectsPage() {
  useDocumentTitle('My Subjects')
  const { subjects, tasks, deleteSubject, loadSampleData } = useAppData()
  const { showToast } = useToast()

  // Which dialog is open: creating, editing one subject, or deleting one.
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const progressMap = useMemo(() => getSubjectProgressMap(tasks), [tasks])
  const editingSubject = subjects.find((subject) => subject.id === editingId)
  const deletingSubject = subjects.find((subject) => subject.id === deletingId)

  function handleLoadSample() {
    const result = loadSampleData()
    if (result.ok) showToast('Sample data loaded')
    else showToast(result.error, 'error')
  }

  function handleDelete(subject: Subject, strategy: SubjectDeletionStrategy) {
    const taskCount = getProgressForSubject(progressMap, subject.id).total
    const taskWord = taskCount === 1 ? 'task' : 'tasks'
    const targetName =
      strategy.mode === 'move-tasks'
        ? subjects.find((other) => other.id === strategy.targetSubjectId)?.name
        : undefined

    const result = deleteSubject(subject.id, strategy)
    setDeletingId(null)

    if (!result.ok) {
      showToast(result.error, 'error')
    } else if (strategy.mode === 'move-tasks' && taskCount > 0) {
      showToast(`Deleted “${subject.name}” and moved ${taskCount} ${taskWord} to “${targetName}”`)
    } else if (taskCount > 0) {
      showToast(`Deleted “${subject.name}” and ${taskCount} ${taskWord}`)
    } else {
      showToast(`Deleted “${subject.name}”`)
    }
  }

  return (
    <>
      <PageHeader
        title="My Subjects"
        subtitle="Organize your courses with colors."
        actions={
          subjects.length > 0 && (
            <Button icon={<Plus size={18} aria-hidden="true" />} onClick={() => setIsCreating(true)}>
              New subject
            </Button>
          )
        }
      />

      {subjects.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={BookOpen}
            title="No subjects yet"
            description="Subjects group your tasks, like Math or Physics. Add your first one to get started."
            action={
              <div className="button-row">
                <Button icon={<Plus size={18} aria-hidden="true" />} onClick={() => setIsCreating(true)}>
                  Add subject
                </Button>
                <Button variant="secondary" onClick={handleLoadSample}>
                  Load sample data
                </Button>
              </div>
            }
          />
        </div>
      ) : (
        <ul className="subject-grid" aria-label="Your subjects">
          {subjects.map((subject) => (
            <li key={subject.id}>
              <SubjectCard
                subject={subject}
                progress={getProgressForSubject(progressMap, subject.id)}
                onEdit={(item) => setEditingId(item.id)}
                onDelete={(item) => setDeletingId(item.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {isCreating && <SubjectModal onClose={() => setIsCreating(false)} />}
      {editingSubject && <SubjectModal subject={editingSubject} onClose={() => setEditingId(null)} />}
      {deletingSubject && (
        <DeleteSubjectDialog
          subject={deletingSubject}
          taskCount={getProgressForSubject(progressMap, deletingSubject.id).total}
          otherSubjects={subjects.filter((other) => other.id !== deletingSubject.id)}
          onConfirm={(strategy) => handleDelete(deletingSubject, strategy)}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </>
  )
}
