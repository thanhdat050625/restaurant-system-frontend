export interface RequestRegisterOtpRequest {
    email: string;
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    otp: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
}

export interface ResendOtpRequest {
    email: string;
}