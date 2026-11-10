import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/authContext'

export function RequireAuth() {
  const { user } = useAuth()
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

export function PublicOnly() {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />
}
