import apiClient from '../api';
import { ApiResponse } from '../../types/api-response.type';
import { IBranch } from '../../types/admin/branch.type';

export const branchService = {
  getBranches: async (): Promise<ApiResponse<IBranch[]>> => {
    return await apiClient.get('/restaurants/branches');
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
  }
};
