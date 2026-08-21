import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Định nghĩa lại module axios để ép kiểu trả về trực tiếp là generic T (data từ BE)
// chứ không còn bị bọc trong AxiosResponse nữa.
declare module 'axios' {
  export interface AxiosInstance {
    request<T = any, R = T>(config: any): Promise<R>;
    get<T = any, R = T>(url: string, config?: any): Promise<R>;
    delete<T = any, R = T>(url: string, config?: any): Promise<R>;
    head<T = any, R = T>(url: string, config?: any): Promise<R>;
    options<T = any, R = T>(url: string, config?: any): Promise<R>;
    post<T = any, R = T>(url: string, data?: any, config?: any): Promise<R>;
    put<T = any, R = T>(url: string, data?: any, config?: any): Promise<R>;
    patch<T = any, R = T>(url: string, data?: any, config?: any): Promise<R>;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
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
  (response: AxiosResponse) => {
    // Interceptor chặn lại và trả về data
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Nếu lỗi 401 và chưa từng retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Bỏ qua nếu lỗi xuất phát từ chính API login hoặc refresh
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Đưa vào hàng đợi nếu đang có request refresh khác chạy
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(() => {
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