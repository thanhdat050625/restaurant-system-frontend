import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isCheckingAuth, user } = useAuth();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Nếu chưa đăng nhập -> login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập nhưng không phải ADMIN hoặc STAFF -> về trang chủ
  if (user?.role !== 'ADMIN' && user?.role !== 'STAFF') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
