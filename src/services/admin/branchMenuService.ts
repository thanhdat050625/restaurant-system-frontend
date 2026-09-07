import apiClient from '../api';
import { ApiResponse } from '../../types/api-response.type';
import {
  IBranchMenuResponse,
  IBranchMenuItem,
  IQueryBranchMenuParams,
  IBulkUpdateBranchMenu,
} from '../../types/admin/branch-menu.type';

export const branchMenuService = {
  /**
   * Lấy danh sách thực đơn của chi nhánh kèm thống kê KPI
   */
  getBranchMenu: async (
    branchId: string,
    params?: IQueryBranchMenuParams,
  ): Promise<ApiResponse<IBranchMenuResponse>> => {
    return await apiClient.get(`/branches/${branchId}/menu`, { params });
  },

  /**
   * Khách hàng xem thực đơn chi nhánh (Public)
   */
  getPublicBranchMenu: async (
    branchId: string,
    params?: IQueryBranchMenuParams,
  ): Promise<ApiResponse<IBranchMenuResponse>> => {
    return await apiClient.get(`/branches/${branchId}/menu/public`, { params });
  },

  /**
   * Bật/tắt trạng thái Còn hàng / Tạm hết hôm nay (1 chạm)
   */
  toggleAvailability: async (
    branchId: string,
    menuItemId: string,
    isAvailable: boolean,
  ): Promise<ApiResponse<IBranchMenuItem>> => {
    return await apiClient.patch(`/branches/${branchId}/menu/${menuItemId}/availability`, {
      isAvailable,
    });
  },

  /**
   * Bật/tắt trạng thái kinh doanh món này tại chi nhánh
   */
  toggleStatus: async (
    branchId: string,
    menuItemId: string,
    isActive: boolean,
  ): Promise<ApiResponse<IBranchMenuItem>> => {
    return await apiClient.patch(`/branches/${branchId}/menu/${menuItemId}/status`, {
      isActive,
    });
  },

  /**
   * Thiết lập hoặc xóa giá riêng (Price Override) của chi nhánh
   */
  updatePriceOverride: async (
    branchId: string,
    menuItemId: string,
    priceOverride: number | null,
  ): Promise<ApiResponse<IBranchMenuItem>> => {
    return await apiClient.patch(`/branches/${branchId}/menu/${menuItemId}/price`, {
      priceOverride,
    });
  },

  /**
   * Cập nhật trạng thái Còn/Hết hàng loạt cho các món được chọn
   */
  bulkUpdateAvailability: async (
    branchId: string,
    menuItemIds: string[],
    isAvailable: boolean,
  ): Promise<ApiResponse<{ updatedCount: number }>> => {
    const payload: IBulkUpdateBranchMenu = { menuItemIds, isAvailable };
    return await apiClient.patch(`/branches/${branchId}/menu/bulk`, payload);
  },

  /**
   * Đồng bộ các món mới từ chuỗi vào chi nhánh
   */
  syncBranchMenu: async (
    branchId: string,
  ): Promise<ApiResponse<{ syncedCount: number }>> => {
    return await apiClient.post(`/branches/${branchId}/menu/sync`);
  },
};
