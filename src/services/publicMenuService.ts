import apiClient from './api';
import { ApiResponse, PaginatedResponse } from '../types/api-response.type';
import { MenuCategory } from '../types/menuCategory.type';
import { MenuItem } from '../types/menuItem.type';

export interface IQueryMenuItemsPublic {
  categoryId?: string;
  search?: string;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}

export const publicMenuService = {
  /**
   * Lấy danh sách danh mục món ăn chuỗi đang hoạt động
   */
  getCategories: async (): Promise<MenuCategory[]> => {
    try {
      const response = await apiClient.get<ApiResponse<MenuCategory[]>>('/menu-categories', {
        params: { includeInactive: false, limit: 100 },
      });

      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray((response as any)?.data?.items)) return (response as any).data.items;
      return [];
    } catch (error) {
      console.error('Failed to fetch menu categories:', error);
      return [];
    }
  },

  /**
   * Lấy danh sách món ăn chuỗi công khai
   */
  getMenuItems: async (params?: IQueryMenuItemsPublic): Promise<MenuItem[]> => {
    try {
      const response = await apiClient.get<ApiResponse<MenuItem[]>>('/menu-items', {
        params: {
          includeInactive: false,
          limit: params?.limit || 100,
          page: params?.page || 1,
          categoryId: params?.categoryId,
          search: params?.search,
          isFeatured: params?.isFeatured,
        },
      });

      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray((response as any)?.data?.items)) return (response as any).data.items;
      return [];
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      return [];
    }
  },

  /**
   * Lấy chi tiết một món ăn
   */
  getMenuItemById: async (id: string): Promise<MenuItem | null> => {
    try {
      const response = await apiClient.get<ApiResponse<MenuItem>>(`/menu-items/${id}`);
      return response?.data || (response as any) || null;
    } catch (error) {
      console.error(`Failed to fetch menu item ${id}:`, error);
      return null;
    }
  },
};
