---
name: fe-review-code
description: >-
  Review mã nguồn của branch hiện tại so với branch ui của Frontend.
---

# fe-review-code

Mục đích: Đánh giá chất lượng mã nguồn Frontend trước khi mở PR.

## Quy trình thực hiện (Workflow)

1. **So sánh branch với `ui`**:
   - `git diff ui...HEAD`
   - Xác định danh sách file và dòng thay đổi.
2. **Kiểm tra tuân thủ kiến trúc**:
   - Tuân thủ `fe-architecture-rules.md` và `fe-ui-ux-rules.md`.
   - Kiểm tra xem component có vượt quá 1000 dòng không.
   - Kiểm tra có dùng `window.confirm()` hay `alert()` native không (BẮT BUỘC dùng ConfirmModal/Modal).
   - Kiểm tra hỗ trợ Dark Mode và tương phản màu sắc.
3. **Báo cáo kết quả review**:
   - Điểm tốt (Strengths).
   - Điểm cần cải thiện (Improvement suggestions).
   - Các issue phát hiện theo chuẩn `shared-reporting-rules.md`.
