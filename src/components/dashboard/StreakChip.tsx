import { Flame } from 'lucide-react'

interface StreakChipProps {
  current: number
}

export default function StreakChip({ current }: StreakChipProps) {
  const label = current > 0 ? `${current}-day streak` : 'No streak yet'
  return (
    <span
      className="dash-streak-chip"
      aria-label={current > 0 ? `${current} day completion streak` : 'No completion streak yet'}
    >
      <Flame size={15} aria-hidden="true" />
      {label}
    </span>
  )
}
