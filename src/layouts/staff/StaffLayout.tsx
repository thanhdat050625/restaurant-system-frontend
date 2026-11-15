import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import StaffSidebar from '../../components/Staff/StaffSidebar';
import StaffTopbar from '../../components/Staff/StaffTopbar';
import { useAuth } from '../../features/auth/AuthContext';
import { socketService } from '../../services/socketService';
import { IPickupOrder } from '../../types/pickup-order.type';

const StaffLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const pathnameRef = React.useRef(location.pathname);
  pathnameRef.current = location.pathname;
  const branchId = user?.branchId;

  React.useEffect(() => {
    const wasDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.remove('dark');
    return () => {
      if (wasDark || localStorage.getItem('foodhub-theme') === 'dark') {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  // Duy trì kết nối socket theo chi nhánh trên toàn Staff Portal để báo đơn mang về mới ngay cả khi đang ở tab Đặt bàn
  React.useEffect(() => {
    if (!branchId) return;

    socketService.connect(user?.id);
    socketService.joinBranch(branchId);

    const handleNewPickupOrder = (order?: Partial<IPickupOrder>) => {
      if (pathnameRef.current.includes('/staff/pickup-orders')) return;

      toast.success(
        order?.orderCode
          ? `Có đơn mang về mới: ${order.orderCode}!`
          : 'Có đơn đặt món mang về mới!'
      );
    };

    socketService.on('pickupOrder:created', handleNewPickupOrder);

    return () => {
      socketService.off('pickupOrder:created', handleNewPickupOrder);
      socketService.leaveBranch(branchId);
    };
  }, [user?.id, branchId]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-body">
      {/* Staff Sidebar */}
      <StaffSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Staff Topbar */}
        <StaffTopbar />

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
