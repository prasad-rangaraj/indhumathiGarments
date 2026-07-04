import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useOrdersStore } from '../stores/ordersStore';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ adminOnly = false }: ProtectedRouteProps) => {
  const { user, token, isAuthenticated, logout } = useAuthStore();
  const { authError } = useOrdersStore();

  // If the backend returned 401 (expired/invalid token), clear auth and redirect
  useEffect(() => {
    if (authError && isAuthenticated) {
      logout();
    }
  }, [authError, isAuthenticated, logout]);

  // Redirect to login if not authenticated or no token
  if (!isAuthenticated || !user || !token) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if standard user tries to access admin routes
  if (adminOnly && user.role === 'customer') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
