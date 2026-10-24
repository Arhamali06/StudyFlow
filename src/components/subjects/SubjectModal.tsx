import Modal from '../ui/Modal'
import SubjectForm from './SubjectForm'
import { useAppData } from '../../hooks/useAppData'
import { useToast } from '../../hooks/useToast'
import type { Subject, SubjectInput } from '../../types'

interface SubjectModalProps {
  /** The subject being edited, or undefined to create a new one. */
  subject?: Subject
  onClose: () => void
}

/** Add / edit subject dialog. Mount it only while it should be open. */
export default function SubjectModal({ subject, onClose }: SubjectModalProps) {
  const { subjects, addSubject, updateSubject } = useAppData()
  const { showToast } = useToast()

  function handleSubmit(values: SubjectInput): string | null {
    const result = subject ? updateSubject(subject.id, values) : addSubject(values)
    if (!result.ok) return result.error

    showToast(subject ? `Updated “${result.data.name}”` : `Added “${result.data.name}”`)
    onClose()
    return null
  }

  return (
    <Modal title={subject ? 'Edit subject' : 'New subject'} onClose={onClose} size="sm">
      <SubjectForm subject={subject} subjects={subjects} onSubmit={handleSubmit} onCancel={onClose} />
    </Modal>
  )
}
