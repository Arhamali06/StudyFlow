import type { HTMLAttributes, ReactNode } from 'react'

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <span className={`skeleton-block ${className}`} aria-hidden="true" />
}

export function SkeletonPage({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="page-skeleton" aria-label={label} aria-busy="true">
      <span className="visually-hidden" role="status">{label}</span>
      {children}
    </div>
  )
}

export function SkeletonCard({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`card ${className}`} {...props} />
}
