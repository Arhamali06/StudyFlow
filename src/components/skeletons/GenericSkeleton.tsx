import { SkeletonBlock, SkeletonCard, SkeletonPage } from './SkeletonPrimitives'

export default function GenericSkeleton() {
  return (
    <SkeletonPage label="Loading page">
      <div className="page-skeleton__header">
        <div>
          <SkeletonBlock className="skeleton-block--heading" />
          <SkeletonBlock className="skeleton-block--subtitle" />
        </div>
      </div>
      <div className="generic-skeleton__content">
        {Array.from({ length: 3 }, (_, index) => (
          <SkeletonCard className="generic-skeleton__card" key={index}>
            <SkeletonBlock className="skeleton-block--section" />
            <SkeletonBlock className="skeleton-block--line" />
            <SkeletonBlock className="skeleton-block--line" />
          </SkeletonCard>
        ))}
      </div>
    </SkeletonPage>
  )
}
