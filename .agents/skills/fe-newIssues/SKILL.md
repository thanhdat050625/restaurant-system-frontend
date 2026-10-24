---
name: fe-newIssues
description: >-
  Tạo bản mô tả Issue/Task kỹ thuật chuẩn hóa cho Frontend.
---

# fe-newIssues

Mục đích: Định dạng và cấu trúc hóa một issue kỹ thuật (Bug report hoặc Feature request) cho Frontend.

## Mẫu Issue Chuẩn

```markdown
### Tiêu đề Issue: [Loại] Tên ngắn gọn

**Phân hệ**: [Auth / Home / Menu / Cart / Checkout / Admin / Staff / Profile]
**Mức độ ưu tiên**: [Thấp / Trung bình / Cao / Khẩn cấp]

#### 1. Mô tả chi tiết
[Mô tả bối cảnh hoặc màn hình cần triển khai/sửa lỗi]

#### 2. Yêu cầu kỹ thuật
- Component liên quan: `src/...`
- State / Context bị ảnh hưởng: ...
- API Service gọi: ...
- Yêu cầu UI: Hỗ trợ Light/Dark mode, Responsive mobile/desktop.

#### 3. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Giao diện hiển thị đúng thiết kế, không vỡ layout trên mobile.
- [ ] Tương phản màu sắc tốt ở cả 2 mode Light/Dark.
- [ ] Sử dụng Modal/ConfirmModal chuẩn hóa.
- [ ] `npm run build` không có lỗi TypeScript.
```
