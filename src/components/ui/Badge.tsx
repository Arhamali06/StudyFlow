import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
}

export default function Badge({ tone = 'neutral', children }: BadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}
