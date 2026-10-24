# Shared Workflow Rules

Mọi Skill của AI Agent đều phải tuân thủ quy trình chung (Shared Workflow) sau đây.
Không được nhảy thẳng vào viết code hoặc thực hiện thay đổi khi chưa hoàn thành các bước hiểu và phân tích.

## Quy trình chuẩn (Standard Workflow)

1. **Understand (Hiểu yêu cầu)**
   - Đọc kỹ yêu cầu của user.
   - Xác định rõ mục tiêu, phạm vi thay đổi.
2. **Inspect Repository (Kiểm tra kho lưu trữ)**
   - Kiểm tra trạng thái git hiện tại (`git status`, branch hiện tại).
3. **Inspect Architecture (Kiểm tra kiến trúc)**
   - Đọc các tài liệu kiến trúc Frontend trong `fe-architecture-rules.md`, `fe-ui-ux-rules.md`, `AGENTS.md` và chi tiết tại `web_architecture/` (kèm `web_architecture/design/design.md`).
4. **Inspect Existing Implementation (Kiểm tra mã nguồn hiện tại)**
   - Tìm các component, page, service liên quan trong `src/`.
   - Đánh giá khả năng tái sử dụng component (nút bấm, modal, form input).
5. **Inspect Related Git History (Kiểm tra lịch sử Git)**
   - Xem các commit gần đây về UI tương tự để hiểu pattern styling và conventions.
6. **Analyze (Phân tích)**
   - Phân tích rủi ro, side effects, responsive, dark/light theme, luồng state.
7. **Implementation / Review Plan (Lập kế hoạch)**
   - Tạo kế hoạch rõ ràng cho các thay đổi cần thiết.
8. **Execute only when authorized (Thực thi khi được phép)**
   - Chờ xác nhận của user với những thay đổi lớn hoặc khi Skill quy định rõ phải chờ.
   - Luôn `git checkout -b` ra branch mới trước khi viết code.
9. **Validate (Xác minh)**
   - Kiểm tra lại kết quả thay đổi, chạy build/linter (`npm run build`).
10. **Report (Báo cáo)**
    - Thông báo cho user kết quả công việc kèm đường link mở Pull Request vào `ui`.
