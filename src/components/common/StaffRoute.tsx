import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

interface StaffRouteProps {
  children: React.ReactNode;
}

const StaffRoute: React.FC<StaffRouteProps> = ({ children }) => {
  const { isAuthenticated, isCheckingAuth, user } = useAuth();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Chưa đăng nhập -> về trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu là ADMIN cố tình truy cập /staff -> chuyển đúng về /admin
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  // Nếu không phải STAFF (ví dụ USER thường) -> về trang chủ
  if (user?.role !== 'STAFF') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default StaffRoute;
