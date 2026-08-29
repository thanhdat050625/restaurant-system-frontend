import apiClient from '../api';
import { MenuCategory, CreateMenuCategoryInput, UpdateMenuCategoryInput } from '../../types/menuCategory.type';

export const menuCategoryService = {
  getAll: (includeInactive = false) => {
    return apiClient.get<MenuCategory[]>(`/menu-categories${includeInactive ? '?includeInactive=true' : ''}`);
  },

  getById: (id: string) => {
    return apiClient.get<MenuCategory>(`/menu-categories/${id}`);
  },

  create: (data: CreateMenuCategoryInput) => {
    return apiClient.post<MenuCategory>('/menu-categories', data);
  },

  update: (id: string, data: UpdateMenuCategoryInput) => {
    return apiClient.patch<MenuCategory>(`/menu-categories/${id}`, data);
  },

  delete: (id: string) => {
    return apiClient.delete<MenuCategory>(`/menu-categories/${id}`);
  },
};
