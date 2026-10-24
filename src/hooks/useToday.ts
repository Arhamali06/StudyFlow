import { useEffect, useState } from 'react'
import { getTodayString } from '../lib/dates'

/**
 * Today's date as "YYYY-MM-DD". It updates by itself at midnight (and when the
 * tab becomes visible again), so "overdue" labels never go stale.
 */
export function useToday(): string {
  const [today, setToday] = useState(() => getTodayString())

  useEffect(() => {
    let timer: number

    function scheduleNextCheck() {
      const now = new Date()
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1)
      timer = window.setTimeout(() => {
        setToday(getTodayString())
        scheduleNextCheck()
      }, nextMidnight.getTime() - now.getTime())
    }

    function handleVisibility() {
      if (document.visibilityState === 'visible') setToday(getTodayString())
    }

    scheduleNextCheck()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return today
}
