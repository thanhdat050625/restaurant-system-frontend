import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import apiClient from '../../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await apiClient.get('/profile/me');
      // Check xem có data không (nếu là khách, Backend sẽ trả về response.data = null)
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setUser(null); // Im lặng set thành null, không log lỗi
      }
    } catch (error) {
      // Chỉ bắt những lỗi nghiêm trọng thực sự (như rớt mạng, server sập)
      setUser(null);
    } finally {
      setIsLoading(false);
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        email: email, // Changed from usernameOrEmail
        password: password
      });

      if (response.success) {
        const { user } = response.data;
        setUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    } finally {
      setUser(null);
    }
  }, []);

  const requestRegisterOtp = useCallback(async (email) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/register/request-otp', {
        email: email
      });
      return true; // Trả về true luôn nếu API không quăng lỗi (2xx)
    } catch (error) {
      console.error("Lỗi yêu cầu OTP:", error);
      throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi mã OTP.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/register', {
        fullName: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword,
        otp: data.otp // Pass OTP
      });

      return true;
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', {
        email: email
      });
      return true;
    } catch (error) {
      console.error("Lỗi quên mật khẩu:", error);
      throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu quên mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email, otp, newPassword) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email: email,
        otp: otp,
        newPassword: newPassword
      });
      return true;
    } catch (error) {
      console.error("Lỗi đặt lại mật khẩu:", error);
      throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resendOtp = useCallback(async (email) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/resend-otp', {
        email: email
      });
      return true;
    } catch (error) {
      console.error("Lỗi gửi lại OTP:", error);
      throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi lại mã OTP.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading,
      isCheckingAuth,
      isAuthenticated: !!user, 
      login, 
      logout, 
      requestRegisterOtp, 
      register, 
      forgotPassword, 
      resetPassword, 
      resendOtp 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
