import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Sun, Moon, User, LogOut, ChevronDown, Shield, Calendar } from 'lucide-react';
import { useCart } from '../features/menu/CartContext';
import { useAuth } from '../features/auth/AuthContext';
import { useTheme } from '../hooks/ThemeContext';
import { categories as fallbackCategories } from '../assets/data/categoryData';
import { publicMenuService } from '../services/publicMenuService';

const toSlug = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState(fallbackCategories);
  const [hoveredCat, setHoveredCat] = useState(fallbackCategories[0] || null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await publicMenuService.getCategories();
        if (data && data.length > 0) {
          const formatted = data.map((cat, idx) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.name ? toSlug(cat.name) : cat.id,
            image: cat.imageUrl || fallbackCategories[idx % fallbackCategories.length]?.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
            itemCount: cat.items?.length || 8,
          }));
          setCategoriesList(formatted);
          setHoveredCat(formatted[0]);
        }
      } catch (err) {
        console.warn('Error fetching header categories:', err);
      }
    };
    fetchCats();
  }, []);
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  // Khai báo các trang có banner tối màu ở trên cùng
  const darkHeroPages = ['/', '/menu', '/branches', '/reservation', '/reservations/history', '/about', '/contact', '/login', '/register'];
  // Kiểm tra xem trang hiện tại có nằm trong danh sách trên không hoặc là đường dẫn menu/danh-muc
  const hasDarkHero = darkHeroPages.includes(location.pathname) || location.pathname.startsWith('/menu/');
  
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
    { to: '/branches', label: 'Chi nhánh' },
    { to: '/reservation', label: 'Đặt bàn' },
    { to: '/about', label: 'Về chúng tôi' },
    { to: '/contact', label: 'Liên hệ' },
  ];

  const headerUserName = user?.fullName ? user.fullName : (user?.username ? user.username : 'User');
  const headerUserAvatar = user?.avatar ? user.avatar : user?.avatarUrl;
  const headerAvatarSrc = headerUserAvatar
    ? headerUserAvatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(headerUserName)}&background=FF6B35&color=fff&bold=true`;

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
            {navLinks.map(link => {
              if (link.to === '/menu') {
                return (
                  <div key={link.to} className="relative group py-2">
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `relative flex items-center gap-1 text-sm font-medium transition-colors duration-300 ${
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
                          <ChevronDown size={14} className="opacity-70 group-hover:rotate-180 transition-transform" />
                          {isActive && (
                            <motion.div
                              layoutId="activeNav"
                              className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary rounded-full"
                            />
                          )}
                        </>
                      )}
                    </NavLink>

                    {/* Dropdown — 2 columns */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-5 w-[480px] opacity-0 invisible translate-y-3 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out origin-top z-50">
                      <div className={`rounded-2xl overflow-hidden shadow-[0_24px_48px_-8px_rgba(0,0,0,0.2)] dark:shadow-[0_24px_48px_-8px_rgba(0,0,0,0.5)] ${
                        isSolidHeader
                          ? 'bg-white/95 dark:bg-[#16213E]/95 backdrop-blur-xl border border-black/5 dark:border-white/5'
                          : 'bg-dark/90 backdrop-blur-xl border border-white/10'
                      }`}>
                        {/* Header label */}
                        <div className={`px-5 py-3 border-b text-[10px] font-bold uppercase tracking-widest ${
                          isSolidHeader
                            ? 'border-black/5 dark:border-white/5 text-text-light dark:text-white/30'
                            : 'border-white/10 text-white/30'
                        }`}>
                          Danh mục
                        </div>

                        <div className="flex">
                          {/* Left — category list */}
                          <div className="flex-1 py-2">
                            {categoriesList.map(cat => (
                              <Link
                                key={cat.id}
                                to={`/menu/${cat.slug}`}
                                onMouseEnter={() => setHoveredCat(cat)}
                                className={`group/item flex items-center justify-between px-5 py-2.5 transition-all duration-200 ${
                                  isSolidHeader
                                    ? 'hover:bg-primary/5 dark:hover:bg-primary/10'
                                    : 'hover:bg-white/8'
                                }`}
                              >
                                <div>
                                  <p className={`text-sm font-medium transition-colors duration-200 ${
                                    isSolidHeader
                                      ? 'text-text-primary dark:text-white/80 group-hover/item:text-primary'
                                      : 'text-white/80 group-hover/item:text-white'
                                  }`}>
                                    {cat.name}
                                  </p>
                                  <p className="text-xs text-text-light dark:text-white/30 mt-0.5">
                                    {cat.itemCount} món
                                  </p>
                                </div>
                                <span className={`text-xs opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200 ${
                                  isSolidHeader ? 'text-primary' : 'text-white/60'
                                }`}>
                                  →
                                </span>
                              </Link>
                            ))}
                          </div>

                          {/* Right — image preview, updates on category hover */}
                          <div className={`w-44 shrink-0 border-l ${
                            isSolidHeader ? 'border-black/5 dark:border-white/5' : 'border-white/10'
                          }`}>
                            <div className="relative h-full min-h-[280px] overflow-hidden">
                              <AnimatePresence mode="wait">
                                <motion.img
                                  key={hoveredCat.id}
                                  src={hoveredCat.image}
                                  alt={hoveredCat.name}
                                  initial={{ opacity: 0, scale: 1.05 }}
                                  animate={{ opacity: 0.75, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.98 }}
                                  transition={{ duration: 0.25, ease: 'easeOut' }}
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              </AnimatePresence>
                              <div className="absolute inset-0 bg-gradient-to-t from-dark/85 via-dark/20 to-transparent" />
                              <div className="absolute bottom-4 left-3 right-3">
                                <AnimatePresence mode="wait">
                                  <motion.div
                                    key={hoveredCat.id + '-text'}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <p className="text-white text-xs font-semibold">{hoveredCat.name}</p>
                                    <p className="text-white/60 text-[11px] mt-0.5">{hoveredCat.itemCount} món</p>
                                  </motion.div>
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                );
              }
              return (
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
              );
            })}
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
                  <img 
                    src={headerAvatarSrc} 
                    alt={headerUserName} 
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/50" 
                  />
                  <ChevronDown size={16} className={isSolidHeader ? 'text-text-primary dark:text-white' : 'text-white'} />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-light-border dark:border-dark-border overflow-hidden"
                    >
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-3 text-sm text-text-primary dark:text-white hover:bg-light-card dark:hover:bg-dark-card transition-colors">
                        <User size={16} /> Tài khoản
                      </Link>
                      <Link to="/reservations/history" className="flex items-center gap-2 px-4 py-3 text-sm text-text-primary dark:text-white hover:bg-light-card dark:hover:bg-dark-card transition-colors">
                        <Calendar size={16} /> Lịch sử đặt bàn
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <Link to="/admin" className="flex items-center gap-2 px-4 py-3 text-sm text-text-primary dark:text-white hover:bg-light-card dark:hover:bg-dark-card transition-colors">
                          <Shield size={16} /> Trang quản trị
                        </Link>
                      )}
                      {user?.role === 'STAFF' && (
                        <Link to="/staff" className="flex items-center gap-2 px-4 py-3 text-sm text-text-primary dark:text-white hover:bg-light-card dark:hover:bg-dark-card transition-colors">
                          <Shield size={16} /> Cổng nhân viên
                        </Link>
                      )}
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
                    <Link to="/reservations/history" className="block px-4 py-3 rounded-xl text-sm font-medium text-text-primary dark:text-white hover:bg-light-card dark:hover:bg-dark-card transition-colors">
                      Lịch sử đặt bàn
                    </Link>
                    {user?.role === 'ADMIN' && (
                      <Link to="/admin" className="block px-4 py-3 rounded-xl text-sm font-medium text-text-primary dark:text-white hover:bg-light-card dark:hover:bg-dark-card transition-colors">
                        Trang quản trị
                      </Link>
                    )}
                    {user?.role === 'STAFF' && (
                      <Link to="/staff" className="block px-4 py-3 rounded-xl text-sm font-medium text-text-primary dark:text-white hover:bg-light-card dark:hover:bg-dark-card transition-colors">
                        Cổng nhân viên
                      </Link>
                    )}
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
