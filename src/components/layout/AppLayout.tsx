import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAppData } from '../../hooks/useAppData'
import DashboardSkeleton from '../skeletons/DashboardSkeleton'
import TasksSkeleton from '../skeletons/TasksSkeleton'
import SubjectsSkeleton from '../skeletons/SubjectsSkeleton'
import CalendarSkeleton from '../skeletons/CalendarSkeleton'
import ProgressSkeleton from '../skeletons/ProgressSkeleton'
import SettingsSkeleton from '../skeletons/SettingsSkeleton'
import GenericSkeleton from '../skeletons/GenericSkeleton'

const MENU_BUTTON_ID = 'app-menu-button'

/** After the drawer closes, give keyboard users their place back on the menu button. */
function restoreMenuButtonFocus() {
  window.requestAnimationFrame(() => document.getElementById(MENU_BUTTON_ID)?.focus())
}

function LoadingSkeleton({ pathname }: { pathname: string }) {
  switch (pathname.split('/')[1]) {
    case 'dashboard': return <DashboardSkeleton />
    case 'tasks': return <TasksSkeleton />
    case 'subjects': return <SubjectsSkeleton />
    case 'calendar': return <CalendarSkeleton />
    case 'progress': return <ProgressSkeleton />
    case 'settings': return <SettingsSkeleton />
    default: return <GenericSkeleton />
  }
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const { isInitialLoading, dataError, isRefreshing, hasLoadedData, retry } = useAppData()

  // We remember *which page* the drawer was opened on. If the page changes,
  // the drawer is automatically considered closed — no effect needed.
  const [drawerPath, setDrawerPath] = useState<string | null>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const isMenuOpen = drawerPath === pathname

  const openMenu = () => setDrawerPath(pathname)
  const closeMenu = (restoreFocus = false) => {
    setDrawerPath(null)
    if (restoreFocus) restoreMenuButtonFocus()
  }

  // Allow Escape to close the drawer.
  useEffect(() => {
    if (!isMenuOpen) return
    const sidebar = sidebarRef.current
    document.body.classList.add('is-drawer-open')
    const focusable = () => Array.from(
      sidebar?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => !element.hasAttribute('hidden'))
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDrawerPath(null)
        restoreMenuButtonFocus()
      }
      if (event.key !== 'Tab') return
      const items = focusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    focusable()[0]?.focus()
    return () => {
      document.body.classList.remove('is-drawer-open')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Sidebar
        ref={sidebarRef}
        isOpen={isMenuOpen}
        onClose={() => closeMenu(true)}
        onNavigate={() => closeMenu(false)}
      />
      <div
        className={`sidebar-overlay${isMenuOpen ? ' is-visible' : ''}`}
        onClick={() => closeMenu(true)}
        aria-hidden="true"
      />

      <div className="app-main">
        <Header onOpenMenu={openMenu} isMenuOpen={isMenuOpen} />
        <main id="main-content" className="app-content" tabIndex={-1}>
          {isInitialLoading ? <LoadingSkeleton pathname={pathname} /> : dataError && !hasLoadedData ? (
            <div className="data-error" role="alert">
              <h1>We could not load your study data</h1>
              <p>{dataError}</p>
              <button className="btn btn--primary btn--md" type="button" onClick={retry}>Retry</button>
            </div>
          ) : (
            <>
              {isRefreshing && <p className="refresh-indicator" role="status">Refreshing your study data…</p>}
              {dataError && hasLoadedData && (
                <p className="refresh-error" role="alert">
                  {dataError} <button className="btn btn--ghost btn--sm" type="button" onClick={retry}>Retry refresh</button>
                </p>
              )}
              <Outlet />
            </>
          )}
        </main>
      </div>
    </div>
  )
}
