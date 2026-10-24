import { Search } from 'lucide-react'
import Button from '../ui/Button'
import Select from '../ui/Select'
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_SORT_LABELS,
  TASK_SORTS,
  TASK_TAB_LABELS,
  TASK_TABS,
  TASK_TYPE_LABELS,
  TASK_TYPES,
} from '../../lib/constants'
import type { Subject, TaskFilterState, TaskSort, TaskTab } from '../../types'

interface TaskFiltersProps {
  filters: TaskFilterState
  sort: TaskSort
  subjects: Subject[]
  /** How many tasks each tab would show. */
  counts: Record<TaskTab, number>
  hasActiveFilters: boolean
  onChange: (updates: Partial<TaskFilterState & { sort: TaskSort }>) => void
  onReset: () => void
}

export default function TaskFilters({
  filters,
  sort,
  subjects,
  counts,
  hasActiveFilters,
  onChange,
  onReset,
}: TaskFiltersProps) {
  return (
    <div className="task-controls">
      <section className="card task-toolbar" aria-label="Search and filter tasks">
        <div className="input-icon">
          <Search className="input-icon__icon" size={20} strokeWidth={1.75} aria-hidden="true" />
          <input
            type="search"
            className="input input--with-icon"
            placeholder="Search tasks by title"
            aria-label="Search tasks by title"
            value={filters.query}
            onChange={(event) => onChange({ query: event.target.value })}
          />
        </div>

        <div className="task-toolbar__selects">
          <label className="field">
            <span className="field__label">Subject</span>
            <Select value={filters.subjectId} onChange={(event) => onChange({ subjectId: event.target.value })}>
              <option value="all">All</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </Select>
          </label>

          <label className="field">
            <span className="field__label">Priority</span>
            <Select
              value={filters.priority}
              onChange={(event) => onChange({ priority: event.target.value as TaskFilterState['priority'] })}
            >
              <option value="all">All</option>
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {TASK_PRIORITY_LABELS[priority]}
                </option>
              ))}
            </Select>
          </label>

          <label className="field">
            <span className="field__label">Task type</span>
            <Select
              value={filters.type}
              onChange={(event) => onChange({ type: event.target.value as TaskFilterState['type'] })}
            >
              <option value="all">All</option>
              {TASK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {TASK_TYPE_LABELS[type]}
                </option>
              ))}
            </Select>
          </label>

          <label className="field">
            <span className="field__label">Sort by</span>
            <Select value={sort} onChange={(event) => onChange({ sort: event.target.value as TaskSort })}>
              {TASK_SORTS.map((option) => (
                <option key={option} value={option}>
                  {TASK_SORT_LABELS[option]}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </section>

      <div className="task-controls__row">
        <div className="tabs" role="group" aria-label="Filter by status">
          {TASK_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`tab${filters.tab === tab ? ' is-active' : ''}`}
              aria-pressed={filters.tab === tab}
              onClick={() => onChange({ tab })}
            >
              {TASK_TAB_LABELS[tab]}
              <span className="tab__count">{counts[tab]}</span>
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
