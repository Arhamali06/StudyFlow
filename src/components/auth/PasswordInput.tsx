import { Eye, EyeOff } from 'lucide-react'
import { useState, type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; describedBy?: string }

export function PasswordInput({ label, error, describedBy, id, ...props }: Props) {
  const [visible, setVisible] = useState(false)
  const errorId = error ? `${id}-error` : undefined
  const described = [errorId, describedBy].filter(Boolean).join(' ') || undefined
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-control">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={described}
          autoCapitalize="none"
          spellCheck={false}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={22} aria-hidden="true" /> : <Eye size={22} aria-hidden="true" />}
        </button>
      </div>
      {error && <p className="auth-error" id={errorId}>{error}</p>}
    </div>
  )
}
