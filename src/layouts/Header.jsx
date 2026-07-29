import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Sun, Moon, User, LogOut, ChevronDown } from 'lucide-react';
import { useCart } from '../features/menu/CartContext';
import { useAuth } from '../features/auth/AuthContext';
import { useTheme } from '../hooks/ThemeContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  // Khai báo các trang có banner tối màu ở trên cùng
  const darkHeroPages = ['/', '/menu', '/reservation', '/about', '/contact', '/login', '/register'];
  // Kiểm tra xem trang hiện tại có nằm trong danh sách trên không (xử lý luôn cả route động như /order/1)
  const hasDarkHero = darkHeroPages.includes(location.pathname);
  
  // Header sẽ chuyển sang dạng Solid (nền trắng/đen rõ ràng) nếu:
  // 1. Đã cuộn chuột XUỐNG
  // HOẶC 2. Đang ở trang KHÔNG CÓ banner tối (như Cart, Profile)
  const isSolidHeader = isScrolled || !hasDarkHero;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/menu', label: 'Thực đơn' },
    { to: '/reservation', label: 'Đặt bàn' },
    { to: '/about', label: 'Về chúng tôi' },
    { to: '/contact', label: 'Liên hệ' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isSolidHeader
        ? 'bg-white/90 dark:bg-dark/90 backdrop-blur-lg shadow-lg'
        : 'bg-transparent'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className={`text-2xl font-bold font-[family-name:var(--font-heading)] ${
              isSolidHeader ? 'text-dark dark:text-white' : 'text-white'
            }`}>
              Food<span className="text-primary">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative text-sm font-medium transition-colors duration-300 py-2 ${
                    isActive
                      ? 'text-primary'
                      : isSolidHeader
                        ? 'text-text-primary dark:text-white hover:text-primary'
                        : 'text-white/90 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                isSolidHeader
                  ? 'text-text-primary dark:text-white hover:bg-light-card dark:hover:bg-dark-card'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className={`relative p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                isSolidHeader
                  ? 'text-text-primary dark:text-white hover:bg-light-card dark:hover:bg-dark-card'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-2 p-1.5 rounded-full transition-all duration-300 ${
                    isSolidHeader
                      ? 'hover:bg-light-card dark:hover:bg-dark-card'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username)}&background=random`} alt={user.fullName || user.username} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/50" />
                  <ChevronDown size={16} className={isSolidHeader ? 'text-text-primary dark:text-white' : 'text-white'} />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-light-border dark:border-dark-border overflow-hidden"
                    >
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-3 text-sm text-text-primary dark:text-white hover:bg-light-card dark:hover:bg-dark-card transition-colors">
                        <User size={16} /> Tài khoản
                      </Link>
                      <button
                        onClick={logout}
                        className="flex items-center gap-2 w-full px-4 py-3 text-sm text-error hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden lg:flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-glow"
              >
                <User size={16} /> Đăng nhập
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-full transition-all duration-300 ${
                isSolidHeader
                  ? 'text-text-primary dark:text-white'
                  : 'text-white'
              }`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white dark:bg-dark-surface rounded-2xl mt-2 mb-4 shadow-xl border border-light-border dark:border-dark-border overflow-hidden"
            >
              <div className="py-4 px-4 space-y-1">
                {navLinks.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-text-primary dark:text-white hover:bg-light-card dark:hover:bg-dark-card'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                <hr className="my-3 border-light-border dark:border-dark-border" />
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" className="block px-4 py-3 rounded-xl text-sm font-medium text-text-primary dark:text-white hover:bg-light-card dark:hover:bg-dark-card transition-colors">
                      Tài khoản
                    </Link>
                    <button onClick={logout} className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-error hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block text-center px-4 py-3 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Header;
