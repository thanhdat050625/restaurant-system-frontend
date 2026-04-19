import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    // Mock login
    await new Promise(r => setTimeout(r, 1000));
    setUser({ id: 1, name: 'Nguyễn Văn A', email, phone: '0123456789', avatar: 'https://i.pravatar.cc/100?img=11' });
    setIsLoading(false);
    return true;
  }, []);

  const register = useCallback(async (data) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setUser({ id: 1, name: data.name, email: data.email, phone: data.phone, avatar: 'https://i.pravatar.cc/100?img=11' });
    setIsLoading(false);
    return true;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}>
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
