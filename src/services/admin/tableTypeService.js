import apiClient from '../api';

export const tableTypeService = {
  getTableTypes: async () => {
    return await apiClient.get('/tables/types');
  },

  getTableTypeById: async (id) => {
    return await apiClient.get(`/tables/types/${id}`);
  },

  createTableType: async (data) => {
    return await apiClient.post('/tables/types', data);
  },

  updateTableType: async (id, data) => {
    return await apiClient.patch(`/tables/types/${id}`, data);
  },

  deleteTableType: async (id) => {
    return await apiClient.delete(`/tables/types/${id}`);
  }
};
