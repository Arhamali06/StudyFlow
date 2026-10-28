import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '../../hooks/useToast'
import { AUTH_CONFIG, setAuthenticated } from '../../lib/auth'
import { PasswordInput } from './PasswordInput'

export function LoginForm() {
  const navigate = useNavigate(); const { showToast } = useToast()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({}); const [failed, setFailed] = useState(false)
  function submit(event: FormEvent) { event.preventDefault(); setFailed(false)
    const next: Record<string, string> = {}
    if (!email.trim()) next.email = 'Email is required.'; else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Password is required.'
    setErrors(next); if (Object.keys(next).length) return
    if (email.trim().toLowerCase() !== AUTH_CONFIG.email || password !== AUTH_CONFIG.password) { setFailed(true); return }
    setAuthenticated(remember); navigate('/dashboard', { replace: true })
  }
  return <form className={`auth-card${failed ? ' auth-card--shake' : ''}`} onSubmit={submit} noValidate>
    <header><h2>Welcome back</h2><p>Log in to pick up where you left off.</p></header>
    <div className="auth-field"><label htmlFor="login-email">Email</label><input id="login-email" type="email" autoComplete="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'login-email-error' : undefined} />{errors.email && <p className="auth-error" id="login-email-error">{errors.email}</p>}</div>
    <PasswordInput id="login-password" label="Password" placeholder="Enter your password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
    <div className="auth-options"><label className="check-label"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />Remember me</label><button type="button" className="auth-link" onClick={() => showToast("Password reset isn't available in this demo.", 'info')}>Forgot password?</button></div>
    {failed && <p className="auth-error auth-error--form" role="alert">Incorrect email or password.</p>}
    <button className="auth-submit" type="submit">Log in</button>
    <p className="auth-footer">New to StudyFlow? <Link to="/signup">Create an account</Link></p><p className="auth-demo">Demo login: admin123@gmail.com / admin123</p>
  </form>
}
