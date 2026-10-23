# Localization & User-Facing Text Guidelines (Web Frontend)

Tài liệu này quy định các tiêu chuẩn về văn bản hiển thị cho người dùng (User-Facing Text), định dạng tiền tệ và chuẩn hóa ngôn ngữ trong ứng dụng Web Nhà hàng.

---

## 1. Nguyên tắc cốt lõi

1. **Nhất quán về ngôn ngữ:** Toàn bộ giao diện người dùng, nút bấm, nhãn trường (labels), placeholders, thông báo toast, modal xác nhận và thông điệp lỗi phải được viết nhất quán bằng **Tiếng Việt**.
2. **Quy tắc Viết hoa:**
   - Viết hoa chữ cái đầu theo chuẩn ngữ pháp Tiếng Việt (Sentence case): *"Đặt bàn ngay"*, *"Xác nhận thông tin đặt chỗ"*, *"Danh sách bàn ăn"*.
3. **Phân biệt Technical Logs và User Messages:**
   - `console.error` / `console.log`: Dùng chuỗi kỹ thuật hoặc debug info.
   - UI Toast / Modal / Error State: BẮT BUỘC dùng câu chữ thân thiện, rõ ràng (ví dụ: *"Đặt bàn thành công! Nhà hàng sẽ liên hệ xác nhận trong ít phút."*, *"Vui lòng chọn ngày và giờ đặt bàn."*).

---

## 2. Quy chuẩn Định dạng Số, Tiền tệ & Ngày giờ

1. **Tiền tệ Việt Nam Đồng (VND):**
   - Luôn sử dụng hàm định dạng chuẩn có dấu chấm phân cách hàng nghìn và ký hiệu `₫` hoặc `VND`:
     ```javascript
     export const formatCurrency = (amount) => {
       return new Intl.NumberFormat('vi-VN', {
         style: 'currency',
         currency: 'VND',
       }).format(amount);
     };
     // Kết quả: 150.000 ₫
     ```
2. **Ngày giờ:**
   - Định dạng theo chuẩn Việt Nam: `DD/MM/YYYY` (ví dụ: `23/10/2026`) hoặc `HH:mm DD/MM/YYYY`.

---

## 3. Quy chuẩn Thông báo Lỗi (Error Messaging)

- **Form Validation:** Đưa ra hướng dẫn cụ thể thay vì chỉ báo "Lỗi" (ví dụ: *"Số điện thoại phải gồm 10 chữ số"*, *"Giờ đặt bàn phải nằm trong khung giờ hoạt động"*).
- **Lỗi mạng:** *"Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng."*
- **Hết phiên đăng nhập:** *"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."*
