import { SkeletonBlock, SkeletonCard, SkeletonPage } from './SkeletonPrimitives'

export default function TasksSkeleton() {
  return (
    <SkeletonPage label="Loading your tasks">
      <div className="page-skeleton__header">
        <div>
          <SkeletonBlock className="skeleton-block--heading" />
          <SkeletonBlock className="skeleton-block--subtitle" />
        </div>
        <SkeletonBlock className="skeleton-block--button" />
      </div>
      <div className="task-summary">
        {Array.from({ length: 3 }, (_, index) => <SkeletonBlock className="skeleton-block--summary" key={index} />)}
      </div>
      <SkeletonCard className="task-skeleton__controls">
        <SkeletonBlock className="skeleton-block--search" />
        <div className="task-skeleton__filters">
          {Array.from({ length: 4 }, (_, index) => <SkeletonBlock className="skeleton-block--filter" key={index} />)}
        </div>
        <SkeletonBlock className="skeleton-block--tabs" />
      </SkeletonCard>
      <div className="tasks-layout">
        <SkeletonCard className="task-skeleton__list">
          <SkeletonBlock className="skeleton-block--section" />
          {Array.from({ length: 5 }, (_, index) => (
            <div className="task-skeleton__row" key={index}>
              <SkeletonBlock className="skeleton-block--check" />
              <div className="task-skeleton__row-text">
                <SkeletonBlock className="skeleton-block--line" />
                <SkeletonBlock className="skeleton-block--meta" />
              </div>
              <SkeletonBlock className="skeleton-block--badge" />
            </div>
          ))}
        </SkeletonCard>
        <SkeletonCard className="task-skeleton__sidebar">
          <SkeletonBlock className="skeleton-block--section" />
          <SkeletonBlock className="skeleton-block--progress" />
          <SkeletonBlock className="skeleton-block--line" />
          <SkeletonBlock className="skeleton-block--line" />
        </SkeletonCard>
      </div>
    </SkeletonPage>
  )
}
