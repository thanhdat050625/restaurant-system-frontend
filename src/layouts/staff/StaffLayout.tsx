import React from 'react';
import { Outlet } from 'react-router-dom';
import StaffSidebar from '../../components/Staff/StaffSidebar';
import StaffTopbar from '../../components/Staff/StaffTopbar';
import { useAuth } from '../../features/auth/AuthContext';
import { socketService } from '../../services/socketService';

const StaffLayout: React.FC = () => {
  const { user } = useAuth();
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

  // Duy trì kết nối socket theo chi nhánh trên toàn Staff Portal
  // (Popup + âm thanh toàn cục đã được NotificationProvider đảm nhiệm)
  React.useEffect(() => {
    if (!branchId) return;

    socketService.connect(user?.id);
    socketService.joinBranch(branchId);

    return () => {
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
