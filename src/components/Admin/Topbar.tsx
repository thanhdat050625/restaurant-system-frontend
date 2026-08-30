import React from 'react';
import { useLocation } from 'react-router-dom';

const Topbar: React.FC = () => {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/admin':
        return 'Dashboard';
      case '/admin/branches':
        return 'Quản lý Chi nhánh';
      case '/admin/staff':
        return 'Quản lý Nhân viên';
      case '/admin/table-types':
        return 'Quản lý Loại bàn';
      case '/admin/tables':
        return 'Quản lý Bàn';
      case '/admin/menu-categories':
        return 'Quản lý Danh mục Món';
      case '/admin/menu-items':
        return 'Quản lý Món ăn';
      default:
        return 'Admin Portal';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
      </div>
      <div className="flex items-center gap-4">
        {/* Có thể thêm nút thông báo hoặc search ở đây sau */}
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          🔔
        </button>
      </div>
    </header>
  );
};

export default Topbar;
