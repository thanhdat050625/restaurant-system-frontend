---
name: fe-reviewPR
description: >-
  Workflow tổng hợp để review toàn diện PR của Frontend trước khi bấm merge vào ui.
---

# fe-reviewPR

Mục đích: Đánh giá toàn diện chất lượng PR (UI/UX, Kiến trúc, Bảo mật, Responsive, Dark Mode) và hỗ trợ merge khi được người dùng chấp thuận.

## Dependencies
- [fe-review-code](../fe-review-code/SKILL.md)
- [fe-reviewSecurityPerformance](../fe-reviewSecurityPerformance/SKILL.md)
- [Frontend Git Rules](../../rules/fe-git-rules.md)
- [Frontend UI/UX Rules](../../rules/fe-ui-ux-rules.md)

## Quy trình thực hiện (Workflow)

1. **So sánh branch với `ui`**: Đọc toàn bộ diff.
2. **Đánh giá logic & kiến trúc**: Kiểm tra Component, Props, Hooks, State, Service.
3. **Đánh giá UI/UX**: Kiểm tra Tailwind classes, độ tương phản Light/Dark mode, Responsive, sử dụng `ConfirmModal` thay vì native dialog.
4. **Tạo Audit Report**: Tổng hợp các điểm đạt và các issue cần sửa.
5. **DỪNG LẠI CHỜ PHÊ DUYỆT**:
   - **Ràng buộc nghiêm ngặt:** Sau khi lập report, Agent KHÔNG ĐƯỢC tự ý merge. Phải chờ người dùng gõ xác nhận đồng ý.
6. **Thực hiện merge (Khi được duyệt)**:
   - `git checkout ui && git pull origin ui`
   - `git merge <feature-branch>`
   - `git push origin ui`
