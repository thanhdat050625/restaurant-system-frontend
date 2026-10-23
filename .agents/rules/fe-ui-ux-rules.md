# Frontend UI/UX & Styling Rules

Mọi thay đổi liên quan đến Giao diện người dùng (UI) và Trải nghiệm người dùng (UX) phải tuân thủ nghiêm ngặt các quy định sau:

## 1. Thiết Kế & Hỗ Trợ Light / Dark Theme
- Mọi component mới hoặc sửa đổi đều phải hiển thị tốt ở cả 2 chế độ **Light Mode** và **Dark Mode**.
- Sử dụng các class của Tailwind: `bg-white dark:bg-gray-800`, `text-gray-900 dark:text-white`, `border-gray-200 dark:border-gray-700`.
- Không hardcode màu chữ tối trên nền tối hoặc chữ sáng trên nền sáng gây mất tương phản.

## 2. Dialog, Modal & Thông Báo Người Dùng
- **Tuyệt đối cấm**: `window.confirm()` và `window.alert()`.
- **Bắt buộc dùng**:
  - `ConfirmModal`: Dành cho các thao tác quan trọng cần xác nhận (xóa bàn, xóa món, khóa tài khoản, đăng xuất).
  - `Modal`: Dành cho form nhập liệu hoặc hiển thị thông tin chi tiết.
- Sử dụng Toast notification để thông báo trạng thái thành công hoặc thất bại sau các thao tác gọi API.

## 3. Responsive & Trạng Thái Tải (Loading States)
- Giao diện phải tương thích tốt từ Mobile (sm: >=640px) đến Desktop (lg: >=1024px).
- Bắt buộc xử lý các trạng thái:
  - **Loading**: Hiển thị Spinner hoặc Skeleton khi đang fetch dữ liệu.
  - **Empty State**: Hiển thị thông báo thân thiện và icon khi danh sách trống.
  - **Error State**: Hiển thị thông báo lỗi rõ ràng kèm nút thử lại (Retry).
