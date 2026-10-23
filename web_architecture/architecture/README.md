# Frontend Architecture Overview (`r-fe/src`)

Kiến trúc Web Frontend được xây dựng theo mô hình **Modular Component-Driven Architecture** kết hợp với **Centralized API Service Layer**. Cách tiếp cận này giúp mã nguồn có tính module hóa cao, dễ mở rộng, kiểm soát chặt chẽ phân quyền (`Admin`, `Staff`, `Customer`) và bảo trì lâu dài.

---

## 1. Cấu trúc thư mục Source Code (`r-fe/src`)

```text
src/
├── assets/                # Hình ảnh tĩnh, logos, banners
├── components/            # UI Components tái sử dụng
│   ├── Admin/             # Sidebar, Topbar quản trị
│   ├── Staff/             # Sidebar, Topbar thao tác cho nhân viên
│   ├── common/            # ProtectedRoute, AdminRoute, StaffRoute, Pagination, Cards
│   └── ui/                # Modal.tsx, ConfirmModal.tsx
├── features/              # Các Domain Feature Modules có state riêng
│   ├── auth/              # AuthContext.tsx (quản lý phiên đăng nhập, JWT, role)
│   └── menu/              # CartContext.jsx (giỏ hàng đặt món)
├── hooks/                 # Custom Hooks dùng chung (ThemeContext.jsx - Light/Dark mode)
├── layouts/               # Khung bố cục chính
│   ├── Header.jsx         # Header khách hàng
│   ├── Footer.jsx         # Footer khách hàng
│   ├── PageWrapper.jsx    # Bọc container trang
│   ├── admin/AdminLayout.tsx
│   └── staff/StaffLayout.tsx
├── pages/                 # Các Page Components theo Route
│   ├── Home/              # Trang chủ nhà hàng
│   ├── Menu/              # Thực đơn, danh mục món ăn
│   ├── Reservation/       # Đặt bàn trực tuyến
│   ├── Cart/              # Giỏ hàng món ăn đã chọn
│   ├── Checkout/          # Thanh toán & Xác nhận đặt chỗ
│   ├── OrderTracking/     # Theo dõi trạng thái đơn hàng / đặt bàn
│   ├── Profile/           # Thông tin cá nhân khách hàng
│   ├── Auth/              # Login.jsx, Register.jsx, ForgotPassword.jsx
│   ├── Admin/             # Quản lý Branches, Menus, Tables, Staff, Dashboard
│   └── Staff/             # Thao tác nhanh cho nhân viên tại quầy
├── services/              # Axios instance (api.ts) và các API clients theo domain
├── types/                 # TypeScript interfaces (api-response, auth, menu, table, branch)
└── utils/                 # Hàm tiện ích (format VND, ngày tháng, validate)
```

---

## 2. Các tài liệu quy tắc chi tiết:

- [Data Flow & Luồng dữ liệu](data_flow.md)
- [UI & Component Rules](ui.md)
- [Services & API Communication](services_and_repositories.md)
- [State Management (Context API & Hooks)](state_management.md)
