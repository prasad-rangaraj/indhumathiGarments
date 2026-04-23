import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ adminOnly = false }: ProtectedRouteProps) => {
  const { user, token } = useAuthStore();

  // Redirect to login if not authenticated
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if standard user tries to access admin routes
  if (adminOnly && user.role === 'customer') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
