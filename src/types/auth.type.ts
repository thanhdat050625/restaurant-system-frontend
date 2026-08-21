import { AuthUser } from '../features/auth/types/auth.type';

export interface IAuthContext {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  checkAuth: () => Promise<void>;
  login: (data: any) => Promise<any>;
  logout: () => Promise<any>;
  requestRegisterOtp: (data: any) => Promise<any>;
  register: (data: any) => Promise<any>;
  forgotPassword: (data: any) => Promise<any>;
  resetPassword: (data: any) => Promise<any>;
  resendOtp: (data: any) => Promise<any>;
}
