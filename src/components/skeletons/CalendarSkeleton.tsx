import { SkeletonBlock, SkeletonCard, SkeletonPage } from './SkeletonPrimitives'

export default function CalendarSkeleton() {
  return (
    <SkeletonPage label="Loading your calendar">
      <div className="page-skeleton__header">
        <div>
          <SkeletonBlock className="skeleton-block--heading" />
          <SkeletonBlock className="skeleton-block--subtitle" />
        </div>
        <SkeletonBlock className="skeleton-block--button" />
      </div>
      <div className="calendar-layout calendar-skeleton">
        <SkeletonCard className="calendar-skeleton__month">
          <div className="calendar-skeleton__toolbar">
            <SkeletonBlock className="skeleton-block--month-title" />
            <div><SkeletonBlock className="skeleton-block--nav" /><SkeletonBlock className="skeleton-block--nav" /></div>
          </div>
          <div className="calendar-skeleton__grid">
            {Array.from({ length: 42 }, (_, index) => (
              <div className="calendar-skeleton__cell" key={index}>
                <SkeletonBlock className="skeleton-block--date" />
                {index % 5 === 0 && <SkeletonBlock className="skeleton-block--dot" />}
              </div>
            ))}
          </div>
        </SkeletonCard>
        <SkeletonCard className="calendar-skeleton__day">
          <SkeletonBlock className="skeleton-block--section" />
          <SkeletonBlock className="skeleton-block--line" />
          <SkeletonBlock className="skeleton-block--line" />
          <SkeletonBlock className="skeleton-block--line" />
        </SkeletonCard>
      </div>
    </SkeletonPage>
  )
}
