import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import {
  Home,
  MapPin,
  Layers,
  LayoutGrid,
  LogOut,
  ExternalLink,
  UtensilsCrossed,
  Utensils,
  Users,
  BookOpenCheck,
  Clock,
  ShoppingBag,
  ChefHat,
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <Home size={18} /> },
    { name: 'Chi nhánh', path: '/admin/branches', icon: <MapPin size={18} /> },
    { name: 'Nhân viên', path: '/admin/staff', icon: <Users size={18} /> },
    { name: 'Loại bàn', path: '/admin/table-types', icon: <Layers size={18} /> },
    { name: 'Bàn & Sơ đồ', path: '/admin/tables', icon: <LayoutGrid size={18} /> },
    { name: 'Đơn mang về', path: '/admin/pickup-orders', icon: <ShoppingBag size={18} /> },
    { name: 'Màn hình Bếp (KDS)', path: '/kitchen', icon: <ChefHat size={18} /> },
    { name: 'Danh mục món', path: '/admin/menu-categories', icon: <UtensilsCrossed size={18} /> },
    { name: 'Món ăn', path: '/admin/menu-items', icon: <Utensils size={18} /> },
    { name: 'Menu chi nhánh', path: '/admin/branch-menu', icon: <BookOpenCheck size={18} /> },
    { name: 'Giờ & Sức chứa', path: '/admin/operating-hours', icon: <Clock size={18} /> },
  ];

  const adminName = user?.fullName ? user.fullName : 'Admin';
  const rawAdminAvatar = (user as any)?.avatar ? (user as any).avatar : (user as any)?.avatarUrl;
  const avatarSrc = rawAdminAvatar
    ? rawAdminAvatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=FF6B35&color=fff&bold=true`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      <div className="h-16 shrink-0 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary">FoodHub Admin</h1>
      </div>

      <div className="p-4 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        <div className="mb-4 px-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Menu Quản Lý</p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <img
            src={avatarSrc}
            alt="Admin"
            className="w-8 h-8 rounded-full border border-gray-200"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{adminName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-1">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={16} />
              Xem trang khách
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
