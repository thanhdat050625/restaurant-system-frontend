import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

import {
  login as loginService,
  logout as logoutService,
  requestRegisterOtp as requestRegisterOtpService,
  register as registerService,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
  resendOtp as resendOtpService,
} from '../auth/services/auth.service';

import { getMe } from '../user/services/user.service';
import { IAuthContext } from '../../types/auth.type';
import { AuthUser } from './types/auth.type';

const AuthContext = createContext<IAuthContext | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Loading cho các authentication actions
  const [isLoading, setIsLoading] = useState(false);

  // Loading riêng cho việc kiểm tra authentication khi app khởi động
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  /**
   * Kiểm tra session hiện tại.
   *
   * Access Token nằm trong HttpOnly Cookie nên FE không tự đọc token.
   * FE gọi GET /users/me để BE xác nhận session.
   */
  const checkAuth = useCallback(async () => {
    try {
      const response = await getMe();

      if (response?.success && response?.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch {
      // 401 hoặc lỗi request → xem như chưa đăng nhập
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  /**
   * Kiểm tra authentication một lần khi AuthProvider được mount.
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Login
   */
  const login = useCallback(async (data: any) => {
    setIsLoading(true);

    try {
      const response = await loginService(data);

      if (response?.success && response?.data?.user) {
        setUser(response.data.user);
      }

      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await logoutService();

      setUser(null);

      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Request OTP cho Register
   */
  const requestRegisterOtp = useCallback(async (data: any) => {
    setIsLoading(true);

    try {
      return await requestRegisterOtpService(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register
   *
   * BE hiện tại trả accessToken/refreshToken/user
   * nhưng register controller chưa set Cookie.
   * Vì vậy chưa setUser() ở đây.
   */
  const register = useCallback(async (data: any) => {
    setIsLoading(true);

    try {
      return await registerService(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Forgot Password
   */
  const forgotPassword = useCallback(async (data: any) => {
    setIsLoading(true);

    try {
      return await forgotPasswordService(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset Password
   */
  const resetPassword = useCallback(async (data: any) => {
    setIsLoading(true);

    try {
      return await resetPasswordService(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Resend OTP
   */
  const resendOtp = useCallback(async (data: any) => {
    setIsLoading(true);

    try {
      return await resendOtpService(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,

        isLoading,
        isCheckingAuth,

        checkAuth,

        login,
        logout,

        requestRegisterOtp,
        register,

        forgotPassword,
        resetPassword,
        resendOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

export default AuthContext;