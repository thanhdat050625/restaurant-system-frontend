# State Management (React Context & Custom Hooks)

Tài liệu này quy định chiến lược quản lý trạng thái (State Management) trong ứng dụng Web Frontend của RRMS.

---

## 1. Phân cấp State trong ứng dụng

Hệ thống sử dụng mô hình 3 cấp độ State:

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. Scoped Application State (React Context Providers)       │
│    - AuthContext: Lưu trữ user, role, token, isAuthenticated│
│    - CartContext: Lưu trữ món ăn đã chọn, số lượng, tạm tính│
│    - ThemeContext: Quản lý chuyển đổi Light / Dark Mode     │
├─────────────────────────────────────────────────────────────┤
│ 2. Server / Remote State (Service Data Fetching)            │
│    - Dữ liệu fetch từ Backend qua axios instance            │
│    - Quản lý kèm 3 cờ: isLoading, data, error               │
├─────────────────────────────────────────────────────────────┤
│ 3. Local Component State (useState / useReducer)            │
│    - Toggle modal, input validation error, active tab       │
│    - Đóng gói trong phạm vi 1 component                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Quy Chuẩn Sử Dụng React Context

### 2.1 Cung cấp Custom Hook an toàn
Mỗi Context **BẮT BUỘC** đi kèm một Custom Hook tương ứng để bảo vệ chống việc sử dụng ngoài Provider:

```tsx
// Ví dụ: features/auth/AuthContext.tsx
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

Tương tự:
- `useCart()` từ `features/menu/CartContext.jsx`
- `useTheme()` từ `hooks/ThemeContext.jsx`

### 2.2 Tránh Re-render không cần thiết
- Không dồn toàn bộ dữ liệu ứng dụng vào một Context duy nhất.
- Tách biệt Context theo đúng chức năng (Xác thực riêng, Giỏ hàng riêng, Giao diện riêng).
- Sử dụng `useMemo` và `useCallback` cho các hàm hoặc giá trị tính toán truyền qua Context Value.

---

## 3. Local Component State (`useState`)

- Chỉ dùng `useState` cho dữ liệu mang tính hiển thị tạm thời (ví dụ: `isModalOpen`, `searchKeyword`, `filterStatus`).
- Tránh truyền props quá 3 tầng (**Prop Drilling**); nếu cần truyền sâu, hãy cân nhắc đưa vào Context hoặc dùng Composition Pattern.
