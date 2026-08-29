import apiClient from '../api';
import { ApiResponse } from '../../types/api-response.type';
import {
  MenuCategory,
  CreateMenuCategoryInput,
  UpdateMenuCategoryInput,
  QueryMenuCategoriesParams,
} from '../../types/menuCategory.type';

export const menuCategoryService = {
  getAll: (params?: QueryMenuCategoriesParams | boolean): Promise<ApiResponse<MenuCategory[]>> => {
    let queryParams: QueryMenuCategoriesParams = {};
    if (typeof params === 'boolean') {
      queryParams = { includeInactive: params };
    } else if (params) {
      queryParams = params;
    }
    return apiClient.get('/menu-categories', { params: queryParams });
  },

  getById: (id: string): Promise<ApiResponse<MenuCategory>> => {
    return apiClient.get(`/menu-categories/${id}`);
  },

  create: (data: CreateMenuCategoryInput): Promise<ApiResponse<MenuCategory>> => {
    return apiClient.post('/menu-categories', data);
  },

  update: (id: string, data: UpdateMenuCategoryInput): Promise<ApiResponse<MenuCategory>> => {
    return apiClient.patch(`/menu-categories/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<MenuCategory>> => {
    return apiClient.delete(`/menu-categories/${id}`);
  },
};
