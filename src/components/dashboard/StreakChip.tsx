interface StreakChipProps {
  current: number
}

export default function StreakChip({ current }: StreakChipProps) {
  return (
    <span className="dash-streak-chip" aria-label={`${current} day completion streak`}>
      <Flame size={15} aria-hidden="true" />
      {current} day{current === 1 ? '' : 's'} streak
    </span>
  )
}
import { Flame } from 'lucide-react'
