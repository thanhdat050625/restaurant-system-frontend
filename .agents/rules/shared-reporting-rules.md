# Shared Reporting Rules

Các báo cáo (Report) do Agent tạo ra phải ngắn gọn nhưng có cấu trúc rõ ràng.

1. **Phân loại Issue (Severity):**
   Mọi issue phát hiện được phải được gắn nhãn mức độ nghiêm trọng:
   - `BLOCKER`: Lỗi nghiêm trọng làm crash React app (màn hình trắng).
   - `HIGH`: Lỗi quan trọng cần sửa ngay (không submit được form, lỗi API interceptor).
   - `MEDIUM`: Lỗi hiển thị hoặc vấn đề layout (vỡ giao diện trên mobile, sai màu Dark Mode).
   - `LOW`: Vấn đề nhỏ về styling hoặc padding/margin.
   - `INFO`: Thông tin, lưu ý, hoặc chia sẻ kiến thức.

2. **Phân biệt tính chất của phát hiện:**
   - **Confirmed Issue**: Vấn đề đã chắc chắn là lỗi (có bằng chứng, screenshot/log). KHÔNG gọi một vấn đề là "bug" nếu chưa có đủ evidence.
   - **Potential Risk**: Rủi ro tiềm ẩn (có thể xảy ra trên kích thước màn hình đặc biệt hoặc edge cases).
   - **Recommendation**: Đề xuất cải thiện UX/UI (không bắt buộc).

3. **Cấu trúc của một Issue Report chuẩn:**
   ```text
   Severity: [BLOCKER|HIGH|MEDIUM|LOW|INFO]
   File: [Tên file]
   Location: [Dòng/Component cụ thể]
   Problem: [Mô tả vấn đề]
   Why it matters: [Tại sao điều này quan trọng/ảnh hưởng người dùng]
   Recommendation: [Cách khắc phục đề xuất]
   ```
