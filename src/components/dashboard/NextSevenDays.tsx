import { Link } from 'react-router-dom'
import { addDays, formatDate, parseDateString, toDateString } from '../../lib/dates'
import type { Task } from '../../types'

interface NextSevenDaysProps {
  tasks: Task[]
  today: string
}

export default function NextSevenDays({ tasks, today }: NextSevenDaysProps) {
  const date = parseDateString(today)
  if (!date) return null
  const days = Array.from({ length: 7 }, (_, index) => {
    const value = toDateString(addDays(date, index))
    return {
      date: value,
      label: index === 0 ? 'Today' : formatDate(value).split(',')[0],
      count: tasks.filter((task) => task.status === 'pending' && task.dueDate === value).length,
    }
  })

  return (
    <section className="card dash-next-days" aria-labelledby="next-days-title">
      <div className="dash-widget-header">
        <div>
          <h2 id="next-days-title" className="card__title">Next 7 days</h2>
          <p className="card__subtitle">Plan what is coming up.</p>
        </div>
        <Link className="dash-widget-link" to={`/calendar?date=${today}`}>Open calendar</Link>
      </div>
      <div className="dash-next-days__list">
        {days.map((day) => (
          <Link
            key={day.date}
            className={`dash-next-days__day${day.date === today ? ' is-today' : ''}`}
            to={`/calendar?date=${day.date}`}
            aria-label={`${day.label}, ${day.count} ${day.count === 1 ? 'task' : 'tasks'} due`}
          >
            <span>{day.label}</span>
            <strong>{day.count}</strong>
          </Link>
        ))}
      </div>
    </section>
  )
}
