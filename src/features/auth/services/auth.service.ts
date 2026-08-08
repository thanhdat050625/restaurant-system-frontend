import apiClient from '../../../services/api';
import type {
    RequestRegisterOtpRequest,
    RegisterRequest,
    LoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ResendOtpRequest,
    AuthResult,
} from '../types/auth.type';

export const requestRegisterOtp = async (
    data: RequestRegisterOtpRequest,
) => {
    return apiClient.post(
        '/auth/register/request-otp',
        data,
    );
};

export const register = async (
    data: RegisterRequest,
) => {
    return apiClient.post<AuthResult>(
        '/auth/register',
        data,
    );
};

export const login = async (
    data: LoginRequest,
) => {
    return apiClient.post<AuthResult>(
        '/auth/login',
        data,
    );
};

export const forgotPassword = async (
    data: ForgotPasswordRequest,
) => {
    return apiClient.post(
        '/auth/forgot-password',
        data,
    );
};

export const resetPassword = async (
    data: ResetPasswordRequest,
) => {
    return apiClient.post(
        '/auth/reset-password',
        data,
    );
};

export const resendOtp = async (
    data: ResendOtpRequest,
) => {
    return apiClient.post(
        '/auth/resend-otp',
        data,
    );
};

export const logout = async () => {
    return apiClient.post('/auth/logout');
};