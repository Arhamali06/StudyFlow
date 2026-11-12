import { SkeletonBlock, SkeletonCard, SkeletonPage } from './SkeletonPrimitives'

export default function ProgressSkeleton() {
  return (
    <SkeletonPage label="Loading your progress">
      <div className="page-skeleton__header">
        <div>
          <SkeletonBlock className="skeleton-block--heading" />
          <SkeletonBlock className="skeleton-block--subtitle" />
        </div>
        <SkeletonBlock className="skeleton-block--range" />
      </div>
      <div className="progress-page">
        <div className="progress-hero progress-skeleton__hero">
          <SkeletonCard className="progress-skeleton__overview">
            <SkeletonBlock className="skeleton-block--ring" />
            <div><SkeletonBlock className="skeleton-block--section" /><SkeletonBlock className="skeleton-block--line" /></div>
          </SkeletonCard>
          <div className="progress-stats">
            {Array.from({ length: 4 }, (_, index) => <SkeletonCard className="stat-card" key={index}><SkeletonBlock className="skeleton-block--value" /><SkeletonBlock className="skeleton-block--label" /></SkeletonCard>)}
          </div>
        </div>
        <div className="progress-columns">
          <div className="progress-column">
            <SkeletonCard className="progress-skeleton__chart"><SkeletonBlock className="skeleton-block--section" /><SkeletonBlock className="skeleton-block--chart" /></SkeletonCard>
            <SkeletonCard className="progress-skeleton__subjects"><SkeletonBlock className="skeleton-block--section" />{Array.from({ length: 4 }, (_, index) => <SkeletonBlock className="skeleton-block--row" key={index} />)}</SkeletonCard>
          </div>
          <div className="progress-column">
            {Array.from({ length: 3 }, (_, index) => <SkeletonCard className="progress-skeleton__breakdown" key={index}><SkeletonBlock className="skeleton-block--section" /><SkeletonBlock className="skeleton-block--line" /><SkeletonBlock className="skeleton-block--line" /></SkeletonCard>)}
          </div>
        </div>
      </div>
    </SkeletonPage>
  )
}
