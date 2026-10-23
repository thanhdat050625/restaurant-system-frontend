# Navigation & Routing Rules (React Router)

Toàn bộ hệ thống điều hướng của Web Frontend Nhà hàng sử dụng **React Router DOM**, được định nghĩa tập trung tại `src/App.jsx`.

---

## 1. Cấu trúc Route & Phân hệ Layout

Hệ thống được phân chia thành 3 phân vùng chính:

```tsx
<BrowserRouter>
  <Routes>
    {/* 1. Phân hệ Khách hàng (Bọc bởi Header, Footer, PageWrapper) */}
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/menu" element={<Menu />} />
    <Route path="/reservation" element={<Reservation />} />
    <Route path="/cart" element={<Cart />} />
    
    {/* Route yêu cầu đăng nhập User */}
    <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/order-tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />

    {/* 2. Phân hệ Quản trị (AdminLayout) */}
    <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="branches" element={<Branches />} />
      <Route path="tables" element={<Tables />} />
      <Route path="table-types" element={<TableTypes />} />
      <Route path="menu-categories" element={<MenuCategories />} />
      <Route path="menu-items" element={<MenuItems />} />
      <Route path="branch-menu" element={<BranchMenu />} />
      <Route path="staff" element={<Staff />} />
    </Route>

    {/* 3. Phân hệ Nhân viên tại chi nhánh (StaffLayout) */}
    <Route path="/staff" element={<StaffRoute><StaffLayout /></StaffRoute>}>
      <Route path="operating-hours" element={<StaffOperatingHours />} />
    </Route>

    {/* 4. Phân hệ Authentication (Không bọc Header/Footer chung) */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
  </Routes>
</BrowserRouter>
```

---

## 2. Route Protection & Guards (`src/components/common/`)

Mọi Route có dữ liệu riêng tư hoặc yêu cầu quyền hạn **BẮT BUỘC** được bọc bởi các Guard components:
- **`ProtectedRoute.tsx`**: Kiểm tra người dùng đã đăng nhập chưa. Nếu chưa -> Chuyển hướng về `/login`.
- **`AdminRoute.tsx`**: Kiểm tra vai trò `role === 'ADMIN'`. Nếu không phải -> Chuyển hướng về trang chủ hoặc báo không có quyền.
- **`StaffRoute.tsx`**: Kiểm tra vai trò `role === 'STAFF'` hoặc `role === 'ADMIN'`.

---

## 3. Quy tắc Điều hướng trong Code

1. **Dùng `Link` và `NavLink` cho liên kết UI:**
   - Tuyệt đối không dùng thẻ `<a href="...">` gây tải lại toàn bộ trang (Full Page Reload).
   - Sử dụng `<NavLink>` cho Sidebar/Navbar để tự động áp dụng style kích hoạt `isActive`.
2. **Dùng `useNavigate` cho điều hướng lập trình:**
   ```javascript
   import { useNavigate } from 'react-router-dom';
   const navigate = useNavigate();

   // Điều hướng thông thường
   navigate('/reservation');

   // Điều hướng sau khi đăng nhập / đổi mật khẩu (không lưu lịch sử)
   navigate('/admin/dashboard', { replace: true });
   ```
3. **Đọc URL Params:** Dùng `useParams()` để lấy id từ URL (ví dụ: `/admin/branches/:id`).
