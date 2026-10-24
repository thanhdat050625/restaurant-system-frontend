---
name: fe-reviewSecurityPerformance
description: >-
  Đánh giá an toàn thông tin (XSS, Auth Token) và hiệu năng hiển thị của code Frontend.
---

# fe-reviewSecurityPerformance

Mục đích: Đánh giá bảo mật và hiệu năng của code mới trên Frontend.

## Checklist Bảo Mật
- [ ] Có nguy cơ tấn công XSS qua `dangerouslySetInnerHTML` hay không?
- [ ] Token xác thực có được xử lý an toàn trong Header Authorization và xóa sạch khi logout không?
- [ ] Các route nhạy cảm có được bảo vệ bằng `ProtectedRoute`, `AdminRoute`, `StaffRoute` không?
- [ ] Có để lộ thông tin nhạy cảm trong mã nguồn JavaScript bundle không?

## Checklist Hiệu Năng
- [ ] Có bị re-render vô tận hoặc re-render thừa thãi do thiếu dependency trong `useEffect` / `useMemo` / `useCallback` không?
- [ ] Danh sách dài có phân trang (`Pagination.tsx`) để tránh lag DOM không?
- [ ] Hình ảnh món ăn/banner có xử lý fallback khi link hỏng không?
- [ ] Có import thừa các thư viện cồng kềnh làm phình bundle size không?
