import type { ReactNode } from 'react'

interface FormFieldProps {
  /** Must match the `id` of the control inside. */
  id: string
  label: string
  /** Validation message. The control should set aria-describedby="{id}-error". */
  error?: string
  optional?: boolean
  children: ReactNode
}

/** Label + control + error message, wired together for accessibility. */
export default function FormField({ id, label, error, optional, children }: FormFieldProps) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
        {optional && <span className="field__optional"> (optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
