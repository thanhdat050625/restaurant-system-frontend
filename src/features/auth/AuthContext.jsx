import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import apiClient from '../../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        usernameOrEmail: email,
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

  const register = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/register', {
        fullName: data.name,
        username: data.username,
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword
      });

      return response.success;
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      throw new Error(error.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (email, otp) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/verify-otp', {
        email: email,
        otp: otp
      });

      return response.success;
    } catch (error) {
      console.error("Lỗi xác thực OTP:", error);
      throw new Error(error.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, verifyOtp, logout }}>
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
