import apiClient from '../api';
import { ApiResponse } from '../../types/api-response.type';
import { ITable, QueryRestaurantTableParams } from '../../types/admin/table.type';

export interface ITableTurnoverSummary {
  total: number;
  available: number;
  occupied: number;
  dirty: number;
  maintenance: number;
  occupancyRate: number;
}

export interface ITableTurnoverResponse {
  branchId: string;
  summary: ITableTurnoverSummary;
  floors: {
    floor: number;
    tables: ITable[];
  }[];
}

export const tableService = {
  getTables: async (params?: QueryRestaurantTableParams): Promise<ApiResponse<ITable[]>> => {
    return await apiClient.get('/tables', { params });
  },

  getTablesByBranch: async (branchId: string): Promise<ApiResponse<ITable[]>> => {
    return await apiClient.get(`/tables/branch/${branchId}`);
  },

  getTableTurnover: async (branchId: string): Promise<ApiResponse<ITableTurnoverResponse>> => {
    return await apiClient.get(`/tables/branch/${branchId}/turnover`);
  },

  updateTableStatus: async (
    id: string,
    status: string,
    note?: string,
  ): Promise<ApiResponse<ITable>> => {
    return await apiClient.patch(`/tables/${id}/status`, { status, note });
  },

  getTableById: async (id: string): Promise<ApiResponse<ITable>> => {
    return await apiClient.get(`/tables/${id}`);
  },

  createTable: async (data: Partial<ITable>): Promise<ApiResponse<ITable>> => {
    return await apiClient.post('/tables', data);
  },

  bulkCreateTables: async (data: any): Promise<ApiResponse<{ message: string; count: number }>> => {
    return await apiClient.post('/tables/bulk', data);
  },

  updateTable: async (id: string, data: Partial<ITable>): Promise<ApiResponse<ITable>> => {
    return await apiClient.patch(`/tables/${id}`, data);
  },

  deleteTable: async (id: string): Promise<ApiResponse<null>> => {
    return await apiClient.delete(`/tables/${id}`);
  },
};
