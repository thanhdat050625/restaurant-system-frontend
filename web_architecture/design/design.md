# Restaurant Web Design System & UI/UX Standards

## 1. Tổng quan & Tinh thần thiết kế (Design Philosophy)

Hệ thống giao diện Web của RRMS (FoodHub) được thiết kế theo phong cách **Modern Culinary & Warm Hospitality**, mang lại trải nghiệm ấm cúng, sang trọng và tiện lợi cho khách hàng khi đặt bàn, xem thực đơn và gọi món.

### Giá trị cốt lõi:
- **Ấm cúng & Hiện đại:** Sử dụng tông màu cam ấm (Warm Orange / Amber) kết hợp các dải màu trung tính, hỗ trợ hoàn hảo cả 2 chế độ **Light Mode** và **Dark Mode**.
- **Rõ ràng & Trực quan (Clarity & Usability):** Trạng thái bàn (trống/đang dùng), danh mục món ăn, giá tiền và nút Call-To-Action (CTA) được phân cấp thị giác rõ ràng.
- **Nhất quán theo Design Token:** Mọi màu sắc, phông chữ, khoảng cách và bo góc đều tuân thủ các utility classes của Tailwind CSS.

---

## 2. Hệ thống màu sắc & Lớp nền (Color Tokens)

Mọi component **BẮT BUỘC** hiển thị tương thích trên cả Light Mode và Dark Mode:

### 2.1 Bảng màu giao diện chuẩn

| Thành phần | Light Mode Class | Dark Mode Class | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Nền trang tổng thể (Page BG)** | `bg-gray-50` hoặc `bg-white` | `dark:bg-gray-900` | Nền toàn trang |
| **Nền Card / Box nội dung** | `bg-white` | `dark:bg-gray-800` | Card món ăn, Card bàn, Modal |
| **Đường viền (Border / Divider)** | `border-gray-200` | `dark:border-gray-700` | Phân cách giữa các thành phần |
| **Chữ tiêu đề chính (Heading)** | `text-gray-900` | `dark:text-white` | Tương phản cao nhất cho tiêu đề |
| **Chữ nội dung (Body text)** | `text-gray-700` | `dark:text-gray-200` | Văn bản mô tả món ăn, bảng dữ liệu |
| **Chữ phụ / Ghi chú (Muted text)**| `text-gray-500` | `dark:text-gray-400` | Ngày giờ, số điện thoại, nhãn phụ |
| **Primary Brand (Cam ấm)** | `bg-orange-600 hover:bg-orange-700` | `text-white` | Nút CTA chính ("Đặt bàn ngay", "Thanh toán") |

### 2.2 Trạng thái Nghiệp vụ Nhà hàng (Semantic Status)
| Trạng thái | Tailwind Class | Sử dụng cho |
| :--- | :--- | :--- |
| **Available / Thành công** | `text-green-600 bg-green-50 dark:bg-green-900/30` | Bàn trống, đặt bàn thành công, món còn hàng |
| **Occupied / Bận** | `text-red-600 bg-red-50 dark:bg-red-900/30` | Bàn đang có khách, đã hết bàn |
| **Pending / Chờ xử lý** | `text-amber-600 bg-amber-50 dark:bg-amber-900/30` | Đơn đặt bàn chờ nhân viên xác nhận |
| **Maintenance / Dirty** | `text-gray-600 bg-gray-100 dark:bg-gray-700` | Bàn đang dọn dẹp hoặc bảo trì |

---

## 3. Hệ thống Typography (Phông chữ)

- Font chữ chủ đạo: Sans-serif hiện đại (Inter, Roboto, hoặc System Sans).
- Phân cấp kích thước:
  - `text-2xl` đến `text-4xl font-bold`: Tiêu đề Hero, Tên chi nhánh, Banner.
  - `text-lg font-semibold`: Tên món ăn, Tên số bàn, Tiêu đề modal.
  - `text-base` / `text-sm`: Nội dung mô tả, giá tiền, form input labels.
  - `text-xs`: Giờ mở cửa, ghi chú số người tối đa của bàn.

---

## 4. Quy chuẩn Dialog, Modal & Thông Báo

1. **Tuyệt đối cấm:** `window.confirm()`, `window.alert()`, `window.prompt()`.
2. **Component Bắt Buộc Dùng:**
   - **`ConfirmModal.tsx`** (`src/components/ui/ConfirmModal.tsx`): Dùng cho các hành động quan trọng cần người dùng xác nhận rõ ràng trước khi thực hiện (Hủy đặt bàn, Xóa bàn, Xóa món ăn, Xóa nhân viên, Đăng xuất).
   - **`Modal.tsx`** (`src/components/ui/Modal.tsx`): Dùng cho form nhập liệu hoặc hiển thị chi tiết (Thêm bàn, Sửa giờ mở cửa, Đổi mật khẩu).
3. **Toast Notifications:**
   - Hiển thị phản hồi tức thì sau khi người dùng thực hiện thao tác (Đặt bàn thành công, Thêm vào giỏ món ăn, Cập nhật trạng thái bàn).

---

## 5. Quy chuẩn 4 Trạng Thái Hiển Thị (UI States)

Mọi component hoặc màn hình có fetch dữ liệu từ API **BẮT BUỘC** xử lý đủ 4 trạng thái:
1. **Loading State:** Skeleton loader hoặc Spinner rõ ràng trong lúc fetch dữ liệu.
2. **Error State:** Banner báo lỗi hoặc Toast kèm nút "Thử lại" (Retry).
3. **Empty State:** Icon minh họa kèm thông báo thân thiện khi danh sách rỗng (ví dụ: "Chưa có món ăn nào trong danh mục này", "Không có bàn trống phù hợp").
4. **Success State:** Hiển thị dữ liệu chính xác.
