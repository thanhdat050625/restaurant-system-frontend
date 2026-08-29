import apiClient from '../api';
import { ApiResponse } from '../../types/api-response.type';
import { ITableType } from '../../types/admin/table-type.type';

export const tableTypeService = {
  getTableTypes: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<ITableType[]>> => {
    return await apiClient.get('/tables/types', { params });
  },

  getTableTypeById: async (id: string): Promise<ApiResponse<ITableType>> => {
    return await apiClient.get(`/tables/types/${id}`);
  },

  createTableType: async (data: Partial<ITableType>): Promise<ApiResponse<ITableType>> => {
    return await apiClient.post('/tables/types', data);
  },

  updateTableType: async (id: string, data: Partial<ITableType>): Promise<ApiResponse<ITableType>> => {
    return await apiClient.patch(`/tables/types/${id}`, data);
  },

  deleteTableType: async (id: string): Promise<ApiResponse<null>> => {
    return await apiClient.delete(`/tables/types/${id}`);
  }
};
