import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
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
import Profile from './pages/Profile/Profile';
import OrderTracking from './pages/OrderTracking/OrderTracking';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';

const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Layout wrapper to conditionally show header/footer
const Layout = () => {
  const location = useLocation();
  const noLayoutPages = ['/login', '/register'];
  const showLayout = !noLayoutPages.includes(location.pathname);

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
          <Route path="/profile" element={<Profile />} />
          <Route path="/order/:id" element={<OrderTracking />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
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
            <Layout />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
