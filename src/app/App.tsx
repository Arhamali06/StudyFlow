import { RouterProvider } from 'react-router-dom'
import { AppDataProvider } from '../context/AppDataContext'
import { ThemeProvider } from '../context/ThemeContext'
import { ToastProvider } from '../context/ToastContext'
import { router } from './router'

export default function App() {
  return (
    <ToastProvider>
      <ThemeProvider>
        <AppDataProvider>
          <RouterProvider router={router} />
        </AppDataProvider>
      </ThemeProvider>
    </ToastProvider>
  )
}
