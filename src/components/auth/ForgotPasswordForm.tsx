import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/authContext'

export function ForgotPasswordForm() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Enter a valid email address.')
      return
    }
    setLoading(true)
    const result = await requestPasswordReset(email.trim())
    setLoading(false)
    if (result.error && (result.error.startsWith('Too many') || result.error.startsWith("Can't reach"))) setError(result.error)
    else setSent(true)
  }

  return (
    <form className="auth-card" onSubmit={submit} noValidate>
      <header><h2>Reset your password</h2><p>We’ll send a secure link to your email address.</p></header>
      {sent ? <p className="auth-success" role="status">If an account exists for that email, we've sent a reset link.</p> : (
        <div className="auth-field">
          <label htmlFor="forgot-email">Email</label>
          <input id="forgot-email" type="email" inputMode="email" autoComplete="email" placeholder="you@university.edu" value={email} onChange={(event) => { setEmail(event.target.value); setError('') }} aria-invalid={Boolean(error)} />
          {error && <p className="auth-error" role="alert">{error}</p>}
        </div>
      )}
      {!sent && <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</button>}
      <div className="auth-meta"><p className="auth-footer"><Link to="/login">Back to log in</Link></p></div>
    </form>
  )
}
