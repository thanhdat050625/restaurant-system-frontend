import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { branchService } from '../../services/admin/branchService';
import {
  BookOpenCheck,
  LogOut,
  ExternalLink,
  Building2,
} from 'lucide-react';

const StaffSidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [branchName, setBranchName] = useState<string>(
    (user as any)?.branch?.name || (user as any)?.branchName || ''
  );

  useEffect(() => {
    if ((user as any)?.branch?.name) {
      setBranchName((user as any).branch.name);
      return;
    }

    const bId = (user as any)?.branchId;
    if (bId) {
      branchService
        .getBranchById(bId)
        .then((res: any) => {
          const b = res?.data || res;
          if (b?.name) {
            setBranchName(b.name);
          }
        })
        .catch((err) => console.error('Error fetching branch for sidebar:', err));
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Menu chi nhánh', path: '/staff/menu', icon: <BookOpenCheck size={18} /> },
  ];

  const displayName = branchName || 'Đang tải cơ sở...';

  const avatarSrc =
    (user as any)?.avatar ||
    (user as any)?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Staff')}&background=3B82F6&color=fff&bold=true`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      {/* Brand Header - Matching Admin exactly */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary">FoodHub Staff</h1>
      </div>

      {/* Navigation Menu */}
      <div className="p-4 flex-1">
        <div className="mb-6 px-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            Menu Quản Lý
          </p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/staff'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
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

      {/* Staff Profile & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="px-3 py-2.5 mb-2 bg-gray-50/80 rounded-xl border border-gray-100 space-y-2">
          <div className="flex items-center gap-3">
            <img
              src={avatarSrc}
              alt={user?.fullName || 'Staff'}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/40 shadow-sm shrink-0"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.fullName || 'Nhân viên'}
              </p>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                {user?.role || 'STAFF'}
              </span>
            </div>
          </div>

          {/* Assigned Branch Tag */}
          <div className="text-xs text-gray-600 flex items-center gap-1.5 pt-1.5 border-t border-gray-200/60 truncate">
            <Building2 size={14} className="text-primary shrink-0" />
            <span className="truncate font-medium">{displayName}</span>
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
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm font-medium cursor-pointer"
        >
          <LogOut size={17} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default StaffSidebar;
