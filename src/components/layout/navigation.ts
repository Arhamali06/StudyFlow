import {
  BookOpen,
  CalendarDays,
  ChartColumn,
  LayoutDashboard,
  ListChecks,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'My Tasks', path: '/tasks', icon: ListChecks },
      { label: 'My Subjects', path: '/subjects', icon: BookOpen },
      { label: 'Calendar', path: '/calendar', icon: CalendarDays },
      { label: 'Progress', path: '/progress', icon: ChartColumn },
    ],
  },
  {
    label: 'Preferences',
    items: [{ label: 'Settings', path: '/settings', icon: Settings }],
  },
]
