import apiClient from '../api';

export const branchService = {
  getBranches: async () => {
    return await apiClient.get('/restaurants/branches');
  },

  getBranchById: async (id) => {
    return await apiClient.get(`/restaurants/branches/${id}`);
  },

  createBranch: async (data) => {
    return await apiClient.post('/restaurants/branches', data);
  },

  // Giả sử có API cho update và delete, nếu BE chưa có thì gọi sẽ báo lỗi 404
  updateBranch: async (id, data) => {
    return await apiClient.patch(`/restaurants/branches/${id}`, data);
  },

  deleteBranch: async (id) => {
    return await apiClient.delete(`/restaurants/branches/${id}`);
  }
};
