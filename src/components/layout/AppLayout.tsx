import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  const { pathname } = useLocation()

  // We remember *which page* the drawer was opened on. If the page changes,
  // the drawer is automatically considered closed — no effect needed.
  const [drawerPath, setDrawerPath] = useState<string | null>(null)
  const isMenuOpen = drawerPath === pathname

  const openMenu = () => setDrawerPath(pathname)
  const closeMenu = () => setDrawerPath(null)

  // Allow Escape to close the drawer.
  useEffect(() => {
    if (!isMenuOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setDrawerPath(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Sidebar isOpen={isMenuOpen} onClose={closeMenu} />
      <div
        className={`sidebar-overlay${isMenuOpen ? ' is-visible' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <div className="app-main">
        <Header onOpenMenu={openMenu} isMenuOpen={isMenuOpen} />
        <main id="main-content" className="app-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
