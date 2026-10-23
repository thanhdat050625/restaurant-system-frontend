# Frontend AI Agent System (FoodHub / RRMS Frontend)

Hệ thống AI Agent Skills & Rules này được thiết kế để chuẩn hóa quy trình phát triển Front-end (React 19, TypeScript, Tailwind CSS, Vite), đảm bảo tính an toàn, trải nghiệm người dùng (UX), tính nhất quán giao diện và quản lý Pull Request (PR) tự động vào nhánh `ui`.

## Repository Information
- **Repository**: `thanhdat050625/restaurant-system-frontend`
- **Base Development Branch**: `ui`
- **Core Tech Stack**: React 19, TypeScript, Tailwind CSS, Vite, Axios, AuthContext

---

## Danh sách Skills (Commands)

| Command | Mục đích | Input | Quyền sửa code | Quyền Git | Yêu cầu Approval |
|:---|:---|:---|:---:|:---:|:---:|
| `/fe-newFeature` | Phân tích và lập kế hoạch tính năng UI / màn hình mới | Mô tả tính năng | Có (khi có plan) | Không | **CÓ** (Implementation Plan) |
| `/fe-fixbug` | Phân tích root cause và lập kế hoạch sửa lỗi giao diện/state | Mô tả bug | Có (khi có plan) | Không | **CÓ** (Implementation Plan) |
| `/fe-analyzeTask` | Phân tích scope, rủi ro, component hierarchy của task | Mô tả task | Không | Không | Không |
| `/fe-createTestCase` | Xây dựng bảng ma trận kịch bản kiểm thử giao diện & luồng user | Mô tả màn hình | Không | Không | Không |
| `/fe-review-code` | Review code branch hiện tại so với `ui` | Không/Branch name | Không | Không | Không |
| `/fe-reviewSecurityPerformance` | Đánh giá XSS, rò rỉ token, tối ưu re-render và tải trang | Branch name | Không | Không | Không |
| `/fe-createPR` | Kiểm tra build vite, push branch và tạo URL mở Pull Request vào `ui` | Không | Không | Có (push) | Không (chỉ tạo URL PR) |
| `/fe-reviewPR` | **Tổng hợp:** Review toàn diện và Merge PR | Branch name | Không | Có (merge, xóa branch) | **CÓ** (Trước khi Merge) |
| `/fe-cleanup` | Dọn dẹp log, debug statement, file rác trước khi commit | Không | Không (chỉ xóa rác) | Không | **CÓ** (Trước khi xóa) |
| `/fe-newIssues` | Tạo issue / ticket theo mẫu chuẩn | Mô tả công việc | Không | Không | Không |
| `/fe-resolveIssues` | Tạo nhánh mới từ `ui` và thực thi sửa chữa theo issue | Issue ID | Có (khi có plan) | Có (checkout -b) | **CÓ** (Implementation Plan) |

---

## Quy tắc quan trọng bắt buộc xác nhận (User Confirmation)
1. **Thực thi code mới / sửa code**: Phải đưa ra Implementation Plan trước, người dùng duyệt mới được code.
2. **Checkout branch mới**: Luôn checkout nhánh mới từ `ui` (`feature/...`, `fix/...`, `chore/...`), không sửa trực tiếp trên `ui`.
3. **Merge Pull Request**: Chỉ khi người dùng duyệt Audit Report mới được phép merge vào `ui`.
4. **Không force push**: Tuyệt đối cấm `git push --force`.
