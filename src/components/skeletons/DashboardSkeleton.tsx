export default function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton" aria-label="Loading dashboard" aria-busy="true">
      <span className="visually-hidden" role="status">Loading your study dashboard</span>
      <div className="dashboard-skeleton__header">
        <div>
          <div className="skeleton-block skeleton-block--title" />
          <div className="skeleton-block skeleton-block--subtitle" />
        </div>
        <div className="skeleton-block skeleton-block--chip" />
      </div>
      <div className="stat-grid">
        {Array.from({ length: 4 }, (_, index) => <div className="card stat-card dashboard-skeleton__stat" key={index}><div className="skeleton-block skeleton-block--icon" /><div className="skeleton-block skeleton-block--value" /><div className="skeleton-block skeleton-block--label" /></div>)}
      </div>
      <div className="dashboard-action-layout">
        <div className="dashboard-action-layout__left">
          <div className="card dashboard-skeleton__card"><div className="skeleton-block skeleton-block--wide" /><div className="skeleton-block skeleton-block--line" /><div className="skeleton-block skeleton-block--line" /></div>
          <div className="card dashboard-skeleton__card"><div className="skeleton-block skeleton-block--section" />{Array.from({ length: 3 }, (_, index) => <div className="skeleton-block skeleton-block--row" key={index} />)}</div>
        </div>
        <div className="dashboard-action-layout__right">
          {Array.from({ length: 3 }, (_, index) => <div className="card dashboard-skeleton__card dashboard-skeleton__card--side" key={index}><div className="skeleton-block skeleton-block--section" /><div className="skeleton-block skeleton-block--line" /><div className="skeleton-block skeleton-block--line" /></div>)}
        </div>
      </div>
    </div>
  )
}
