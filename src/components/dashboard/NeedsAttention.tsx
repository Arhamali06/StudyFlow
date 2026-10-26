import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import { addDays, parseDateString, toDateString } from '../../lib/dates'
import type { Subject, Task } from '../../types'

interface NeedsAttentionProps {
  subjects: Subject[]
  tasks: Task[]
  today: string
}

export default function NeedsAttention({ subjects, tasks, today }: NeedsAttentionProps) {
  const rows = subjects
    .map((subject) => {
      const subjectTasks = tasks.filter((task) => task.subjectId === subject.id && task.status === 'pending')
      const overdue = subjectTasks.filter((task) => task.dueDate < today).length
      const soon = subjectTasks.filter((task) => task.dueDate >= today && task.dueDate <= addDaysString(today, 3)).length
      return { subject, overdue, soon }
    })
    .filter((row) => row.overdue > 0 || row.soon > 0)
    .sort((a, b) => b.overdue - a.overdue || b.soon - a.soon)

  return (
    <section className="card" aria-labelledby="needs-attention-title">
      <h2 id="needs-attention-title" className="card__title">Needs attention</h2>
      <p className="card__subtitle">Subjects with overdue or soon-due work.</p>
      {rows.length === 0 ? <p className="card__placeholder">Nothing urgent right now.</p> : (
        <ul className="dash-attention__list">
          {rows.slice(0, 4).map(({ subject, overdue, soon }) => (
            <li key={subject.id}>
              <span className="subject-chip__dot" style={{ '--subject-color': subject.color } as CSSProperties} aria-hidden="true" />
              <Link to={`/tasks?subject=${subject.id}`}>{subject.name}</Link>
              <Badge tone={overdue > 0 ? 'danger' : 'warning'}>
                {overdue > 0 ? `${overdue} overdue` : `${soon} due soon`}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function addDaysString(today: string, days: number): string {
  const date = parseDateString(today)
  return date ? toDateString(addDays(date, days)) : today
}
