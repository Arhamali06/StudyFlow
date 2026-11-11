import Modal from '../ui/Modal'
import TaskForm from './TaskForm'
import { useAppData } from '../../hooks/useAppData'
import { useToast } from '../../hooks/useToast'
import type { TaskFormValues } from '../../schemas/taskSchema'
import type { Task } from '../../types'

interface TaskModalProps {
  /** The task being edited, or undefined to create a new one. */
  task?: Task
  /** Pre-filled values for a new task. */
  initialValues?: Partial<TaskFormValues>
  onClose: () => void
}

export default function TaskModal({ task, initialValues, onClose }: TaskModalProps) {
  const { subjects, addTask, updateTask } = useAppData()
  const { showToast } = useToast()

  async function handleSubmit(values: TaskFormValues): Promise<string | null> {
    const result = await (task ? updateTask(task.id, values) : addTask(values))
    if (!result.ok) return result.error

    showToast(task ? `Updated “${result.data.title}”` : `Added “${result.data.title}”`)
    onClose()
    return null
  }

  return (
    <Modal title={task ? 'Edit task' : 'New task'} onClose={onClose}>
      <TaskForm
        task={task}
        initialValues={initialValues}
        subjects={subjects}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  )
}
