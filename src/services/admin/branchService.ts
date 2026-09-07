import apiClient from '../api';
import { ApiResponse } from '../../types/api-response.type';
import { IBranch, QueryBranchParams } from '../../types/admin/branch.type';
import {
  IBranchOperatingHours,
  IUpdateBranchOperatingHours,
  IBranchCapacityStats,
} from '../../types/admin/branch-operating-hours.type';

export const branchService = {
  getBranches: async (params?: QueryBranchParams): Promise<ApiResponse<IBranch[]>> => {
    return await apiClient.get('/restaurants/branches', { params });
  },

  getBranchById: async (id: string): Promise<ApiResponse<IBranch>> => {
    return await apiClient.get(`/restaurants/branches/${id}`);
  },

  createBranch: async (data: Partial<IBranch>): Promise<ApiResponse<IBranch>> => {
    return await apiClient.post('/restaurants/branches', data);
  },

  updateBranch: async (id: string, data: Partial<IBranch>): Promise<ApiResponse<IBranch>> => {
    return await apiClient.patch(`/restaurants/branches/${id}`, data);
  },

  deleteBranch: async (id: string): Promise<ApiResponse<null>> => {
    return await apiClient.delete(`/restaurants/branches/${id}`);
  },

  getProvinces: async (): Promise<ApiResponse<any>> => {
    return await apiClient.get('/restaurants/branches/locations/provinces');
  },

  getWardsByProvince: async (code: string): Promise<ApiResponse<any>> => {
    return await apiClient.get(`/restaurants/branches/locations/provinces/${code}/wards`);
  },

  /**
   * Lấy cấu hình khung giờ hoạt động chung và chi tiết 7 ngày trong tuần
   */
  getOperatingHours: async (branchId: string): Promise<ApiResponse<IBranchOperatingHours>> => {
    return await apiClient.get(`/restaurants/branches/${branchId}/operating-hours`);
  },

  /**
   * Cập nhật khung giờ mở/đóng cửa và lịch 7 ngày trong tuần
   */
  updateOperatingHours: async (
    branchId: string,
    data: IUpdateBranchOperatingHours,
  ): Promise<ApiResponse<IBranchOperatingHours>> => {
    const payload: IUpdateBranchOperatingHours = {
      openingTime: data.openingTime,
      closingTime: data.closingTime,
      slotDurationMinutes: data.slotDurationMinutes,
      dailyHours: data.dailyHours?.map((item) => ({
        dayOfWeek: item.dayOfWeek,
        openTime: item.openTime,
        closeTime: item.closeTime,
        isOpen: item.isOpen,
      })),
    };
    return await apiClient.put(`/restaurants/branches/${branchId}/operating-hours`, payload);
  },

  /**
   * Lấy thống kê năng lực sức chứa (bàn, ghế, loại bàn) của chi nhánh
   */
  getCapacity: async (branchId: string): Promise<ApiResponse<IBranchCapacityStats>> => {
    return await apiClient.get(`/restaurants/branches/${branchId}/capacity`);
  },
};

