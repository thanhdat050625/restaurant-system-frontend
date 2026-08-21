import apiClient from '../api';
import { ApiResponse } from '../../types/api-response.type';
import { ITable } from '../../types/admin/table.type';

export const tableService = {
  getTables: async (): Promise<ApiResponse<ITable[]>> => {
    return await apiClient.get('/tables');
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

  updateTable: async (id: string, data: Partial<ITable>): Promise<ApiResponse<ITable>> => {
    return await apiClient.patch(`/tables/${id}`, data);
  },

  deleteTable: async (id: string): Promise<ApiResponse<null>> => {
    return await apiClient.delete(`/tables/${id}`);
  }
};
