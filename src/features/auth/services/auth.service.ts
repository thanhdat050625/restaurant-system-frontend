import apiClient from '../../../services/api';
import { ApiResponse } from '../../../types/api-response.type';
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
    return apiClient.post<ApiResponse<any>>(
        '/auth/register/request-otp',
        data,
    );
};

export const register = async (
    data: RegisterRequest,
) => {
    return apiClient.post<ApiResponse<AuthResult>>(
        '/auth/register',
        data,
    );
};

export const login = async (
    data: LoginRequest,
) => {
    return apiClient.post<ApiResponse<AuthResult>>(
        '/auth/login',
        data,
    );
};

export const forgotPassword = async (
    data: ForgotPasswordRequest,
) => {
    return apiClient.post<ApiResponse<any>>(
        '/auth/forgot-password',
        data,
    );
};

export const resetPassword = async (
    data: ResetPasswordRequest,
) => {
    return apiClient.post<ApiResponse<any>>(
        '/auth/reset-password',
        data,
    );
};

export const resendOtp = async (
    data: ResendOtpRequest,
) => {
    return apiClient.post<ApiResponse<any>>(
        '/auth/resend-otp',
        data,
    );
};

export const logout = async () => {
    return apiClient.post<ApiResponse<any>>('/auth/logout');
};