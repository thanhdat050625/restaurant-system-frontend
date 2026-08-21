import apiClient from '../api';

export const tableService = {
  getTables: async () => {
    return await apiClient.get('/tables');
  },

  getTablesByBranch: async (branchId) => {
    return await apiClient.get(`/tables/branch/${branchId}`);
  },

  getTableById: async (id) => {
    return await apiClient.get(`/tables/${id}`);
  },

  createTable: async (data) => {
    return await apiClient.post('/tables', data);
  },

  updateTable: async (id, data) => {
    return await apiClient.patch(`/tables/${id}`, data);
  },

  deleteTable: async (id) => {
    return await apiClient.delete(`/tables/${id}`);
  }
};
