import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

export type StatTone = 'dark' | 'primary' | 'muted' | 'accent'

interface StatCardProps {
  icon: LucideIcon
  tone: StatTone
  /** Shown as the big number. Use "–" when there is no data yet. */
  value: string | number
  /** Small text next to the number, e.g. "tasks". */
  unit?: string
  label: string
  /** When set, the whole card becomes a link to this path. */
  href?: string
  /** Accessible name for the link, e.g. "Overdue: 3 tasks, view tasks". */
  linkLabel?: string
}

export default function StatCard({ icon: Icon, tone, value, unit, label, href, linkLabel }: StatCardProps) {
  return (
    <article className={`card stat-card${href ? ' stat-card--linked' : ''}`}>
      <span className={`icon-tile icon-tile--${tone}`}>
        <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <p className="stat-card__value">
        {value}
        {unit && <span className="stat-card__unit">{unit}</span>}
      </p>
      <p className="stat-card__label">{label}</p>
      {href && (
        <Link to={href} className="stat-card__link" aria-label={linkLabel ?? label} />
      )}
    </article>
  )
}
