import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { PasswordInput } from './PasswordInput'
import { PasswordStrength } from './PasswordStrength'

export function ResetPasswordForm() {
  const navigate = useNavigate()
  const { session, updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!session) { setPassword(''); setConfirmation(''); setError('This reset link is invalid or has expired. Request a new one.'); return }
    if (password.length < 8 || !/\d/.test(password)) { setPassword(''); setConfirmation(''); setError('Use at least 8 characters and one number.'); return }
    if (password !== confirmation) { setPassword(''); setConfirmation(''); setError('Passwords do not match.'); return }
    setLoading(true)
    const result = await updatePassword(password)
    setLoading(false)
    setPassword('')
    setConfirmation('')
    if (result.error) setError(result.error)
    else { setSuccess(true); window.setTimeout(() => navigate('/dashboard', { replace: true }), 1200) }
  }

  return (
    <form className="auth-card" onSubmit={submit} noValidate>
      <header><h2>Choose a new password</h2><p>Use a strong password you haven’t used before.</p></header>
      {success ? <p className="auth-success" role="status">Your password has been updated. Redirecting…</p> : (
        <>
          <PasswordInput id="reset-password" name="new-password" label="New password" autoComplete="new-password" placeholder="Create a password" value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} error={error} />
          <PasswordStrength password={password} id="reset-password-strength" />
          <PasswordInput id="reset-confirmation" name="new-password-confirmation" label="Confirm password" autoComplete="new-password" placeholder="Repeat your password" value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setError('') }} />
          {error && <p className="auth-error auth-error--form" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Updating…' : 'Update password'}</button>
        </>
      )}
      <div className="auth-meta"><p className="auth-footer"><Link to="/login">Back to log in</Link></p></div>
    </form>
  )
}
