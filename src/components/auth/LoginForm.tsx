import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { useToast } from '../../hooks/useToast'
import { focusField } from './focusField'
import { PasswordInput } from './PasswordInput'

interface Errors {
  email?: string
  password?: string
}

export function LoginForm() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [failed, setFailed] = useState(false)
  const [shaking, setShaking] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (loading) return
    setFailed(false)

    const next: Errors = {}
    if (!email.trim()) next.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Password is required.'
    setErrors(next)

    if (next.email || next.password) {
      focusField(next.email ? 'login-email' : 'login-password')
      return
    }
    setLoading(true)
    const result = await signIn(email.trim(), password)
    setLoading(false)
    if (result.error) {
      setFailed(true)
      setShaking(true)
      focusField('login-password')
      return
    }
    navigate('/dashboard', { replace: true })
  }

  return (
    <form
      className={`auth-card${shaking ? ' auth-card--shake' : ''}`}
      onSubmit={submit}
      onAnimationEnd={() => setShaking(false)}
      noValidate
    >
      <header>
        <h2>Welcome back</h2>
        <p>Log in to pick up where you left off.</p>
      </header>

      <div className="auth-field">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
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
            setFailed(false)
            if (errors.email) setErrors((current) => ({ ...current, email: undefined }))
          }}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
        />
        {errors.email && <p className="auth-error" id="login-email-error">{errors.email}</p>}
      </div>

      <PasswordInput
        id="login-password"
        name="password"
        label="Password"
        placeholder="Enter your password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value)
          setFailed(false)
          if (errors.password) setErrors((current) => ({ ...current, password: undefined }))
        }}
        error={errors.password}
      />

      <div className="auth-options">
        <label className="check-label">
          <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
          Remember me
        </label>
        <button
          type="button"
          className="auth-link"
          onClick={() => showToast("Password reset isn't available in this demo.", 'info')}
        >
          Forgot password?
        </button>
      </div>

      {failed && <p className="auth-error auth-error--form" role="alert">Incorrect email or password.</p>}

      <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Log in'}</button>

      <div className="auth-meta">
        <p className="auth-footer">
          New to StudyFlow? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </form>
  )
}
