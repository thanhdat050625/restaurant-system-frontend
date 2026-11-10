import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  LayoutGrid,
  Grid3X3,
  FolderKanban,
  UtensilsCrossed,
  ArrowUpRight,
} from 'lucide-react';
import { IBranch } from '../../../types/admin/branch.type';
import { ITable } from '../../../types/admin/table.type';
import { ITableType } from '../../../types/admin/table-type.type';
import { MenuCategory } from '../../../types/menuCategory.type';
import { MenuItem } from '../../../types/menuItem.type';

interface DashboardStatCardsProps {
  loading: boolean;
  branches: IBranch[];
  activeBranchesCount: number;
  tables: ITable[];
  tableTypes: ITableType[];
  categories: MenuCategory[];
  menuItems: MenuItem[];
  activeMenuItemsCount: number;
}

export const DashboardStatCards: React.FC<DashboardStatCardsProps> = ({
  loading,
  branches,
  activeBranchesCount,
  tables,
  tableTypes,
  categories,
  menuItems,
  activeMenuItemsCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
      {/* Card 1: Tổng Chi Nhánh */}
      <Link
        to="/admin/branches"
        className="group relative bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs hover:shadow-md hover:border-orange-200 transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
            <Building2 size={24} />
          </div>
          <span className="inline-flex items-center text-xs font-semibold text-gray-400 group-hover:text-orange-600 transition-colors">
            Chi tiết <ArrowUpRight size={14} />
          </span>
        </div>
        <div className="mt-2.5">
          <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Tổng Chi Nhánh</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-gray-900">
              {loading ? <span className="inline-block w-8 h-8 bg-gray-200 rounded animate-pulse" /> : branches.length}
            </span>
            <span className="text-xs text-emerald-600 font-medium">({activeBranchesCount} hoạt động)</span>
          </div>
        </div>
      </Link>

      {/* Card 2: Tổng Bàn Ăn */}
      <Link
        to="/admin/tables"
        className="group relative bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <LayoutGrid size={24} />
          </div>
          <span className="inline-flex items-center text-xs font-semibold text-gray-400 group-hover:text-blue-600 transition-colors">
            Chi tiết <ArrowUpRight size={14} />
          </span>
        </div>
        <div className="mt-2.5">
          <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Tổng Bàn Toàn Chuỗi</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-gray-900">
              {loading ? <span className="inline-block w-8 h-8 bg-gray-200 rounded animate-pulse" /> : tables.length}
            </span>
            <span className="text-xs text-blue-600 font-medium">Sơ đồ tầng</span>
          </div>
        </div>
      </Link>

      {/* Card 3: Tổng Loại Bàn */}
      <Link
        to="/admin/table-types"
        className="group relative bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs hover:shadow-md hover:border-purple-200 transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Grid3X3 size={24} />
          </div>
          <span className="inline-flex items-center text-xs font-semibold text-gray-400 group-hover:text-purple-600 transition-colors">
            Chi tiết <ArrowUpRight size={14} />
          </span>
        </div>
        <div className="mt-2.5">
          <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Loại Bàn Mẫu</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-gray-900">
              {loading ? <span className="inline-block w-8 h-8 bg-gray-200 rounded animate-pulse" /> : tableTypes.length}
            </span>
            <span className="text-xs text-purple-600 font-medium">Định mức khách</span>
          </div>
        </div>
      </Link>

      {/* Card 4: Danh Mục Món */}
      <Link
        to="/admin/menu-categories"
        className="group relative bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs hover:shadow-md hover:border-amber-200 transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <FolderKanban size={24} />
          </div>
          <span className="inline-flex items-center text-xs font-semibold text-gray-400 group-hover:text-amber-600 transition-colors">
            Chi tiết <ArrowUpRight size={14} />
          </span>
        </div>
        <div className="mt-2.5">
          <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Danh Mục Thực Đơn</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-gray-900">
              {loading ? <span className="inline-block w-8 h-8 bg-gray-200 rounded animate-pulse" /> : categories.length}
            </span>
            <span className="text-xs text-amber-600 font-medium">Phân loại món</span>
          </div>
        </div>
      </Link>

      {/* Card 5: Món Ăn Toàn Hệ Thống */}
      <Link
        to="/admin/menu-items"
        className="group relative bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <UtensilsCrossed size={24} />
          </div>
          <span className="inline-flex items-center text-xs font-semibold text-gray-400 group-hover:text-emerald-600 transition-colors">
            Chi tiết <ArrowUpRight size={14} />
          </span>
        </div>
        <div className="mt-2.5">
          <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Món Ăn Toàn Chuỗi</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-gray-900">
              {loading ? <span className="inline-block w-8 h-8 bg-gray-200 rounded animate-pulse" /> : menuItems.length}
            </span>
            <span className="text-xs text-emerald-600 font-medium">({activeMenuItemsCount} mở bán)</span>
          </div>
        </div>
      </Link>
    </div>
  );
};
