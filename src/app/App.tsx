import { RouterProvider } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AppDataProvider } from '../context/AppDataContext'
import { AuthProvider } from '../context/AuthProvider'
import { ProfileProvider } from '../context/ProfileContext'
import { useAuth } from '../context/authContext'
import { ThemeProvider } from '../context/ThemeContext'
import { ToastProvider } from '../context/ToastContext'
import { router } from './router'

function AuthenticatedProviders({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  return <ProfileProvider user={user}>{children}</ProfileProvider>
}

export default function App() {
  return (
    <ToastProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppDataProvider>
            <AuthenticatedProviders>
              <RouterProvider router={router} />
            </AuthenticatedProviders>
          </AppDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  )
}
