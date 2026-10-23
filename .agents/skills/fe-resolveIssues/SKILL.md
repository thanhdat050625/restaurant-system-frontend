---
name: fe-resolveIssues
description: >-
  Tiếp nhận một Issue ID, tự động checkout branch mới từ ui và lập kế hoạch giải quyết.
---

# fe-resolveIssues

Mục đích: Giải quyết issue theo quy trình chuẩn từ nhánh mới của Frontend.

## Quy trình thực hiện (Workflow)

1. **Hiểu Issue**: Đọc nội dung mô tả issue, yêu cầu giao diện và acceptance criteria.
2. **Checkout Branch Mới**:
   ```bash
   git checkout ui
   git pull origin ui
   git checkout -b issue/<issue-id>-<tên-ngắn-gọn>
   ```
3. **Lập Implementation Plan**: Xác định các component cần sửa và giải pháp cụ thể.
4. **Chờ Phê Duyệt**: Đợi người dùng duyệt plan trước khi thực thi code.
5. **Sau khi hoàn thành**: Hướng dẫn dùng `/fe-createPR` để mở Pull Request vào `ui`.
