import { Eye, EyeOff } from 'lucide-react'
import { useState, type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }
export function PasswordInput({ label, error, id, ...props }: Props) {
  const [visible, setVisible] = useState(false)
  const description = error ? `${id}-error` : undefined
  return <div className="auth-field"><label htmlFor={id}>{label}</label><div className="password-control"><input id={id} type={visible ? 'text' : 'password'} aria-invalid={Boolean(error)} aria-describedby={description} {...props} /><button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={22} /> : <Eye size={22} />}</button></div>{error && <p className="auth-error" id={description}>{error}</p>}</div>
}
