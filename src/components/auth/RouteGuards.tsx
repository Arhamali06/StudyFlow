import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated } from '../../lib/auth'
export function RequireAuth() { return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace /> }
export function PublicOnly() { return isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Outlet /> }
