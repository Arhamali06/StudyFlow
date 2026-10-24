import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import DashboardPage from '../pages/DashboardPage'
import TasksPage from '../pages/TasksPage'
import SubjectsPage from '../pages/SubjectsPage'
import CalendarPage from '../pages/CalendarPage'
import ProgressPage from '../pages/ProgressPage'
import SettingsPage from '../pages/SettingsPage'
import NotFoundPage from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'subjects', element: <SubjectsPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'progress', element: <ProgressPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
