# Web Frontend Architecture (`Restaurant System Frontend - RRMS Web`)

Thư mục này chứa toàn bộ quy tắc về kiến trúc (architecture), thiết kế giao diện (design system) và chuẩn phát triển bắt buộc đối với tất cả AI Agents khi làm việc trên dự án Web Frontend (`r-fe/`).

---

## 1. Công nghệ & Stack cốt lõi (Tech Stack)

- **Framework & Runtime:** React 19 + TypeScript (strict mode) + JSX
- **Build Tool:** Vite (`@vitejs/plugin-react`)
- **Styling:** Tailwind CSS (kết hợp Light Mode & Dark Mode)
- **Routing:** React Router DOM v6/v7
- **State Management:**
  - Scoped Domain State: React Context API (`AuthContext`, `CartContext`, `ThemeContext`)
  - Local Component State: React `useState` / `useReducer`
- **HTTP Client:** Axios (cấu hình tập trung tại `src/services/api.ts` với Request/Response Interceptors)
- **Icons:** Lucide React / Heroicons / React Icons
- **UI Components:** Hệ thống Component dùng chung chuẩn hóa (`Modal.tsx`, `ConfirmModal.tsx`, `Pagination.tsx`)

---

## 2. Nguyên tắc bất di bất dịch (Core Principles)

1. **AI Agent BẮT BUỘC** phải đọc các rule trong thư mục này trước khi triển khai hoặc chỉnh sửa code.
2. **Feature Tham Chiếu (Reference Architecture):**
   - **Authentication & User Flow:** `src/features/auth/AuthContext.tsx`, `src/pages/Auth/Login.jsx`, `Register.jsx`.
   - **Menu & Cart:** `src/features/menu/CartContext.jsx`, `src/pages/Menu/Menu.jsx`, `src/pages/Cart/Cart.jsx`.
   - **Admin & Staff Management:** `src/layouts/admin/AdminLayout.tsx`, `src/layouts/staff/StaffLayout.tsx`, `src/pages/Admin/*`.
3. **API Service Client:** Toàn bộ API calls phải thông qua Axios client tại `src/services/api.ts`, **KHÔNG BAO GIỜ** gọi `fetch()` hay tạo Axios instance tự do trong React component.
4. **Không Over-engineering:** Tái sử dụng các UI components sẵn có (`src/components/common/`, `src/components/ui/`), hook dùng chung và design token trước khi tạo mới.
5. **Giới hạn kích thước file:** Không component nào được vượt quá **400 dòng**.

---

## 3. Cấu trúc tài liệu chi tiết:

- [`architecture/`](architecture/README.md): Quy tắc phân tầng (UI, Service, Types, State Management).
- [`design/`](design/design.md): Design System, Bảng màu Light/Dark Mode, Typography, Modal/Toast rules.
- [`navigation/`](navigation/README.md): Quy tắc Routing và Route Guards (`ProtectedRoute`, `AdminRoute`, `StaffRoute`).
- [`feature-development/`](feature-development/README.md): Quy trình phát triển tính năng mới từ API Service đến UI.
- [`localization/`](localization/README.md): Quy tắc hiển thị text Tiếng Việt, định dạng tiền tệ VNĐ và thông báo chuẩn.
