
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    console.log('No user, redirecting to auth')
    return <Navigate to="/auth" replace />
  }

  // Wait for profile to load before checking role requirements
  if (user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (requiredRole && profile?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's role
    if (profile?.role === 'parent') {
      return <Navigate to="/parent" replace />
    } else if (profile?.role === 'shadchan') {
      return <Navigate to="/shadchan" replace />
    } else {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
