import apiClient from '../../../services/api';
import type { UpdateUserProfileRequest } from '../types/user-profile.type';

export const getMe = async () => {
    return apiClient.get('/users/me');
};

export const updateProfile = async (
    data: UpdateUserProfileRequest,
) => {
    return apiClient.patch('/users/me', data);
};