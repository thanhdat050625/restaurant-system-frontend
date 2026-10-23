# UI & Component Rules (React 19 + Tailwind CSS)

Tài liệu này quy định các tiêu chuẩn bắt buộc khi xây dựng và tái cấu trúc các React Components trong Web Frontend Nhà hàng.

---

## 1. Phân loại Component

1. **Page Components (`src/pages/*`):**
   - Đóng vai trò là điểm gắn kết (Container) cho một Route URL cụ thể.
   - Quản lý fetching dữ liệu khởi tạo của trang (`useEffect`), phân trang và kết hợp các sub-components.
2. **Feature Components (`src/features/*/components/*` hoặc sub-components của page):**
   - Các component gắn liền với một nghiệp vụ cụ thể (ví dụ: `TableForm.tsx`, `BranchOperatingHoursModal.tsx`, `ParallaxMenu.jsx`, `CartItem.jsx`).
3. **Common UI Components (`src/components/common/*` và `src/components/ui/*`):**
   - Các component dùng chung toàn hệ thống (ví dụ: `Modal.tsx`, `ConfirmModal.tsx`, `Pagination.tsx`, `ScrollToTop.jsx`, `MenuCard.jsx`).
4. **Layout Components (`src/layouts/*`):**
   - Định dạng khung trang: `Header.jsx`, `Footer.jsx`, `PageWrapper.jsx`, `AdminLayout.tsx`, `StaffLayout.tsx`.

---

## 2. Quy tắc Coding Component

### 2.1 Tách biệt Presentation và Business Logic
- Các component hiển thị không chứa quá nhiều hàm tính toán phức tạp.
- Tách logic phức tạp thành Custom Hook hoặc đưa vào Service xử lý.

### 2.2 Quy tắc Giới hạn Độ dài File (Tối đa 400 dòng)
- Tuyệt đối không để bất kỳ component nào vượt quá **400 dòng code**.
- Khi một file tiệm cận 300 dòng, chủ động tách thành:
  - Sub-component form nhập liệu: `...Form.tsx` hoặc `...Modal.tsx`.
  - Sub-component từng hàng của table: `...TableRow.tsx`.
  - Custom hook: `use...Data.ts`.

### 2.3 Quy chuẩn Styling với Tailwind CSS
- Sử dụng nhất quán class hỗ trợ cả Light/Dark mode: `bg-white dark:bg-gray-800`, `text-gray-900 dark:text-white`.
- Sử dụng màu thương hiệu chuẩn: `bg-orange-600 hover:bg-orange-700 text-white`.
- **TUYỆT ĐỐI KHÔNG** dùng inline styles với mã hex tùy tiện (ví dụ: `style={{ color: '#123456' }}`).

### 2.4 Quản lý 4 Trạng thái Hiển thị (UI States)
Mọi component fetch dữ liệu từ API **BẮT BUỘC** phải xử lý đủ:
1. **Loading State:** Skeleton loader hoặc Spinner.
2. **Error State:** Banner/Alert báo lỗi kèm nút "Thử lại" (Retry).
3. **Empty State:** Icon minh họa kèm thông báo khi danh sách rỗng ("Không có dữ liệu bàn", "Chưa có món ăn nào").
4. **Success State:** Hiển thị dữ liệu.

---

## 3. Quy chuẩn Modal & Confirmation Dialog

- Nghiêm cấm dùng `window.confirm()` và `window.alert()`.
- Bắt buộc tái sử dụng:
  - `ConfirmModal.tsx` cho các hành động xóa / hủy / xác nhận nguy hiểm.
  - `Modal.tsx` cho form nhập liệu hoặc xem thông tin chi tiết.
