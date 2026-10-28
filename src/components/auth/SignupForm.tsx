import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '../../hooks/useToast'
import { EMAIL_PATTERN } from '../../lib/auth'
import { focusField } from './focusField'
import { PasswordInput } from './PasswordInput'
import { PasswordStrength } from './PasswordStrength'

interface Errors {
  name?: string
  email?: string
  password?: string
  terms?: string
}

type Field = keyof Errors

const FIELD_IDS: Record<Field, string> = {
  name: 'signup-name',
  email: 'signup-email',
  password: 'signup-password',
  terms: 'signup-terms',
}

export function SignupForm() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const timers = useRef<number[]>([])

  // Never leave a timer running after the user navigates away.
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((timer) => window.clearTimeout(timer))
  }, [])

  function clearError(field: Field) {
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (loading || success) return

    const next: Errors = {}
    if (name.trim().length < 2) next.name = 'Enter at least 2 characters.'
    if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Enter a valid email address.'
    if (password.length < 8 || !/\d/.test(password)) next.password = 'Use at least 8 characters and one number.'
    if (!terms) next.terms = 'Please agree to the Terms and Privacy Policy.'
    setErrors(next)

    const firstInvalid = (Object.keys(FIELD_IDS) as Field[]).find((field) => next[field])
    if (firstInvalid) {
      focusField(FIELD_IDS[firstInvalid])
      return
    }

    // There is no database yet, so nothing is saved. We only simulate the request.
    setLoading(true)
    timers.current.push(
      window.setTimeout(() => {
        setLoading(false)
        setSuccess(true)
        timers.current.push(window.setTimeout(() => navigate('/login'), 1500))
      }, 800),
    )
  }

  const demoNotice = () => showToast("Terms and Privacy pages aren't available in this demo.", 'info')

  return (
    <form className="auth-card" onSubmit={submit} noValidate>
      <header>
        <h2>Create your account</h2>
        <p>Start organising your studies in a minute.</p>
      </header>

      <fieldset className="auth-fieldset" disabled={loading || success}>
        <div className="auth-field">
          <label htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              clearError('name')
            }}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'signup-name-error' : undefined}
          />
          {errors.name && <p className="auth-error" id="signup-name-error">{errors.name}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@university.edu"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              clearError('email')
            }}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'signup-email-error' : undefined}
          />
          {errors.email && <p className="auth-error" id="signup-email-error">{errors.email}</p>}
        </div>

        <PasswordInput
          id="signup-password"
          name="new-password"
          label="Password"
          autoComplete="new-password"
          placeholder="Create a password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            clearError('password')
          }}
          error={errors.password}
          describedBy="signup-password-hint"
        />
        <PasswordStrength password={password} id="signup-password-hint" />

        <label className="check-label check-label--terms">
          <input
            id="signup-terms"
            type="checkbox"
            checked={terms}
            onChange={(event) => {
              setTerms(event.target.checked)
              clearError('terms')
            }}
            aria-invalid={Boolean(errors.terms)}
            aria-describedby={errors.terms ? 'signup-terms-error' : undefined}
          />
          <span>
            I agree to the{' '}
            <button type="button" className="auth-link" onClick={demoNotice}>Terms</button> and{' '}
            <button type="button" className="auth-link" onClick={demoNotice}>Privacy Policy</button>
          </span>
        </label>
        {errors.terms && <p className="auth-error" id="signup-terms-error">{errors.terms}</p>}
      </fieldset>

      {success && (
        <p className="auth-success" role="status">
          Account created! Backend isn't connected yet, so please log in with the demo account.
        </p>
      )}

      <button className="auth-submit" type="submit" disabled={loading || success}>
        {loading ? 'Creating account…' : success ? 'Account created' : 'Create account'}
      </button>

      <div className="auth-meta">
        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </form>
  )
}
