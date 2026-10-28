import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Menu, Search } from 'lucide-react'
import { clearAuthentication } from '../../lib/auth'

interface HeaderProps {
  onOpenMenu: () => void
  isMenuOpen: boolean
}

const isApplePlatform =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.userAgent)

export default function Header({ onOpenMenu, isMenuOpen }: HeaderProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Ctrl/⌘ + K focuses the search field from anywhere in the app.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/tasks?q=${encodeURIComponent(trimmed)}` : '/tasks')
    inputRef.current?.blur()
  }

  function logout() { clearAuthentication(); navigate('/login') }
  return (
    <header className="app-header">
      <button
        id="app-menu-button"
        type="button"
        className="icon-button app-header__menu"
        onClick={onOpenMenu}
        aria-label="Open navigation"
        aria-expanded={isMenuOpen}
        aria-controls="app-sidebar"
      >
        <Menu size={22} aria-hidden="true" />
      </button>

      <form className="search" role="search" onSubmit={handleSubmit}>
        <Search className="search__icon" size={22} strokeWidth={1.75} aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          className="search__input"
          placeholder="Search your tasks"
          aria-label="Search all tasks"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <kbd className="kbd" aria-hidden="true">
          {isApplePlatform ? '⌘ K' : 'Ctrl K'}
        </kbd>
      </form>
      <button type="button" className="header-logout" onClick={logout}><LogOut size={17} aria-hidden="true" /> <span>Log out</span></button>
    </header>
  )
}
