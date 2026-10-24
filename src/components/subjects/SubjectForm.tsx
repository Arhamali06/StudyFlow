import { useMemo, type CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check } from 'lucide-react'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import { DEFAULT_SUBJECT_COLOR, SUBJECT_COLORS, SUBJECT_NAME_MAX_LENGTH } from '../../lib/constants'
import { pickUnusedColor } from '../../lib/subjects'
import { createSubjectFormSchema, type SubjectFormValues } from '../../schemas/subjectSchema'
import type { Subject } from '../../types'

interface SubjectFormProps {
  /** Pass a subject to edit it; leave out to create a new one. */
  subject?: Subject
  /** All current subjects (used to stop duplicate names and suggest a color). */
  subjects: Subject[]
  /** Return an error message to show in the form, or null when saving worked. */
  onSubmit: (values: SubjectFormValues) => string | null
  onCancel: () => void
}

export default function SubjectForm({ subject, subjects, onSubmit, onCancel }: SubjectFormProps) {
  const schema = useMemo(
    () =>
      createSubjectFormSchema(
        subjects.filter((other) => other.id !== subject?.id).map((other) => other.name),
      ),
    [subjects, subject?.id],
  )

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: subject?.name ?? '',
      color: subject?.color ?? (pickUnusedColor(subjects) || DEFAULT_SUBJECT_COLOR),
    },
  })

  const submit = handleSubmit((values) => {
    const error = onSubmit(values)
    if (error) setError('root.server', { message: error })
  })

  return (
    <form className="form" onSubmit={submit} noValidate>
      <FormField id="subject-name" label="Subject name" error={errors.name?.message}>
        <input
          id="subject-name"
          className="input"
          type="text"
          placeholder="e.g. Mathematics"
          autoComplete="off"
          maxLength={SUBJECT_NAME_MAX_LENGTH + 10}
          data-autofocus
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'subject-name-error' : undefined}
          {...register('name')}
        />
      </FormField>

      <fieldset className="field field--group">
        <legend className="field__label">Color</legend>
        <div className="swatches">
          {SUBJECT_COLORS.map((color) => (
            <label
              className="swatch"
              key={color.value}
              style={{ '--swatch-color': color.value } as CSSProperties}
            >
              <input type="radio" value={color.value} aria-label={color.name} {...register('color')} />
              <span className="swatch__dot">
                <Check size={16} strokeWidth={3} aria-hidden="true" />
              </span>
            </label>
          ))}
        </div>
        {errors.color && (
          <p className="field__error" role="alert">
            {errors.color.message}
          </p>
        )}
      </fieldset>

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
          {subject ? 'Save changes' : 'Add subject'}
        </Button>
      </div>
    </form>
  )
}
