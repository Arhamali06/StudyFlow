import { SkeletonBlock, SkeletonCard, SkeletonPage } from './SkeletonPrimitives'

export default function SettingsSkeleton() {
  return (
    <SkeletonPage label="Loading your settings">
      <div className="page-skeleton__header">
        <div>
          <SkeletonBlock className="skeleton-block--heading" />
          <SkeletonBlock className="skeleton-block--subtitle" />
        </div>
      </div>
      <div className="settings-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonCard className="settings-card settings-skeleton__card" key={index}>
            <div className="settings-card__heading"><SkeletonBlock className="skeleton-block--icon-small" /><SkeletonBlock className="skeleton-block--section" /></div>
            <SkeletonBlock className="skeleton-block--label" />
            <SkeletonBlock className="skeleton-block--input" />
            <SkeletonBlock className="skeleton-block--line" />
            <SkeletonBlock className="skeleton-block--button" />
          </SkeletonCard>
        ))}
      </div>
    </SkeletonPage>
  )
}
