import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import DashboardPage from '../pages/DashboardPage'
import TasksPage from '../pages/TasksPage'
import SubjectsPage from '../pages/SubjectsPage'
import CalendarPage from '../pages/CalendarPage'
import ProgressPage from '../pages/ProgressPage'
import SettingsPage from '../pages/SettingsPage'
import NotFoundPage from '../pages/NotFoundPage'
import RouteError from '../components/layout/RouteError'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
import { PublicOnly, RequireAuth } from '../components/auth/RouteGuards'

export const router = createBrowserRouter([
  { element: <PublicOnly />, children: [
    { path: '/login', element: <LoginPage /> },
    { path: '/signup', element: <SignupPage /> },
  ] },
  { element: <RequireAuth />, children: [{ path: '/', element: <Navigate to="/dashboard" replace /> }, {
    element: <AppLayout />,
    // Errors in the layout itself (sidebar/header) fall back to this screen.
    errorElement: <RouteError />,
    children: [
      {
        // A pathless route whose only job is to catch page errors while keeping
        // the sidebar and header on screen.
        errorElement: <RouteError />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'tasks', element: <TasksPage /> },
          { path: 'subjects', element: <SubjectsPage /> },
          { path: 'calendar', element: <CalendarPage /> },
          { path: 'progress', element: <ProgressPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  }] },
])
