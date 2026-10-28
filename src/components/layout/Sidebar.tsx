import { forwardRef } from 'react'
import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { NAV_GROUPS } from './navigation'

interface SidebarProps {
  /** Only matters on tablet/mobile, where the sidebar is a slide-in drawer. */
  isOpen: boolean
  /** Close button: the layout also puts focus back on the menu button. */
  onClose: () => void
  /** A link was followed: close the drawer without moving focus. */
  onNavigate: () => void
}

function BrandMark() {
  return (
    <svg className="brand__mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="10" fill="currentColor" />
      <path
        d="M9 21c3-8 6-8 7-5s3 3 7-5"
        stroke="var(--color-card)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="23" cy="11" r="2.8" fill="var(--color-accent)" />
    </svg>
  )
}

const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar({ isOpen, onClose, onNavigate }, ref) {
  return (
    <aside
      ref={ref}
      id="app-sidebar"
      className={`sidebar${isOpen ? ' is-open' : ''}`}
      aria-label="Sidebar"
    >
      <div className="sidebar__top">
        <div className="brand">
          <BrandMark />
          <span className="brand__name">StudyFlow</span>
        </div>
        <button
          type="button"
          className="icon-button sidebar__close"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <nav aria-label="Main navigation" className="sidebar__nav">
        {NAV_GROUPS.map((group) => (
          <div className="nav-group" key={group.label}>
            <p className="nav-group__label">{group.label}</p>
            <ul className="nav-list">
              {group.items.map(({ label, path, icon: Icon }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    end={path === '/dashboard'}
                    className="nav-link"
                    onClick={onNavigate}
                  >
                    <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
})

export default Sidebar
