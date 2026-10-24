# Frontend Architecture Rules (React + Vite + TypeScript)

Mọi thay đổi mã nguồn Front-end phải tuân thủ nghiêm ngặt các quy định kiến trúc sau.
Tài liệu kiến trúc chi tiết (Source of Truth): `web_architecture/`
- [README.md](../../web_architecture/README.md)
- [design.md](../../web_architecture/design/design.md)
- [architecture/](../../web_architecture/architecture/README.md)
- [navigation/](../../web_architecture/navigation/README.md)
- [localization/](../../web_architecture/localization/README.md)
- [feature-development/](../../web_architecture/feature-development/README.md)

## 1. Cấu Trúc Thư Mục & Phân Tầng
- `src/components/`: Chứa các UI component dùng chung (`common/`, `ui/`, `Admin/`, `Staff/`).
- `src/features/`: Chứa các tính năng có state nghiệp vụ riêng biệt (`auth/`, `menu/`, `dashboard/`, `user/`).
- `src/layouts/`: Các khung bố cục chính (`Header.jsx`, `Footer.jsx`, `admin/AdminLayout.tsx`, `staff/StaffLayout.tsx`).
- `src/pages/`: Các màn hình route ứng với URL (`Home/`, `Menu/`, `Admin/`, `Staff/`, `Auth/`).
- `src/services/`: Chứa Axios API clients và các service gọi Backend.
- `src/types/`: Khai báo TypeScript types/interfaces cho API responses và domain models.

## 2. API Communication & Axios Client
- Mọi API call phải đi qua instance Axios cấu hình tại `src/services/api.ts`.
- Không gọi trực tiếp `fetch()` hoặc tạo Axios instance mới không có Interceptor.
- Tự động đính kèm Bearer Access Token trong Header `Authorization`. Khi gặp HTTP 401, Interceptor phải xử lý refresh token tự động.

## 3. Quản Lý Trạng Thái (State Management) & Context
- Dùng `AuthContext.tsx` để quản lý phiên đăng nhập và thông tin user hiện tại.
- Dùng `CartContext.jsx` để quản lý giỏ hàng và danh sách món đã chọn.
- Dùng `ThemeContext.jsx` để chuyển đổi Light/Dark mode.
- Tránh truyền props quá 3 tầng (Prop drilling), hãy sử dụng Context API hoặc custom hooks.

## 4. Quy Chuẩn Code & Kích Thước File
- Không để bất kỳ file component nào vượt quá **400 dòng**. Chủ động chia nhỏ thành sub-components (như Modal, Row item, Filter bar) hoặc custom hooks.
- Bắt buộc dùng `ConfirmModal.tsx` và `Modal.tsx`, tuyệt đối không dùng `window.confirm` hay `alert()` native.
