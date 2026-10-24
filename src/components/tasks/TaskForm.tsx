import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import Select from '../ui/Select'
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  TASK_TYPE_LABELS,
  TASK_TYPES,
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
} from '../../lib/constants'
import { taskFormSchema, type TaskFormValues } from '../../schemas/taskSchema'
import type { Subject, Task } from '../../types'

interface TaskFormProps {
  /** Pass a task to edit it; leave out to create a new one. */
  task?: Task
  /** Pre-filled values for a NEW task (for example a date picked on the calendar). */
  initialValues?: Partial<TaskFormValues>
  subjects: Subject[]
  /** Return an error message to show in the form, or null when saving worked. */
  onSubmit: (values: TaskFormValues) => string | null
  onCancel: () => void
}

export default function TaskForm({ task, initialValues, subjects, onSubmit, onCancel }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title ?? initialValues?.title ?? '',
      description: task?.description ?? initialValues?.description ?? '',
      // With a single subject there is nothing to choose, so pre-select it.
      subjectId: task?.subjectId ?? initialValues?.subjectId ?? (subjects.length === 1 ? subjects[0].id : ''),
      type: task?.type ?? initialValues?.type ?? 'assignment',
      dueDate: task?.dueDate ?? initialValues?.dueDate ?? '',
      priority: task?.priority ?? initialValues?.priority ?? 'medium',
      status: task?.status ?? initialValues?.status ?? 'pending',
    },
  })

  const submit = handleSubmit((values) => {
    const error = onSubmit(values)
    if (error) setError('root.server', { message: error })
  })

  const describedBy = (field: keyof TaskFormValues) => (errors[field] ? `task-${field}-error` : undefined)

  return (
    <form className="form" onSubmit={submit} noValidate>
      <FormField id="task-title" label="Title" error={errors.title?.message}>
        <input
          id="task-title"
          className="input"
          type="text"
          placeholder="e.g. Calculus problem set"
          autoComplete="off"
          maxLength={TASK_TITLE_MAX_LENGTH + 20}
          data-autofocus
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={describedBy('title')}
          {...register('title')}
        />
      </FormField>

      <FormField id="task-description" label="Description" optional error={errors.description?.message}>
        <textarea
          id="task-description"
          className="input textarea"
          rows={3}
          placeholder="Add any details you want to remember"
          maxLength={TASK_DESCRIPTION_MAX_LENGTH + 50}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={describedBy('description')}
          {...register('description')}
        />
      </FormField>

      <div className="form__row">
        <FormField id="task-subjectId" label="Subject" error={errors.subjectId?.message}>
          <Select
            id="task-subjectId"
            aria-invalid={errors.subjectId ? true : undefined}
            aria-describedby={describedBy('subjectId')}
            {...register('subjectId')}
          >
            <option value="">Select a subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="task-type" label="Task type" error={errors.type?.message}>
          <Select id="task-type" {...register('type')}>
            {TASK_TYPES.map((type) => (
              <option key={type} value={type}>
                {TASK_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField id="task-dueDate" label="Due date" error={errors.dueDate?.message}>
        <input
          id="task-dueDate"
          className="input"
          type="date"
          aria-invalid={errors.dueDate ? true : undefined}
          aria-describedby={describedBy('dueDate')}
          {...register('dueDate')}
        />
      </FormField>

      <div className="form__row">
        <fieldset className="field field--group">
          <legend className="field__label">Priority</legend>
          <div className="segmented">
            {TASK_PRIORITIES.map((priority) => (
              <label className="segmented__option" key={priority}>
                <input type="radio" value={priority} {...register('priority')} />
                <span>{TASK_PRIORITY_LABELS[priority]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="field field--group">
          <legend className="field__label">Status</legend>
          <div className="segmented">
            {TASK_STATUSES.map((status) => (
              <label className="segmented__option" key={status}>
                <input type="radio" value={status} {...register('status')} />
                <span>{TASK_STATUS_LABELS[status]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {errors.root?.server && (
        <p className="form__error" role="alert">
          {errors.root.server.message}
        </p>
      )}

      <div className="modal__footer">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {task ? 'Save changes' : 'Add task'}
        </Button>
      </div>
    </form>
  )
}
