import apiClient from '../api';
import { ApiResponse } from '../../types/api-response.type';
import {
  IBranchMenuResponse,
  IBranchMenuItem,
  IQueryBranchMenuParams,
  IBulkUpdateBranchMenu,
} from '../../types/admin/branch-menu.type';

export const branchMenuService = {
  getBranchMenu: async (
    branchId: string,
    params?: IQueryBranchMenuParams,
  ): Promise<ApiResponse<IBranchMenuResponse>> => {
    return await apiClient.get(`/branches/${branchId}/menu`, { params });
  },

  getPublicBranchMenu: async (
    branchId: string,
    params?: IQueryBranchMenuParams,
  ): Promise<ApiResponse<IBranchMenuResponse>> => {
    return await apiClient.get(`/branches/${branchId}/menu/public`, { params });
  },

  toggleAvailability: async (
    branchId: string,
    menuItemId: string,
    isAvailable: boolean,
  ): Promise<ApiResponse<IBranchMenuItem>> => {
    return await apiClient.patch(`/branches/${branchId}/menu/${menuItemId}/availability`, {
      isAvailable,
    });
  },

  toggleStatus: async (
    branchId: string,
    menuItemId: string,
    isActive: boolean,
  ): Promise<ApiResponse<IBranchMenuItem>> => {
    return await apiClient.patch(`/branches/${branchId}/menu/${menuItemId}/status`, {
      isActive,
    });
  },

  updatePriceOverride: async (
    branchId: string,
    menuItemId: string,
    priceOverride: number | null,
  ): Promise<ApiResponse<IBranchMenuItem>> => {
    return await apiClient.patch(`/branches/${branchId}/menu/${menuItemId}/price`, {
      priceOverride,
    });
  },

  bulkUpdateAvailability: async (
    branchId: string,
    menuItemIds: string[],
    isAvailable: boolean,
  ): Promise<ApiResponse<{ updatedCount: number }>> => {
    const payload: IBulkUpdateBranchMenu = { menuItemIds, isAvailable };
    return await apiClient.patch(`/branches/${branchId}/menu/bulk`, payload);
  },

  syncBranchMenu: async (
    branchId: string,
  ): Promise<ApiResponse<{ syncedCount: number }>> => {
    return await apiClient.post(`/branches/${branchId}/menu/sync`);
  },
};
