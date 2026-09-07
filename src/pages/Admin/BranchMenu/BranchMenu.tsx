import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../features/auth/AuthContext';
import { branchService } from '../../../services/admin/branchService';
import { branchMenuService } from '../../../services/admin/branchMenuService';
import { menuCategoryService } from '../../../services/admin/menuCategory.service';
import { IBranch } from '../../../types/admin/branch.type';
import {
  IBranchMenuItem,
  IBranchMenuStats,
  IBranchInfo,
} from '../../../types/admin/branch-menu.type';
import { MenuCategory } from '../../../types/menuCategory.type';
import { PaginationMeta } from '../../../types/api-response.type';
import Pagination from '../../../components/common/Pagination';
import PriceOverrideModal from './PriceOverrideModal';
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  CheckSquare,
  Square,
  Star,
} from 'lucide-react';
import toast from 'react-hot-toast';

const BranchMenu: React.FC = () => {
  const { user } = useAuth();
  const isStaff = user?.role === 'STAFF';

  // Branches & Categories state
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [categories, setCategories] = useState<MenuCategory[]>([]);

  // Menu items & Stats
  const [items, setItems] = useState<IBranchMenuItem[]>([]);
  const [stats, setStats] = useState<IBranchMenuStats>({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    inactive: 0,
  });
  const [currentBranchInfo, setCurrentBranchInfo] = useState<IBranchInfo | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);

  // Filters & Pagination
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('ALL'); // ALL, IN_STOCK, OUT_OF_STOCK
  const [activeFilter, setActiveFilter] = useState<string>('ALL'); // ALL, ACTIVE, INACTIVE

  // Selection for bulk action
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState<boolean>(false);

  // Modal Price Override
  const [editingItem, setEditingItem] = useState<IBranchMenuItem | null>(null);

  // 1. Fetch initial branches and categories
  useEffect(() => {
    fetchInitialData();
  }, []);

  // 2. Fetch branch menu when branch or filters change
  useEffect(() => {
    if (selectedBranchId) {
      fetchBranchMenu();
    }
  }, [selectedBranchId, page, limit, search, categoryFilter, availabilityFilter, activeFilter]);

  const fetchInitialData = async () => {
    try {
      const [branchesRes, categoriesRes] = await Promise.all([
        branchService.getBranches({ limit: 100 }),
        menuCategoryService.getAll({ includeInactive: true, limit: 100 }),
      ]);

      let branchList: IBranch[] = [];
      if (Array.isArray(branchesRes)) {
        branchList = branchesRes;
      } else if (Array.isArray((branchesRes as any)?.data?.items)) {
        branchList = (branchesRes as any).data.items;
      } else if (Array.isArray((branchesRes as any)?.data)) {
        branchList = (branchesRes as any).data;
      }

      let catList: any[] = [];
      if (Array.isArray(categoriesRes)) {
        catList = categoriesRes;
      } else if (Array.isArray((categoriesRes as any)?.data?.items)) {
        catList = (categoriesRes as any).data.items;
      } else if (Array.isArray((categoriesRes as any)?.data)) {
        catList = (categoriesRes as any).data;
      }

      const staffBranchId = user?.branchId ? user.branchId : (user?.branch?.id ? user.branch.id : undefined);
      if (isStaff && staffBranchId) {
        const myBranch = branchList.filter((b) => b.id === staffBranchId);
        setBranches(
          myBranch.length > 0 ? myBranch : (user as any)?.branch ? [(user as any).branch] : []
        );
        setSelectedBranchId(staffBranchId);
      } else {
        setBranches(branchList);
        if (branchList.length > 0) {
          setSelectedBranchId(branchList[0].id);
        }
      }
      setCategories(catList);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Lỗi khi tải thông tin chi nhánh và danh mục');
    }
  };

  const fetchBranchMenu = async (showSpinner = true) => {
    if (!selectedBranchId) return;

    try {
      if (showSpinner) setLoading(true);

      const params: any = {
        page,
        limit,
        ...(search.trim() && { search: search.trim() }),
        ...(categoryFilter !== 'ALL' && { categoryId: categoryFilter }),
        ...(availabilityFilter !== 'ALL' && { isAvailable: availabilityFilter === 'IN_STOCK' }),
        ...(activeFilter !== 'ALL' && { isActive: activeFilter === 'ACTIVE' }),
      };

      const res = await branchMenuService.getBranchMenu(selectedBranchId, params);
      const resData = (res as any)?.data;
      const rawData = resData !== undefined ? resData : res;
      let itemList: IBranchMenuItem[] = [];
      let statsData: IBranchMenuStats | null = null;
      let branchData: IBranchInfo | null = null;

      if (Array.isArray(rawData)) {
        itemList = rawData;
      } else if (rawData && typeof rawData === 'object') {
        if (Array.isArray(rawData.items)) {
          itemList = rawData.items;
        }
        if (rawData.stats) {
          statsData = rawData.stats;
        }
        if (rawData.branch) {
          branchData = rawData.branch;
        }
      }

      setItems(itemList);

      if (statsData) {
        setStats(statsData);
      } else {
        const metaTotal = (res as any)?.meta?.totalItems;
        const total = metaTotal !== undefined ? metaTotal : itemList.length;
        const inStock = itemList.filter((i) => i.isAvailable && i.isActive).length;
        const outOfStock = itemList.filter((i) => !i.isAvailable && i.isActive).length;
        const inactive = itemList.filter((i) => !i.isActive).length;
        setStats({
          total,
          inStock,
          outOfStock,
          inactive,
        });
      }

      if (branchData) {
        setCurrentBranchInfo(branchData);
      }

      const resMeta = (res as any)?.meta;
      const rawMeta = rawData?.meta;
      const paginationMeta = resMeta !== undefined ? resMeta : (rawMeta !== undefined ? rawMeta : null);
      if (paginationMeta) {
        setMeta(paginationMeta);
      }
    } catch (error: any) {
      console.error('Error fetching branch menu:', error);
      const resMsg = error.response?.data?.message;
      toast.error(resMsg ? resMsg : 'Lỗi khi tải thực đơn chi nhánh');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  // Switch Toggle: Còn hàng / Tạm hết hôm nay (1 chạm)
  const handleToggleAvailability = async (item: IBranchMenuItem) => {
    const nextAvailability = !item.isAvailable;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) =>
        i.menuItemId === item.menuItemId ? { ...i, isAvailable: nextAvailability } : i
      )
    );

    try {
      await branchMenuService.toggleAvailability(selectedBranchId, item.menuItemId, nextAvailability);
      toast.success(
        nextAvailability
          ? `Món "${item.menuItem?.name}" đã chuyển sang CÒN HÀNG`
          : `Món "${item.menuItem?.name}" đã đánh dấu TẠM HẾT hôm nay`
      );
      fetchBranchMenu(false);
    } catch (error: any) {
      // Revert optimistic update
      setItems((prev) =>
        prev.map((i) =>
          i.menuItemId === item.menuItemId ? { ...i, isAvailable: item.isAvailable } : i
        )
      );
      const resMsg = error.response?.data?.message;
      toast.error(resMsg ? resMsg : 'Không thể cập nhật tình trạng món');
    }
  };

  // Switch Toggle: Phục vụ tại cơ sở (isActive)
  const handleToggleStatus = async (item: IBranchMenuItem) => {
    const nextStatus = !item.isActive;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.menuItemId === item.menuItemId ? { ...i, isActive: nextStatus } : i
      )
    );

    try {
      await branchMenuService.toggleStatus(selectedBranchId, item.menuItemId, nextStatus);
      toast.success(
        nextStatus
          ? `Món "${item.menuItem?.name}" đã BẬT phục vụ tại chi nhánh`
          : `Món "${item.menuItem?.name}" đã NGỪNG phục vụ tại chi nhánh`
      );
      fetchBranchMenu(false);
    } catch (error: any) {
      // Revert
      setItems((prev) =>
        prev.map((i) =>
          i.menuItemId === item.menuItemId ? { ...i, isActive: item.isActive } : i
        )
      );
      const resMsg = error.response?.data?.message;
      toast.error(resMsg ? resMsg : 'Không thể thay đổi trạng thái món');
    }
  };

  // Save Price Override from Modal
  const handleSavePriceOverride = async (menuItemId: string, priceOverride: number | null) => {
    await branchMenuService.updatePriceOverride(selectedBranchId, menuItemId, priceOverride);
    fetchBranchMenu(false);
  };

  // Đồng bộ món chuỗi vào chi nhánh
  const handleSyncMenu = async () => {
    if (!selectedBranchId) return;
    try {
      setSyncing(true);
      const res = await branchMenuService.syncBranchMenu(selectedBranchId);
      const syncedCount = (res as any)?.data?.syncedCount;
      const count = typeof syncedCount === 'number' ? syncedCount : 0;
      toast.success(
        count > 0
          ? `Đã đồng bộ bổ sung ${count} món mới từ chuỗi vào chi nhánh!`
          : 'Thực đơn chi nhánh đã đầy đủ và đồng bộ mới nhất!'
      );
      fetchBranchMenu(false);
    } catch (error: any) {
      const resMsg = error.response?.data?.message;
      toast.error(resMsg ? resMsg : 'Lỗi khi đồng bộ thực đơn');
    } finally {
      setSyncing(false);
    }
  };

  // Bulk Actions
  const handleToggleSelectAll = () => {
    if (selectedItemIds.length === items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(items.map((i) => i.menuItemId));
    }
  };

  const handleToggleSelectItem = (menuItemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(menuItemId) ? prev.filter((id) => id !== menuItemId) : [...prev, menuItemId]
    );
  };

  const handleBulkSetAvailability = async (isAvailable: boolean) => {
    if (selectedItemIds.length === 0) return;

    try {
      setIsBulkUpdating(true);
      await branchMenuService.bulkUpdateAvailability(selectedBranchId, selectedItemIds, isAvailable);
      toast.success(
        `Đã chuyển ${selectedItemIds.length} món sang trạng thái: ${
          isAvailable ? 'CÒN HÀNG' : 'TẠM HẾT HÔM NAY'
        }`
      );
      setSelectedItemIds([]);
      fetchBranchMenu(false);
    } catch (error: any) {
      const resMsg = error.response?.data?.message;
      toast.error(resMsg ? resMsg : 'Lỗi khi cập nhật hàng loạt');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const formatVND = (price: number | string | undefined | null) => {
    if (price === undefined || price === null) return '-';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const selectedBranchName =
    branches.find((b) => b.id === selectedBranchId)?.name || currentBranchInfo?.name || 'Chi Nhánh';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Header đồng bộ chuẩn với các tab Quản lý khác */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-800">Thực Đơn Chi Nhánh</h2>
            {stats.total > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {stats.total} món ({stats.inStock} còn hàng)
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Điều phối tình trạng còn/hết món và quản lý giá bán riêng theo từng cơ sở phục vụ
          </p>
        </div>

        {/* Action Controls: Branch selector cho Admin */}
        {!isStaff && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-300">
              <Building2 size={16} className="text-primary shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Cơ Sở Phục Vụ</span>
                <select
                  value={selectedBranchId}
                  onChange={(e) => {
                    setSelectedBranchId(e.target.value);
                    setPage(1);
                    setSelectedItemIds([]);
                  }}
                  className="bg-transparent text-sm font-semibold text-gray-800 outline-none cursor-pointer"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Bar chuẩn đồng bộ */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên món hoặc mô tả..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full py-2 px-3 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={availabilityFilter}
            onChange={(e) => {
              setAvailabilityFilter(e.target.value);
              setPage(1);
            }}
            className="w-full py-2 px-3 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả tình trạng kho</option>
            <option value="IN_STOCK">Còn hàng hôm nay</option>
            <option value="OUT_OF_STOCK">Tạm hết hôm nay</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
            className="w-full py-2 px-3 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái phục vụ</option>
            <option value="ACTIVE">Đang phục vụ tại cơ sở</option>
            <option value="INACTIVE">Ngừng bán tại cơ sở</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedItemIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm">
          <span className="font-semibold text-primary">
            Đã chọn {selectedItemIds.length} món ăn
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkSetAvailability(true)}
              disabled={isBulkUpdating}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>Đánh dấu Còn hàng</span>
            </button>
            <button
              onClick={() => handleBulkSetAvailability(false)}
              disabled={isBulkUpdating}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <AlertTriangle size={14} />
              <span>Đánh dấu Tạm hết</span>
            </button>
            <button
              onClick={() => setSelectedItemIds([])}
              className="px-2.5 py-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Table UI đồng bộ chuẩn */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-gray-500 mt-2">Đang tải thực đơn chi nhánh...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-100 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="p-3 w-10 text-center">
                    <button
                      onClick={handleToggleSelectAll}
                      className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
                      title="Chọn tất cả trên trang này"
                    >
                      {selectedItemIds.length === items.length && items.length > 0 ? (
                        <CheckSquare size={16} className="text-primary" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="p-3 font-semibold">Món ăn</th>
                  <th className="p-3 font-semibold">Danh mục</th>
                  <th className="p-3 font-semibold text-right">Giá bán tại cơ sở</th>
                  <th className="p-3 font-semibold text-center">Tình trạng hôm nay (1 Chạm)</th>
                  <th className="p-3 font-semibold text-center">Phục vụ cơ sở</th>
                  <th className="p-3 font-semibold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      Không tìm thấy món ăn nào phù hợp với bộ lọc
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const isSelected = selectedItemIds.includes(item.menuItemId);
                    const defaultPrice = item.menuItem?.price ? Number(item.menuItem.price) : 0;
                    const hasPriceOverride =
                      item.priceOverride !== null && item.priceOverride !== undefined;
                    const currentPrice = hasPriceOverride
                      ? Number(item.priceOverride)
                      : defaultPrice;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-primary/5' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleToggleSelectItem(item.menuItemId)}
                            className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare size={16} className="text-primary" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>

                        {/* Món ăn */}
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {item.menuItem?.imageUrl ? (
                              <img
                                src={item.menuItem.imageUrl}
                                alt={item.menuItem.name}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs shrink-0 font-medium">
                                No img
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                                {item.menuItem?.name}
                                {item.menuItem?.isFeatured && (
                                  <span className="inline-flex items-center gap-0.5 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                                    <Star size={12} className="fill-amber-500 text-amber-500" />
                                    Nổi bật
                                  </span>
                                )}
                              </div>
                              {item.menuItem?.description && (
                                <p className="text-xs text-gray-500 truncate max-w-xs">
                                  {item.menuItem.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Danh mục */}
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {item.menuItem?.category?.name ? item.menuItem.category.name : 'Chưa phân loại'}
                          </span>
                        </td>

                        {/* Giá bán tại cơ sở */}
                        <td className="p-3 text-right">
                          <div className="font-bold text-gray-900">
                            {formatVND(currentPrice)}
                          </div>
                          {hasPriceOverride ? (
                            <div className="text-[11px] text-gray-400 line-through">
                              Gốc: {formatVND(defaultPrice)}
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400">Giá niêm yết</span>
                          )}
                        </td>

                        {/* Tình trạng hôm nay (1 Chạm) */}
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(item)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                              item.isAvailable
                                ? 'text-emerald-800 bg-emerald-100 border border-emerald-200 hover:bg-emerald-200'
                                : 'text-amber-800 bg-amber-100 border border-amber-200 hover:bg-amber-200'
                            }`}
                            title="Bấm để chuyển nhanh giữa Còn hàng và Tạm hết"
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                item.isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                            <span>{item.isAvailable ? 'Còn hàng' : 'Tạm hết'}</span>
                          </button>
                        </td>

                        {/* Phục vụ cơ sở */}
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded cursor-pointer transition-colors ${
                              item.isActive
                                ? 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                                : 'text-gray-500 bg-gray-100 hover:bg-gray-200 border border-gray-200'
                            }`}
                            title="Bấm để bật/tắt phục vụ món này tại chi nhánh"
                          >
                            {item.isActive ? 'Đang phục vụ' : 'Ngừng bán'}
                          </button>
                        </td>

                        {/* Thao tác */}
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="text-info hover:text-blue-700 font-medium text-xs px-2.5 py-1 bg-blue-50 rounded hover:bg-blue-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Điều chỉnh giá riêng cho chi nhánh này"
                          >
                            <Edit3 size={13} />
                            <span>Chỉnh giá</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {meta && (
            <Pagination
              meta={meta}
              onPageChange={(newPage) => setPage(newPage)}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          )}
        </>
      )}

      {/* Modal Price Override */}
      <PriceOverrideModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        branchName={selectedBranchName}
        onSave={handleSavePriceOverride}
      />
    </div>
  );
};

export default BranchMenu;
