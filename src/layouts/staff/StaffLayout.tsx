import React from 'react';
import { Outlet } from 'react-router-dom';
import StaffSidebar from '../../components/Staff/StaffSidebar';
import StaffTopbar from '../../components/Staff/StaffTopbar';

const StaffLayout: React.FC = () => {
  React.useEffect(() => {
    const wasDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.remove('dark');
    return () => {
      if (wasDark || localStorage.getItem('foodhub-theme') === 'dark') {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-body">
      {/* Staff Sidebar */}
      <StaffSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Staff Topbar */}
        <StaffTopbar />

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
