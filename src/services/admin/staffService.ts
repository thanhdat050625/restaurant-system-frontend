import apiClient from '../api';
import { ApiResponse } from '../../types/api-response.type';
import {
  IStaff,
  ICreateStaffDto,
  IUpdateStaffDto,
  IQueryStaffParams,
  IStaffListResponse,
} from '../../types/admin/staff.type';

export const staffService = {
  getStaffs: async (params?: IQueryStaffParams): Promise<ApiResponse<IStaffListResponse>> => {
    return await apiClient.get('/users/staff', { params });
  },

  getStaffById: async (id: string): Promise<ApiResponse<IStaff>> => {
    return await apiClient.get(`/users/staff/${id}`);
  },

  createStaff: async (data: ICreateStaffDto): Promise<ApiResponse<IStaff>> => {
    return await apiClient.post('/users/staff', data);
  },

  updateStaff: async (id: string, data: IUpdateStaffDto): Promise<ApiResponse<IStaff>> => {
    return await apiClient.patch(`/users/staff/${id}`, data);
  },

  toggleStaffStatus: async (id: string): Promise<ApiResponse<IStaff>> => {
    return await apiClient.patch(`/users/staff/${id}/toggle-status`);
  },

  resetStaffPassword: async (id: string, newPassword: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    return await apiClient.post(`/users/staff/${id}/reset-password`, { newPassword });
  },
};
