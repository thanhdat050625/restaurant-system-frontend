import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { Home, MapPin, Layers, LayoutGrid, LogOut, ExternalLink, UtensilsCrossed, Utensils, Users } from 'lucide-react';

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
    { name: 'Bàn', path: '/admin/tables', icon: <LayoutGrid size={18} /> },
    { name: 'Danh mục món', path: '/admin/menu-categories', icon: <UtensilsCrossed size={18} /> },
    { name: 'Món ăn', path: '/admin/menu-items', icon: <Utensils size={18} /> },
  ];

  const avatarSrc = (user as any)?.avatar || (user as any)?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Admin')}&background=FF6B35&color=fff&bold=true`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary">FoodHub Admin</h1>
      </div>

      <div className="p-4 flex-1">
        <div className="mb-6 px-2">
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

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-gray-50/80 rounded-xl border border-gray-100">
          <img
            src={avatarSrc}
            alt={user?.fullName || 'Admin'}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/40 shadow-sm shrink-0"
          />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName || 'Administrator'}</p>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
              {user?.role || 'ADMIN'}
            </span>
          </div>
        </div>
        <Link
          to="/"
          className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors mb-1 font-medium text-sm"
        >
          <ExternalLink size={17} />
          Về trang chủ
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm font-medium"
        >
          <LogOut size={17} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
