import { passwordStrength, STRENGTH_LABELS } from '../../lib/password'

export function PasswordStrength({ password, id }: { password: string; id?: string }) {
  const strength = password ? passwordStrength(password) : 0
  return (
    <div className="password-strength" id={id}>
      <div className="password-strength__bars" aria-hidden="true">
        {[1, 2, 3].map((value) => (
          <span className={value <= strength ? `is-filled is-level-${strength}` : ''} key={value} />
        ))}
      </div>
      <p>
        Use at least 8 characters, with a number.
        {strength > 0 && <span className="visually-hidden"> Password strength: {STRENGTH_LABELS[strength]}.</span>}
      </p>
    </div>
  )
}
