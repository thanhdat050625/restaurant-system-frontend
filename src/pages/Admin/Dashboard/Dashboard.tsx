import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { branchService } from '../../../services/admin/branchService';
import { tableService } from '../../../services/admin/tableService';
import { tableTypeService } from '../../../services/admin/tableTypeService';
import { menuCategoryService } from '../../../services/admin/menuCategory.service';
import { menuItemService } from '../../../services/admin/menuItem.service';
import { IBranch } from '../../../types/admin/branch.type';
import { ITable } from '../../../types/admin/table.type';
import { ITableType } from '../../../types/admin/table-type.type';
import { MenuCategory } from '../../../types/menuCategory.type';
import { MenuItem } from '../../../types/menuItem.type';
import {
  Building2,
  LayoutGrid,
  Grid3X3,
  UtensilsCrossed,
  FolderKanban,
  ArrowUpRight,
  RefreshCw,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [tables, setTables] = useState<ITable[]>([]);
  const [tableTypes, setTableTypes] = useState<ITableType[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [branchesRes, tablesRes, tableTypesRes, categoriesRes, menuItemsRes] = await Promise.all([
        branchService.getBranches({ limit: 100 }).catch(() => ({ data: [] })),
        tableService.getTables({ limit: 1000 }).catch(() => ({ data: [] })),
        tableTypeService.getTableTypes({ limit: 100 }).catch(() => ({ data: [] })),
        menuCategoryService.getAll({ includeInactive: true, limit: 100 }).catch(() => ({ data: [] })),
        menuItemService.getAll({ includeInactive: true, limit: 1000 }).catch(() => ({ data: [] }))
      ]);

      const branchList = Array.isArray(branchesRes) ? branchesRes : (branchesRes as any)?.data || [];
      const tableList = Array.isArray(tablesRes) ? tablesRes : (tablesRes as any)?.data || [];
      const tableTypeList = Array.isArray(tableTypesRes) ? tableTypesRes : (tableTypesRes as any)?.data || [];
      const categoryList = Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes as any)?.data || [];
      const menuItemList = Array.isArray(menuItemsRes) ? menuItemsRes : (menuItemsRes as any)?.data || [];

      setBranches(branchList);
      setTables(tableList);
      setTableTypes(tableTypeList);
      setCategories(categoryList);
      setMenuItems(menuItemList);

      if (isManualRefresh) {
        toast.success('Đã cập nhật dữ liệu mới nhất!');
      }
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      toast.error('Lỗi khi tải dữ liệu thống kê');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatVND = (price: number | string | undefined | null) => {
    if (price === undefined || price === null) return '-';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const activeBranchesCount = branches.filter((b) => b.status === 'ACTIVE').length;
  const activeMenuItemsCount = menuItems.filter((m) => m.isActive).length;
  const featuredMenuItems = menuItems.filter((m) => m.isFeatured);

  // Group table count per branch
  const tablesPerBranch = branches.map((b) => {
    const count = tables.filter((t) => t.branchId === b.id).length;
    return {
      ...b,
      tableCount: count,
    };
  });

  return (
    <div className="space-y-4 pb-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Tổng Quan Hệ Thống</h2>
          <p className="text-sm text-gray-500 mt-0.5">Số liệu thống kê chuỗi nhà hàng, sơ đồ bàn và thực đơn</p>
        </div>
        <button
          onClick={() => fetchAllStats(true)}
          disabled={refreshing || loading}
          className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin text-primary' : 'text-gray-500'} />
          <span>{refreshing ? 'Đang cập nhật...' : 'Làm mới'}</span>
        </button>
      </div>

      {/* 5 KPI Metric Cards (Giữ nguyên cỡ chữ text-3xl font-extrabold và icon size={24}, chỉ giảm padding) */}
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
                {loading ? <span className="inline-block w-8 h-8 bg-gray-200 rounded animate-pulse"></span> : branches.length}
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
                {loading ? <span className="inline-block w-8 h-8 bg-gray-200 rounded animate-pulse"></span> : tables.length}
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
                {loading ? <span className="inline-block w-8 h-8 bg-gray-200 rounded animate-pulse"></span> : tableTypes.length}
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
                {loading ? <span className="inline-block w-8 h-8 bg-gray-200 rounded animate-pulse"></span> : categories.length}
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
                {loading ? <span className="inline-block w-8 h-8 bg-gray-200 rounded animate-pulse"></span> : menuItems.length}
              </span>
              <span className="text-xs text-emerald-600 font-medium">({activeMenuItemsCount} mở bán)</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Grid: Branch Overview & Featured Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Active Branches */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-xs p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Các Chi Nhánh Trong Chuỗi</h2>
                <p className="text-xs text-gray-500">Danh sách các cơ sở nhà hàng và quy mô bàn ăn</p>
              </div>
            </div>
            <Link
              to="/admin/branches"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              Quản lý chi nhánh <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-400 text-sm">Đang tải danh sách chi nhánh...</div>
          ) : tablesPerBranch.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">Chưa có chi nhánh nào được tạo.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {tablesPerBranch.map((branch) => (
                <div
                  key={branch.id}
                  className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-orange-200 hover:shadow-xs transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 text-sm">{branch.name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        branch.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {branch.status === 'ACTIVE' ? 'Đang mở' : 'Tạm dừng'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400 shrink-0" />
                      <span className="truncate">{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400 shrink-0" />
                      <span>{branch.phone}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700 flex items-center gap-1">
                      <Layers size={13} className="text-blue-500" /> {branch.tableCount} Bàn phục vụ
                    </span>
                    <Link
                      to="/admin/tables"
                      className="text-orange-600 hover:underline font-medium"
                    >
                      Sơ đồ bàn &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Featured Dishes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Món Nổi Bật Chuỗi</h2>
                <p className="text-xs text-gray-500">Món ăn bán chạy & được gắn cờ Best-seller</p>
              </div>
            </div>
            <Link
              to="/admin/menu-items"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-400 text-sm">Đang tải món ăn...</div>
          ) : featuredMenuItems.length === 0 ? (
            <div className="py-6 text-center text-gray-400 text-xs">Chưa có món nào được đánh dấu nổi bật.</div>
          ) : (
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-0.5">
              {featuredMenuItems.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white transition-all gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                        <UtensilsCrossed size={16} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> {item.preparationTime || 15}p nấu
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-orange-600">{formatVND(item.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
