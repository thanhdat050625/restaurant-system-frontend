---
name: fe-analyzeTask
description: >-
  Phân tích một task Frontend trước khi bắt đầu implementation.
  Không thực hiện thay đổi code, chỉ trả về phân tích scope, UI/UX, responsive và state flow.
---

# fe-analyzeTask

Mục đích: Phân tích một task Frontend trước khi bắt đầu implementation.

## Quy trình thực hiện (Workflow)

### Step 1 — Analyze
Đọc yêu cầu task, phân tích trong ngữ cảnh của codebase React + Vite hiện tại:
- Yêu cầu chức năng & UI/UX (Requirement)
- Phạm vi thay đổi (Scope)
- Màn hình / Component / Context bị ảnh hưởng
- Phân tích Responsive (Mobile, Tablet, Desktop)
- Hỗ trợ Light / Dark theme
- API endpoints cần kết nối từ Backend
- Rủi ro phá vỡ layout hiện có
- Đề xuất phương án tái sử dụng UI component

### Step 2 — Report
Trình bày kết quả phân tích theo cấu trúc trên.
**Ràng buộc:** Skill này KHÔNG được phép tự viết code.
