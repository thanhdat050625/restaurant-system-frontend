---
name: fe-fixbug
description: >-
  Phân tích bug giao diện/state và tạo Implementation Plan để sửa bug trên Frontend.
  Truy vết root cause và đưa ra phương án sửa lỗi an toàn.
---

# fe-fixbug

Mục đích: Phân tích bug giao diện, state hoặc API integration và tạo Implementation Plan để sửa bug.

## Dependencies
- [Shared Workflow](../../rules/shared-workflow.md)
- [Frontend Architecture Rules](../../rules/fe-architecture-rules.md)
- [Frontend UI/UX Rules](../../rules/fe-ui-ux-rules.md)
- [Frontend Git Rules](../../rules/fe-git-rules.md)

## Quy trình thực hiện (Workflow)

### Step 1 — Understand Bug
Đọc kỹ mô tả lỗi, hành vi không mong muốn hoặc console error log:
- Expected behavior vs Actual behavior
- Điều kiện tái hiện lỗi (kích thước màn hình, thao tác click, trạng thái auth)
- Component và hook bị ảnh hưởng

### Step 2 — Trace Root Cause
- Truy vết luồng: `User Action -> Component Event Handler -> State Hook -> Context / API Service -> Render`
- Kiểm tra các commit gần đây xem thay đổi nào dẫn đến bug (`git log`, `git blame`)
- Xác định nguyên nhân gốc rễ (Root Cause), phân biệt với triệu chứng bên ngoài

### Step 3 — Create Implementation Plan
- Checkout branch mới từ `ui`: `fix/<bug-name>`
- Files cần sửa đổi [MODIFY]
- Kế hoạch sửa đổi chi tiết
- Đảm bảo không làm vỡ Dark Mode hay Responsive trên thiết bị khác

**STOP CONDITION:** KHÔNG được sửa code ngay nếu user chỉ yêu cầu tạo plan.
