import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isValidDateString } from '../lib/dates'

interface CalendarDateState {
  selectedDate: string
  selectDate: (date: string) => void
}

export function useCalendarDate(today: string): CalendarDateState {
  const [params, setParams] = useSearchParams()
  const paramDate = params.get('date')
  const hasValidParam = Boolean(paramDate && isValidDateString(paramDate))
  const selectedDate = hasValidParam ? paramDate! : today

  useEffect(() => {
    if (paramDate && !hasValidParam) {
      setParams({}, { replace: true })
    }
  }, [hasValidParam, paramDate, setParams])

  const selectDate = useCallback(
    (date: string) => {
      if (!isValidDateString(date)) return
      if (date === today) {
        setParams({}, { replace: true })
      } else {
        setParams({ date }, { replace: true })
      }
    },
    [setParams, today],
  )

  return useMemo(() => ({ selectedDate, selectDate }), [selectedDate, selectDate])
}
