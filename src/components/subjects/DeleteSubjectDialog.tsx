import { useState } from 'react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import Select from '../ui/Select'
import type { Subject, SubjectDeletionStrategy } from '../../types'

interface DeleteSubjectDialogProps {
  subject: Subject
  /** How many tasks belong to this subject. */
  taskCount: number
  /** Every OTHER subject (tasks can be moved to one of these). */
  otherSubjects: Subject[]
  onConfirm: (strategy: SubjectDeletionStrategy) => void
  onCancel: () => void
}

type Choice = 'move' | 'delete'

/**
 * Deleting a subject never leaves orphaned tasks. If the subject has tasks the
 * person chooses: move them to another subject, or delete them with it.
 * ("Cancel" is the third option.)
 */
export default function DeleteSubjectDialog({
  subject,
  taskCount,
  otherSubjects,
  onConfirm,
  onCancel,
}: DeleteSubjectDialogProps) {
  const canMove = otherSubjects.length > 0
  const [choice, setChoice] = useState<Choice>(canMove ? 'move' : 'delete')
  const [targetId, setTargetId] = useState(otherSubjects[0]?.id ?? '')

  const taskWord = taskCount === 1 ? 'task' : 'tasks'

  function handleConfirm() {
    if (taskCount === 0 || choice === 'delete') {
      onConfirm({ mode: 'delete-tasks' })
    } else {
      onConfirm({ mode: 'move-tasks', targetSubjectId: targetId })
    }
  }

  // No tasks: a simple confirmation is enough.
  if (taskCount === 0) {
    return (
      <Modal title="Delete subject?" onClose={onCancel} size="sm">
        <p className="modal__text">“{subject.name}” has no tasks. This can’t be undone.</p>
        <div className="modal__footer">
          <Button variant="secondary" onClick={onCancel} data-autofocus>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            Delete subject
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Delete subject?" onClose={onCancel} size="sm">
      <p className="modal__text">
        “{subject.name}” has {taskCount} {taskWord}. Choose what should happen to{' '}
        {taskCount === 1 ? 'it' : 'them'}:
      </p>

      <fieldset className="choice-list">
        <legend className="visually-hidden">What to do with the tasks</legend>

        {canMove && (
          <label className={`choice${choice === 'move' ? ' is-selected' : ''}`}>
            <input
              type="radio"
              name="delete-choice"
              checked={choice === 'move'}
              onChange={() => setChoice('move')}
              data-autofocus
            />
            <span className="choice__text">
              <span className="choice__title">Move {taskWord} to another subject</span>
              <span className="choice__hint">Nothing is lost. Only “{subject.name}” is removed.</span>
            </span>
          </label>
        )}

        {canMove && choice === 'move' && (
          <div className="choice__extra">
            <label className="field__label" htmlFor="move-target">
              Move to
            </label>
            <Select id="move-target" value={targetId} onChange={(event) => setTargetId(event.target.value)}>
              {otherSubjects.map((other) => (
                <option key={other.id} value={other.id}>
                  {other.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        <label className={`choice${choice === 'delete' ? ' is-selected' : ''}`}>
          <input
            type="radio"
            name="delete-choice"
            checked={choice === 'delete'}
            onChange={() => setChoice('delete')}
            data-autofocus={canMove ? undefined : true}
          />
          <span className="choice__text">
            <span className="choice__title">
              Delete the subject and its {taskCount} {taskWord}
            </span>
            <span className="choice__hint">This can’t be undone.</span>
          </span>
        </label>
      </fieldset>

      <div className="modal__footer">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant={choice === 'delete' ? 'danger' : 'primary'} onClick={handleConfirm}>
          {choice === 'delete' ? 'Delete subject and tasks' : 'Move tasks and delete'}
        </Button>
      </div>
    </Modal>
  )
}
