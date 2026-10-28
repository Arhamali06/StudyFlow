import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '../../hooks/useToast'
import { AUTH_CONFIG, checkCredentials, EMAIL_PATTERN, setAuthenticated } from '../../lib/auth'
import { focusField } from './focusField'
import { PasswordInput } from './PasswordInput'

interface Errors {
  email?: string
  password?: string
}

export function LoginForm() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [failed, setFailed] = useState(false)
  const [shaking, setShaking] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    setFailed(false)

    const next: Errors = {}
    if (!email.trim()) next.email = 'Email is required.'
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Password is required.'
    setErrors(next)

    if (next.email || next.password) {
      focusField(next.email ? 'login-email' : 'login-password')
      return
    }
    if (!checkCredentials(email, password)) {
      setFailed(true)
      setShaking(true)
      focusField('login-password')
      return
    }
    setAuthenticated(remember)
    navigate('/dashboard', { replace: true })
  }

  function fillDemoAccount() {
    setEmail(AUTH_CONFIG.email)
    setPassword(AUTH_CONFIG.password)
    setErrors({})
    setFailed(false)
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

      <button className="auth-submit" type="submit">Log in</button>

      <div className="auth-meta">
        <p className="auth-footer">
          New to StudyFlow? <Link to="/signup">Create an account</Link>
        </p>
        <p className="auth-demo">
          Demo login: {AUTH_CONFIG.email} / {AUTH_CONFIG.password}{' '}
          <button type="button" className="auth-link auth-link--small" onClick={fillDemoAccount}>Fill it in</button>
        </p>
      </div>
    </form>
  )
}
