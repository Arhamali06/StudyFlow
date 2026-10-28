import { passwordStrength } from '../../lib/password'
export function PasswordStrength({ password }: { password: string }) {
  const strength = password ? passwordStrength(password) : 0
  return <div className="password-strength" aria-label={`Password strength: ${strength} of 3`}><div className="password-strength__bars">{[1, 2, 3].map((value) => <span className={value <= strength ? 'is-filled' : ''} key={value} />)}</div><p>Use at least 8 characters, with a number.</p></div>
}
