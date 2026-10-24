# Frontend Git & Pull Request Rules

Mọi thao tác liên quan đến Git của Agent trên repository `r-fe` phải tuân thủ nghiêm ngặt các quy định sau:

## 1. Nguyên Tắc Phân Nhánh & Base Branch
- **Nhánh cơ sở (Base Branch)**: Nhánh phát triển chính thức của Frontend là **`ui`**.
- **Checkout Branch Mới**:
  - Tuyệt đối **KHÔNG** commit hoặc đẩy code trực tiếp lên `ui` hay `main`.
  - Trước khi bắt đầu bất kỳ task nào (tính năng giao diện, sửa lỗi layout, refactor), Agent bắt buộc phải chạy:
    ```bash
    git checkout ui
    git pull origin ui
    git checkout -b <loại-nhánh>/<tên-ngắn-gọn>
    ```
  - Định dạng tên nhánh:
    - `feature/<tên-tính-năng>`: Thêm màn hình/chức năng mới (ví dụ: `feature/reservation-booking-ui`).
    - `fix/<tên-lỗi>`: Sửa lỗi (ví dụ: `fix/menu-card-responsive`).
    - `refactor/<tên-component>`: Tái cấu trúc component.
    - `chore/<nội-dung>`: Cấu hình, styling, tooling.

## 2. Quy Chuẩn Commit Message
- Tuân thủ chuẩn Conventional Commits:
  - `feat(<scope>): <mô tả ngắn>`
  - `fix(<scope>): <mô tả ngắn>`
  - `refactor(<scope>): <mô tả>`
  - `chore(<scope>): <mô tả>`
- Chỉ commit các file thuộc phạm vi task hiện tại.

## 3. Quy Trình Tạo Pull Request (PR)
- Mọi Pull Request tạo ra từ nhánh feature/fix bắt buộc phải nhắm tới nhánh đích là **`ui`** trên repository `thanhdat050625/restaurant-system-frontend`.
- Trước khi push và tạo PR:
  1. Chạy `git status` và `git diff` kiểm tra working tree.
  2. Dọn sạch `console.log` thừa.
  3. Kiểm tra code build không lỗi biên dịch (`npm run build`).
- Sau khi push branch lên remote, cung cấp trực tiếp đường link mở Pull Request trên GitHub để người dùng truy cập.
- **Ràng buộc:** Agent tuyệt đối **KHÔNG ĐƯỢC TỰ ĐỘNG MERGE PULL REQUEST** nếu người dùng chưa phê duyệt (approve).

## 4. Các Hành Động Bị Nghiêm Cấm
- CẤM `git push --force`.
- CẤM `git reset --hard` khi chưa có xác nhận từ người dùng.
- CẤM checkout đè làm mất các thay đổi chưa commit.
- CẤM xóa branch của người khác.
