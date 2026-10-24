import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import TaskForm from './TaskForm'
import { useAppData } from '../../hooks/useAppData'
import { useToast } from '../../hooks/useToast'
import type { TaskFormValues } from '../../schemas/taskSchema'
import type { Task } from '../../types'

interface TaskDrawerProps {
  task?: Task
  initialValues?: Partial<TaskFormValues>
  onClose: () => void
}

export default function TaskDrawer({ task, initialValues, onClose }: TaskDrawerProps) {
  const { subjects, addTask, updateTask } = useAppData()
  const { showToast } = useToast()
  const drawerRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const drawer = drawerRef.current
    if (!drawer) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    if (!drawer.open) drawer.showModal()
    drawer.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [])

  function handleSubmit(values: TaskFormValues): string | null {
    const result = task ? updateTask(task.id, values) : addTask(values)
    if (!result.ok) return result.error

    showToast(task ? `Updated “${result.data.title}”` : `Added “${result.data.title}”`)
    onClose()
    return null
  }

  return (
    <dialog
      ref={drawerRef}
      className="task-drawer"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="task-drawer__panel">
        <div className="task-drawer__header">
          <h2 id={titleId} className="modal__title">
            {task ? 'Task details' : 'New task'}
          </h2>
          <button type="button" className="icon-button icon-button--subtle" onClick={onClose} aria-label="Close task drawer">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="task-drawer__body">
          <TaskForm
            task={task}
            initialValues={initialValues}
            subjects={subjects}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </dialog>
  )
}
