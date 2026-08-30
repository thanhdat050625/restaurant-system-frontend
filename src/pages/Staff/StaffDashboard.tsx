import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import {
  Utensils,
  LayoutGrid,
  ClipboardList,
  LogOut,
  User,
  Clock,
  CheckCircle2,
  Building2,
  BellRing,
  ExternalLink
} from 'lucide-react';

const StaffDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const avatarSrc = (user as any)?.avatar || (user as any)?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Staff')}&background=3B82F6&color=fff&bold=true`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-body">
      {/* Staff Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
              S
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">FoodHub Staff Portal</h1>
              <p className="text-xs text-gray-500">Cổng điều phối vận hành chi nhánh & phục vụ</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200">
              <img
                src={avatarSrc}
                alt={user?.fullName || 'Staff'}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/40"
              />
              <span className="text-xs font-bold text-gray-800">{user?.fullName || 'Nhân Viên'}</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full uppercase">
                {user?.role || 'STAFF'}
              </span>
            </div>

            <Link
              to="/"
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
            >
              <ExternalLink size={14} /> Về Client
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
            >
              <LogOut size={14} /> Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Main Staff Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Welcome Box */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Ca Làm Việc Trực Tuyến
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Xin chào, {user?.fullName || 'Nhân viên'}!
            </h2>
            <p className="text-blue-100 text-sm">
              Theo dõi tình trạng bàn ăn, tiếp nhận món đặt trước và xác nhận đơn lấy mang về nhanh chóng.
            </p>
          </div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Operational Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:border-blue-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
              <LayoutGrid size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Sơ Đồ Bàn Trực Quan</h3>
              <p className="text-xs text-gray-500 mt-1">
                Xem trạng thái bàn thời gian thực (Trống, Đang có khách, Chờ dọn dẹp)
              </p>
            </div>
            <span className="inline-flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
              Sẵn sàng cho Sprint 5 POS
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:border-amber-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold">
              <ClipboardList size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Hàng Đợi Đặt Món Trước</h3>
              <p className="text-xs text-gray-500 mt-1">
                Danh sách món ăn khách gọi trước kèm theo lịch đặt bàn đến dùng bữa
              </p>
            </div>
            <span className="inline-flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
              Sẵn sàng cho Sprint 4 & 5
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:border-emerald-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
              <Utensils size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Đơn Mang Về (Pick-up)</h3>
              <p className="text-xs text-gray-500 mt-1">
                Kiểm tra giờ hẹn khách ghé lấy món và chuyển trạng thái hoàn tất đơn
              </p>
            </div>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
              Sẵn sàng cho Sprint 4 & 5
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
