import type { CSSProperties } from 'react'
import type { OverallProgress as OverallProgressData } from '../../lib/statistics'

interface OverallProgressProps {
  progress: OverallProgressData
  message: string
}

export default function OverallProgress({ progress, message }: OverallProgressProps) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const style = {
    '--progress-ring-offset': `${circumference - (progress.percent / 100) * circumference}`,
  } as CSSProperties

  return (
    <section className="card progress-overview" aria-labelledby="progress-overview-title">
      <div className="progress-overview__ring-wrap">
        <svg className="progress-overview__ring" viewBox="0 0 120 120" role="progressbar"
          aria-label={`Overall completion: ${progress.percent}%`}
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent}>
          <circle className="progress-overview__track" cx="60" cy="60" r={radius} />
          <circle className="progress-overview__fill" cx="60" cy="60" r={radius} style={style} />
        </svg>
        <strong className="progress-overview__value">{progress.percent}%</strong>
      </div>
      <div className="progress-overview__summary">
        <h2 id="progress-overview-title">Overall completion</h2>
        <p>{progress.completed} of {progress.total} tasks completed</p>
        <p className="progress-overview__message">{message}</p>
      </div>
    </section>
  )
}
