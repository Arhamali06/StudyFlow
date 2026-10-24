import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  formatCalendarMonth,
  getCalendarDayLabel,
  getMonthGrid,
  getMonthTaskCount,
  getTaskIndicatorSubjects,
  moveCalendarDate,
  type CalendarNavigationKey,
} from '../../lib/calendar'
import { isTaskOverdue } from '../../lib/tasks'
import type { Subject, Task } from '../../types'

interface CalendarMonthProps {
  selectedDate: string
  today: string
  tasks: Task[]
  subjects: Map<string, Subject>
  onSelectDate: (date: string, fromGrid: boolean) => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarMonth({
  selectedDate,
  today,
  tasks,
  subjects,
  onSelectDate,
}: CalendarMonthProps) {
  const grid = getMonthGrid(selectedDate)
  const [focusDate, setFocusDate] = useState<string | null>(null)
  const dayRefs = useRef(new Map<string, HTMLButtonElement>())
  const grouped = new Map<string, Task[]>()
  tasks.forEach((task) => grouped.set(task.dueDate, [...(grouped.get(task.dueDate) ?? []), task]))

  useEffect(() => {
    if (!focusDate) return
    dayRefs.current.get(focusDate)?.focus()
  }, [focusDate, selectedDate])

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, date: string) {
    if (event.ctrlKey || event.altKey || event.metaKey) return
    const key = event.key as CalendarNavigationKey
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(key)) {
      return
    }
    event.preventDefault()
    const nextDate = moveCalendarDate(date, key, event.shiftKey)
    setFocusDate(nextDate)
    onSelectDate(nextDate, true)
  }

  function moveFromToolbar(offset: number) {
    onSelectDate(moveCalendarDate(selectedDate, offset < 0 ? 'PageUp' : 'PageDown'), false)
  }

  return (
    <section className="calendar-month-card card" aria-label={formatCalendarMonth(grid.year, grid.month)}>
      <div className="calendar-month-toolbar">
        <div>
          <h2 className="calendar-month-title">{formatCalendarMonth(grid.year, grid.month)}</h2>
          <p className="calendar-month-count">
            {getMonthTaskCount(tasks, grid.year, grid.month)} tasks due this month
          </p>
        </div>
        <div className="calendar-month-actions">
          <button type="button" className="icon-button icon-button--subtle icon-button--sm" onClick={() => moveFromToolbar(-1)} aria-label="Previous month">
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => onSelectDate(today, false)}>
            Today
          </button>
          <button type="button" className="icon-button icon-button--subtle icon-button--sm" onClick={() => moveFromToolbar(1)} aria-label="Next month">
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="calendar-grid" role="grid" aria-label={formatCalendarMonth(grid.year, grid.month)}>
        <div className="calendar-grid__row calendar-grid__header" role="row">
          {WEEKDAYS.map((weekday) => (
            <div key={weekday} className="calendar-grid__weekday" role="columnheader">{weekday}</div>
          ))}
        </div>
        {Array.from({ length: 6 }, (_, row) => (
          <div key={row} className="calendar-grid__row" role="row">
            {grid.days.slice(row * 7, row * 7 + 7).map((day) => {
              const dayTasks = grouped.get(day.date) ?? []
              const daySubjects = getTaskIndicatorSubjects(dayTasks, subjects)
              const overdue = dayTasks.some((task) => isTaskOverdue(task, today))
              return (
                <div key={day.date} className="calendar-grid__cell" role="gridcell" aria-selected={day.date === selectedDate}>
                  <button
                    ref={(element) => {
                      if (element) dayRefs.current.set(day.date, element)
                      else dayRefs.current.delete(day.date)
                    }}
                    type="button"
                    className={`calendar-day${day.isCurrentMonth ? '' : ' is-outside'}${day.date === today ? ' is-today' : ''}${day.date === selectedDate ? ' is-selected' : ''}`}
                    tabIndex={day.date === selectedDate ? 0 : -1}
                    aria-current={day.date === today ? 'date' : undefined}
                    aria-label={getCalendarDayLabel(day.date, dayTasks, today)}
                    data-more={dayTasks.length > 3 ? `+${dayTasks.length - 3}` : undefined}
                    onClick={() => onSelectDate(day.date, true)}
                    onKeyDown={(event) => handleKeyDown(event, day.date)}
                  >
                    <span className="calendar-day__number">{day.day}</span>
                    {dayTasks.length > 0 && (
                      <span className="calendar-day__indicators" aria-hidden="true">
                        {daySubjects.map((subject, index) => (
                          <i
                            key={`${day.date}-${subject.id}-${index}`}
                            className={`calendar-day__dot${dayTasks[index]?.status === 'completed' ? ' is-completed' : ''}`}
                            style={{ '--subject-color': subject.color } as CSSProperties}
                          />
                        ))}
                      </span>
                    )}
                    {overdue && <AlertCircle className="calendar-day__overdue" size={13} aria-hidden="true" />}
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="calendar-legend" aria-label="Calendar legend">
        <span><i className="calendar-legend__dot" /> Pending</span>
        <span><i className="calendar-legend__dot is-completed" /> Completed</span>
        <span><AlertCircle size={13} aria-hidden="true" /> Overdue</span>
      </div>
    </section>
  )
}
