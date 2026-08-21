import apiClient from '../../../services/api';
import { ApiResponse } from '../../../types/api-response.type';
import { AuthUser } from '../../auth/types/auth.type';
import type { UpdateUserProfileRequest } from '../types/user-profile.type';

export const getMe = async () => {
    return apiClient.get<ApiResponse<AuthUser>>('/users/me');
};

export const updateProfile = async (
    data: UpdateUserProfileRequest,
) => {
    return apiClient.patch<ApiResponse<AuthUser>>('/users/me', data);
};