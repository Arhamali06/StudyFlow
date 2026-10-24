import type { CSSProperties } from 'react'

interface ProgressBarProps {
  /** 0–100 */
  value: number
  /** Describes what is being measured, for screen readers. */
  label: string
  /** Optional fill color (defaults to the brand purple). */
  color?: string
}

export default function ProgressBar({ value, label, color }: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, value))
  const style = { width: `${safeValue}%`, ...(color ? { '--progress-color': color } : {}) }

  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
    >
      <span className="progress__fill" style={style as CSSProperties} />
    </div>
  )
}
