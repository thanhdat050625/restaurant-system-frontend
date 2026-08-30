import apiClient from '../api';
import { MenuItem, CreateMenuItemInput, UpdateMenuItemInput, QueryMenuItemsParams } from '../../types/menuItem.type';

export const menuItemService = {
  getAll: (params?: QueryMenuItemsParams) => {
    const query = new URLSearchParams();
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.search) query.append('search', params.search);
    if (params?.isFeatured !== undefined) query.append('isFeatured', String(params.isFeatured));
    if (params?.includeInactive !== undefined) query.append('includeInactive', String(params.includeInactive));

    const queryString = query.toString();
    return apiClient.get<MenuItem[]>(`/menu-items${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id: string) => {
    return apiClient.get<MenuItem>(`/menu-items/${id}`);
  },

  create: (data: CreateMenuItemInput) => {
    return apiClient.post<MenuItem>('/menu-items', data);
  },

  update: (id: string, data: UpdateMenuItemInput) => {
    return apiClient.patch<MenuItem>(`/menu-items/${id}`, data);
  },

  delete: (id: string) => {
    return apiClient.delete<MenuItem>(`/menu-items/${id}`);
  },
};
