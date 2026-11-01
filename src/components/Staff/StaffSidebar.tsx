import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { branchService } from '../../services/admin/branchService';
import {
  BookOpenCheck,
  LogOut,
  ExternalLink,
  Building2,
  Clock,
  BrushCleaning,
  ShoppingBag,
} from 'lucide-react';

const StaffSidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const initialBranchName = (user as any)?.branch?.name || (user as any)?.branchName || '';
  const [branchName, setBranchName] = useState<string>(initialBranchName);

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
          const b = (res as any)?.data !== undefined ? (res as any).data : res;
          if (b?.name) {
            setBranchName(b.name);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Menu chi nhánh', path: '/staff/menu', icon: <BookOpenCheck size={18} /> },
    { name: 'Dọn & Xoay vòng bàn', path: '/staff/table-turnover', icon: <BrushCleaning size={18} /> },
    { name: 'Đơn mang về', path: '/staff/pickup-orders', icon: <ShoppingBag size={18} /> },
    { name: 'Giờ & Sức chứa', path: '/staff/operating-hours', icon: <Clock size={18} /> },
  ];

  const displayName = branchName || 'Đang tải cơ sở...';
  const staffName = user?.fullName || 'Staff';
  const rawAvatar = (user as any)?.avatar || (user as any)?.avatarUrl;
  const avatarSrc = rawAvatar
    ? rawAvatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(staffName)}&background=3B82F6&color=fff&bold=true`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      {/* Brand Header */}
      <div className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-gray-200">
        <div>
          <h1 className="text-lg font-bold text-gray-800 leading-tight">FoodHub Staff</h1>
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">Cổng nhân viên</span>
        </div>
      </div>

      {/* Branch Badge Card */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Building2 size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Chi nhánh làm việc</p>
            <p className="text-xs font-bold text-gray-800 truncate" title={displayName}>
              {displayName}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        <div className="mb-4 px-2">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Tác vụ phục vụ</p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
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

      {/* Staff profile & Logout */}
      <div className="p-4 border-t border-gray-200 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <img
            src={avatarSrc}
            alt={staffName}
            className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-inner"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate">{staffName}</p>
            <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-1">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} />
              Xem trang khách
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium cursor-pointer"
          >
            <LogOut size={14} />
            Đăng xuất
          </button>
        </div>
      </div>
    </aside>
  );
};

export default StaffSidebar;
