---
name: fe-newFeature
description: >-
  Tiếp nhận mô tả của user về chức năng UI / màn hình mới và xây dựng Implementation Plan trước khi triển khai.
---

# fe-newFeature

Mục đích: Tiếp nhận mô tả tính năng UI mới và xây dựng Implementation Plan trước khi triển khai.

## Dependencies
- [Shared Workflow](../../rules/shared-workflow.md)
- [Frontend Architecture Rules](../../rules/fe-architecture-rules.md)
- [Frontend UI/UX Rules](../../rules/fe-ui-ux-rules.md)
- [Frontend Git Rules](../../rules/fe-git-rules.md)

## Quy trình thực hiện (Workflow)

### Step 1 — Understand Requirement
Đọc và phân tích toàn bộ mô tả chức năng user cung cấp:
- Mục tiêu, Actor (Customer, Staff, Admin)
- Bố cục màn hình, Component tree
- State management & Props truyền qua lại
- API Service gọi Backend (endpoints, request/response types)
- Trạng thái UI: Loading, Empty, Error, Success Toast

### Step 2 — Inspect Existing Code
Tìm các component/layout có sẵn trong `src/components/`, `src/pages/`, `src/layouts/`.
**Ràng buộc:** Bắt buộc tái sử dụng `ConfirmModal`, `Modal`, `Pagination` hoặc các form control đã chuẩn hóa.

### Step 3 — Create Implementation Plan
Tạo Implementation Plan chỉ rõ:
- Checkout branch mới từ `ui`: `feature/<feature-name>`
- Files cần tạo mới [NEW] và files cần sửa đổi [MODIFY]
- Chi tiết TypeScript interfaces trong `src/types/`
- Chi tiết API Service trong `src/services/`
- Component hierarchy và styling Tailwind CSS (hỗ trợ Dark Mode)
- Verification Plan (Build test `npm run build`, responsive check)

**STOP CONDITION:** KHÔNG được viết code ngay nếu user chưa duyệt plan. Chỉ đưa ra plan và đợi XÁC NHẬN (Approval).
