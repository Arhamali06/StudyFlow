import { useState } from 'react'
import { Filter, Search, X } from 'lucide-react'
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
  counts: Record<TaskTab, number>
  visibleCount: number
  totalCount: number
  hasActiveFilters: boolean
  view: 'list' | 'board'
  onViewChange: (view: 'list' | 'board') => void
  onChange: (updates: Partial<TaskFilterState & { sort: TaskSort }>) => void
  onReset: () => void
}

export default function TaskFilters({
  filters,
  sort,
  subjects,
  counts,
  visibleCount,
  totalCount,
  hasActiveFilters,
  view,
  onViewChange,
  onChange,
  onReset,
}: TaskFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="task-controls">
      <section className="task-toolbar" aria-label="Search and filter tasks">
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

        <button
          type="button"
          className="task-toolbar__filter-button"
          aria-expanded={showFilters}
          onClick={() => setShowFilters((current) => !current)}
        >
          <Filter size={16} aria-hidden="true" />
          Filters
        </button>

        <div className={`task-toolbar__selects${showFilters ? ' is-open' : ''}`}>
          <label className="task-filter-select">
            <Select
              aria-label="Filter tasks by subject"
              value={filters.subjectId}
              onChange={(event) => onChange({ subjectId: event.target.value })}
            >
              <option value="all">Subject: All</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  Subject: {subject.name}
                </option>
              ))}
            </Select>
          </label>

          <label className="task-filter-select">
            <Select
              aria-label="Filter tasks by priority"
              value={filters.priority}
              onChange={(event) => onChange({ priority: event.target.value as TaskFilterState['priority'] })}
            >
              <option value="all">Priority: All</option>
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  Priority: {TASK_PRIORITY_LABELS[priority]}
                </option>
              ))}
            </Select>
          </label>

          <label className="task-filter-select">
            <Select
              aria-label="Filter tasks by task type"
              value={filters.type}
              onChange={(event) => onChange({ type: event.target.value as TaskFilterState['type'] })}
            >
              <option value="all">Type: All</option>
              {TASK_TYPES.map((type) => (
                <option key={type} value={type}>
                  Type: {TASK_TYPE_LABELS[type]}
                </option>
              ))}
            </Select>
          </label>

          <label className="task-filter-select">
            <Select
              aria-label="Sort tasks"
              value={sort}
              onChange={(event) => onChange({ sort: event.target.value as TaskSort })}
            >
              {TASK_SORTS.map((option) => (
                <option key={option} value={option}>
                  Sort: {TASK_SORT_LABELS[option]}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <div className="task-view-toggle" role="group" aria-label="Task view">
          <button
            type="button"
            className={view === 'list' ? 'is-active' : ''}
            aria-pressed={view === 'list'}
            onClick={() => onViewChange('list')}
          >
            List
          </button>
          <button
            type="button"
            className={view === 'board' ? 'is-active' : ''}
            aria-pressed={view === 'board'}
            onClick={() => onViewChange('board')}
          >
            Board
          </button>
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

        <div className="task-controls__actions">
          <p className="results-count" aria-live="polite">
            Showing {visibleCount} of {totalCount} {totalCount === 1 ? 'task' : 'tasks'}
          </p>
          {filters.overdue && (
            <Button
              variant="secondary"
              size="sm"
              icon={<X size={14} aria-hidden="true" />}
              aria-label="Remove the overdue-only filter"
              onClick={() => onChange({ overdue: false })}
            >
              Overdue only
            </Button>
          )}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
