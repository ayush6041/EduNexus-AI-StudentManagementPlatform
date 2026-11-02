import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homePath } from '../utils'

/** Gate for authenticated routes. `roles` restricts by role; unfinished first-login users are sent to change-password. */
export default function ProtectedRoute({ roles, allowUnverified = false }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.mustChangePassword && !allowUnverified) return <Navigate to="/change-password" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={homePath(user.role)} replace />
  return <Outlet />
}
