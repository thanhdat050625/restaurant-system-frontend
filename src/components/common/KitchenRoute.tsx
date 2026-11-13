import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

interface KitchenRouteProps {
  children: React.ReactNode;
}

const ALLOWED_KITCHEN_ROLES = ['KITCHEN', 'STAFF', 'ADMIN'];

export const KitchenRoute: React.FC<KitchenRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!ALLOWED_KITCHEN_ROLES.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default KitchenRoute;
