import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa từng retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Bỏ qua nếu lỗi xuất phát từ chính API login hoặc refresh
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Đưa vào hàng đợi nếu đang có request refresh khác chạy
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API refresh
        await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        
        isRefreshing = false;
        processQueue(null, 'refreshed');
        
        // Gọi lại request ban đầu bị lỗi
        return apiClient(originalRequest);
      } catch (err) {
        isRefreshing = false;
        processQueue(err, null);
        
        // Refresh token cũng hết hạn -> Hủy phiên
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;