# FRONTEND AGENT RULES (FoodHub / RRMS Frontend)

> **BẮT BUỘC TUÂN THỦ ĐỐI VỚI MỌI THAO TÁC CỦA AGENT TRÊN FRONTEND**:
> 
> 1. **Không hardcode API Base URL**:
>    - Tuyệt đối không hardcode địa chỉ IP hoặc port API (ví dụ: `http://localhost:3000`) trong mã nguồn components hay services.
>    - Bắt buộc dùng `VITE_API_BASE_URL` thông qua Axios client tại `src/services/api.ts`.
> 
> 2. **Giới hạn độ dài file (Tối đa 400 dòng)**:
>    - Tuyệt đối không viết hoặc để bất kỳ component nào vượt quá **400 dòng**.
>    - Nếu component phình to, bắt buộc phải chủ động tách nhỏ thành các sub-components (như modals, item cards, list tables) hoặc custom hooks trước khi thêm logic mới.
> 
> 3. **TypeScript First & Type Safety**:
>    - Luôn định nghĩa rõ ràng interface / type trong `src/types/` cho mọi API response payload và component Props.
>    - Hạn chế tối đa sử dụng kiểu `any`.
> 
> 4. **UI, Modal & Theme Consistency**:
>    - Bắt buộc sử dụng Tailwind CSS, hỗ trợ nhất quán cả hai chế độ Light Mode và Dark Mode.
>    - Tuyệt đối **KHÔNG** sử dụng hộp thoại native `window.confirm()` hay `window.alert()`. Bắt buộc tái sử dụng các component chuẩn hóa đã có: `ConfirmModal.tsx` và `Modal.tsx`.
> 
> 5. **Dọn dẹp trước khi commit**:
>    - Bắt buộc xóa sạch `console.log` thừa, file test tạm, file rác trước khi tạo commit.
> 
> 6. **Quy tắc Git & Pull Request (Target: `ui`)**:
>    - Nhánh phát triển chính của Frontend là **`ui`**.
>    - Mọi nhánh mới phải checkout từ `ui`: `feature/<tên-tính-năng>` hoặc `fix/<tên-lỗi>`.
>    - Commit message phải tuân thủ Conventional Commits (`feat: ...`, `fix: ...`, `refactor: ...`, `chore: ...`).
>    - Mọi Pull Request tạo ra bắt buộc nhắm tới nhánh đích là **`ui`** trên repository `thanhdat050625/restaurant-system-frontend`.
>    - Tuyệt đối **KHÔNG** chạy `git push --force` và **KHÔNG** tự ý merge PR khi chưa có sự xác nhận của người dùng.
