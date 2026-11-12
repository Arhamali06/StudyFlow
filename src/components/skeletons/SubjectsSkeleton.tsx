import { SkeletonBlock, SkeletonCard, SkeletonPage } from './SkeletonPrimitives'

export default function SubjectsSkeleton() {
  return (
    <SkeletonPage label="Loading your subjects">
      <div className="page-skeleton__header">
        <div>
          <SkeletonBlock className="skeleton-block--heading" />
          <SkeletonBlock className="skeleton-block--subtitle" />
        </div>
        <SkeletonBlock className="skeleton-block--button" />
      </div>
      <ul className="subject-grid subject-skeleton__grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <li key={index}>
            <SkeletonCard className="subject-skeleton__card">
              <div className="subject-skeleton__title">
                <SkeletonBlock className="skeleton-block--subject-dot" />
                <SkeletonBlock className="skeleton-block--subject-name" />
              </div>
              <SkeletonBlock className="skeleton-block--line" />
              <SkeletonBlock className="skeleton-block--progress" />
              <SkeletonBlock className="skeleton-block--meta" />
            </SkeletonCard>
          </li>
        ))}
      </ul>
    </SkeletonPage>
  )
}
