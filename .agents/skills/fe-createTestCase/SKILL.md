---
name: fe-createTestCase
description: >-
  Xây dựng ma trận kịch bản kiểm thử người dùng (User Test Cases) cho màn hình Frontend.
---

# fe-createTestCase

Mục đích: Thiết lập bộ test case chi tiết cho giao diện và luồng tương tác người dùng mà không sửa đổi code.

## Quy trình thực hiện (Workflow)

1. **Đọc mã nguồn component**: Props, State, Form inputs, Event handlers, API calls.
2. **Liệt kê các trường hợp kiểm thử**:
   - Happy Path: Nhập form hợp lệ, submit thành công, hiển thị Toast thông báo và chuyển hướng route.
   - Validation Errors: Bỏ trống trường bắt buộc, nhập sai định dạng email/số điện thoại, hiển thị lỗi màu đỏ.
   - UI States: Loading spinner khi đang gửi request, Empty state khi danh sách rỗng.
   - Responsive & Theme: Kiểm tra hiển thị trên Mobile vs Desktop; kiểm tra độ tương phản trên Light vs Dark mode.
   - Dialog & Modal: Mở Modal, xác nhận đóng modal qua backdrop click / nút hủy / nút Escape.
3. **Trình bày dưới dạng bảng Markdown**:
   | Test Case ID | Tên kịch bản | Pre-condition | User Steps | Expected UI Result | Theme / Device |
