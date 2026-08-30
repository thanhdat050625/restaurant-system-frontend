import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './features/menu/CartContext';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { ThemeProvider } from './hooks/ThemeContext';
import Header from './layouts/Header';
import Footer from './layouts/Footer';
import ScrollToTop from './components/common/ScrollToTop';

import Home from './pages/Home/Home';
import Menu from './pages/Menu/Menu';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import Reservation from './pages/Reservation/Reservation';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Profile from './pages/Profile/Profile';
import OrderTracking from './pages/OrderTracking/OrderTracking';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';

// Staff Imports
import StaffRoute from './components/common/StaffRoute';
import StaffDashboard from './pages/Staff/StaffDashboard';

// Admin Imports
import AdminRoute from './components/common/AdminRoute';
import AdminLayout from './layouts/admin/AdminLayout';
import Dashboard from './pages/Admin/Dashboard/Dashboard';
import Branches from './pages/Admin/Branches/Branches';
import Staff from './pages/Admin/Staff/Staff';
import TableTypes from './pages/Admin/TableTypes/TableTypes';
import Tables from './pages/Admin/Tables/Tables';
import MenuCategories from './pages/Admin/MenuCategories/MenuCategories';
import MenuItems from './pages/Admin/MenuItems/MenuItems';

const GuestRoute = ({ children }) => {
  const { user, isAuthenticated, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return null;
  }

  if (isAuthenticated) {
    if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user?.role === 'STAFF') return <Navigate to="/staff" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
};

// Layout wrapper to conditionally show header/footer
const Layout = () => {
  const location = useLocation();
  const noLayoutPages = ['/login', '/register', '/forgot-password'];
  const isDashboardRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff');
  const showLayout = !noLayoutPages.includes(location.pathname) && !isDashboardRoute;

  return (
    <>
      <ScrollToTop />
      {showLayout && <Header />}
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/order/:id" element={<OrderTracking />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Staff Route */}
          <Route path="/staff" element={<StaffRoute><StaffDashboard /></StaffRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="branches" element={<Branches />} />
            <Route path="staff" element={<Staff />} />
            <Route path="table-types" element={<TableTypes />} />
            <Route path="tables" element={<Tables />} />
            <Route path="menu-categories" element={<MenuCategories />} />
            <Route path="menu-items" element={<MenuItems />} />
          </Route>
        </Routes>
      </AnimatePresence>
      {showLayout && <Footer />}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster position="top-right" />
            <Layout />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
