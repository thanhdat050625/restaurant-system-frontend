# Services & API Communication (Web Frontend)

Tài liệu này mô tả chi tiết cách tổ chức tầng gọi API trong ứng dụng Web Frontend của RRMS.

---

## 1. Cấu Trúc Axios Client Tập Trung (`src/services/api.ts`)

Mọi giao tiếp HTTP với Backend bắt buộc phải thông qua instance Axios cấu hình tại `src/services/api.ts`.

### Thiết lập tiêu chuẩn:
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Gắn Bearer Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Tự động Refresh Token khi gặp HTTP 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Thực hiện refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken } = res.data.data;
        localStorage.setItem('access_token', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 2. Tổ chức Domain Services (`src/services/`)

Các hàm gọi API được gom nhóm theo từng phân hệ nghiệp vụ:
- `src/services/admin/branchService.ts`: Quản lý chi nhánh, giờ hoạt động.
- `src/services/admin/tableService.ts`: Quản lý bàn, loại bàn.
- `src/services/admin/menuService.ts`: Quản lý danh mục, món ăn, giá theo chi nhánh.
- `src/services/reservationService.ts`: Đặt bàn, kiểm tra bàn trống.
- `src/services/authService.ts`: Đăng nhập, đăng ký, đăng xuất, profile.

---

## 3. Lợi ích & Nguyên tắc thực thi

1. **Bảo mật:** Không để rò rỉ token, tập trung hóa xử lý lỗi phiên đăng nhập tại một nơi duy nhất.
2. **Không hardcode:** URL backend luôn được nạp từ biến môi trường `VITE_API_BASE_URL`.
3. **Type Safety:** Định nghĩa kiểu trả về rõ ràng với TypeScript interfaces tại `src/types/`.
