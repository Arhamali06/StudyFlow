import { RouterProvider } from 'react-router-dom'
import { AppDataProvider } from '../context/AppDataContext'
import { AuthProvider } from '../context/AuthProvider'
import { ThemeProvider } from '../context/ThemeContext'
import { ToastProvider } from '../context/ToastContext'
import { router } from './router'

export default function App() {
  return (
    <ToastProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppDataProvider>
            <RouterProvider router={router} />
          </AppDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  )
}
