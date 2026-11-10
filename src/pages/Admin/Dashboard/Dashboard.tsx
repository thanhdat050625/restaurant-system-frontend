import React from 'react';
import { RefreshCw } from 'lucide-react';
import {
  useDashboardStats,
  DashboardStatCards,
  BranchTableSummary,
  FeaturedItemsList,
} from '../../../features/dashboard';

const Dashboard: React.FC = () => {
  const {
    branches,
    tables,
    tableTypes,
    categories,
    menuItems,
    activeBranchesCount,
    activeMenuItemsCount,
    featuredMenuItems,
    tablesPerBranch,
    loading,
    refreshing,
    refresh,
  } = useDashboardStats();

  return (
    <div className="space-y-4 pb-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Tổng Quan Hệ Thống</h2>
          <p className="text-sm text-gray-500 mt-0.5">Số liệu thống kê chuỗi nhà hàng, sơ đồ bàn và thực đơn</p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing || loading}
          className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin text-primary' : 'text-gray-500'} />
          <span>{refreshing ? 'Đang cập nhật...' : 'Làm mới'}</span>
        </button>
      </div>

      {/* 5 KPI Metric Cards */}
      <DashboardStatCards
        loading={loading}
        branches={branches}
        activeBranchesCount={activeBranchesCount}
        tables={tables}
        tableTypes={tableTypes}
        categories={categories}
        menuItems={menuItems}
        activeMenuItemsCount={activeMenuItemsCount}
      />

      {/* Grid: Branch Overview & Featured Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <BranchTableSummary loading={loading} tablesPerBranch={tablesPerBranch} />
        <FeaturedItemsList loading={loading} featuredMenuItems={featuredMenuItems} />
      </div>
    </div>
  );
};

export default Dashboard;
