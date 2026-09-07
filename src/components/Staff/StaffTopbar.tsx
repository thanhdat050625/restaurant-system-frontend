import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { branchService } from '../../services/admin/branchService';
import { Building2 } from 'lucide-react';

const StaffTopbar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

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
        .catch((err) => console.error('Error fetching branch for topbar:', err));
    }
  }, [user]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/staff':
      case '/staff/menu':
        return 'Quản lý Menu Chi nhánh';
      default:
        return 'Staff Portal';
    }
  };

  const displayName = branchName || 'Đang tải cơ sở...';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Working Branch Badge - Hiển thị đầy đủ tên chi nhánh không bị cắt */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-orange-50/80 border border-orange-200/80 rounded-xl shadow-2xs">
          <Building2 size={16} className="text-primary shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
              Cơ Sở Làm Việc
            </span>
            <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
              {displayName}
            </span>
          </div>
        </div>

        {/* Shift status */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Trong ca trực</span>
        </div>
      </div>
    </header>
  );
};

export default StaffTopbar;
