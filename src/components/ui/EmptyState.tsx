import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="icon-tile icon-tile--muted empty-state__icon">
        <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__description">{description}</p>
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  )
}
