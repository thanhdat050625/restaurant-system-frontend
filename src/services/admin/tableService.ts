import apiClient from '../api';
import { ApiResponse } from '../../types/api-response.type';
import { ITable } from '../../types/admin/table.type';

export const tableService = {
  getTables: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<ITable[]>> => {
    return await apiClient.get('/tables', { params });
  },

  getTablesByBranch: async (branchId: string): Promise<ApiResponse<ITable[]>> => {
    return await apiClient.get(`/tables/branch/${branchId}`);
  },

  getTableById: async (id: string): Promise<ApiResponse<ITable>> => {
    return await apiClient.get(`/tables/${id}`);
  },

  createTable: async (data: Partial<ITable>): Promise<ApiResponse<ITable>> => {
    return await apiClient.post('/tables', data);
  },

  bulkCreateTables: async (data: any): Promise<ApiResponse<{ message: string, count: number }>> => {
    return await apiClient.post('/tables/bulk', data);
  },

  updateTable: async (id: string, data: Partial<ITable>): Promise<ApiResponse<ITable>> => {
    return await apiClient.patch(`/tables/${id}`, data);
  },

  deleteTable: async (id: string): Promise<ApiResponse<null>> => {
    return await apiClient.delete(`/tables/${id}`);
  }
};
