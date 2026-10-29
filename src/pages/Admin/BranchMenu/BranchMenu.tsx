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
import BranchMenuTable from './BranchMenuTable';
import { Building2, Search, Filter, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Select from '../../../components/ui/Select';

const BranchMenu: React.FC = () => {
  const { user } = useAuth();
  const isStaff = user?.role === 'STAFF';

  const [branches, setBranches] = useState<IBranch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [categories, setCategories] = useState<MenuCategory[]>([]);

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

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('ALL');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<IBranchMenuItem | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

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

      const branchList = Array.isArray(branchesRes)
        ? branchesRes
        : (branchesRes as any)?.data?.items || (branchesRes as any)?.data || [];

      const catList = Array.isArray(categoriesRes)
        ? categoriesRes
        : (categoriesRes as any)?.data?.items || (categoriesRes as any)?.data || [];

      const staffBranchId = user?.branchId || user?.branch?.id;
      if (isStaff && staffBranchId) {
        const myBranch = branchList.filter((b: IBranch) => b.id === staffBranchId);
        setBranches(myBranch.length > 0 ? myBranch : (user as any)?.branch ? [(user as any).branch] : []);
        setSelectedBranchId(staffBranchId);
      } else {
        setBranches(branchList);
        if (branchList.length > 0) {
          setSelectedBranchId(branchList[0].id);
        }
      }
      setCategories(catList);
    } catch {
      toast.error('Lỗi khi tải thông tin chi nhánh và danh mục');
    }
  };

  const fetchBranchMenu = async (showSpinner = true) => {
    if (!selectedBranchId) return;

    try {
      if (showSpinner) setLoading(true);

      const params = {
        page,
        limit,
        ...(search.trim() && { search: search.trim() }),
        ...(categoryFilter !== 'ALL' && { categoryId: categoryFilter }),
        ...(availabilityFilter !== 'ALL' && { isAvailable: availabilityFilter === 'IN_STOCK' }),
        ...(activeFilter !== 'ALL' && { isActive: activeFilter === 'ACTIVE' }),
      };

      const res = await branchMenuService.getBranchMenu(selectedBranchId, params);
      const rawData = (res as any)?.data !== undefined ? (res as any).data : res;

      let itemList: IBranchMenuItem[] = [];
      if (Array.isArray(rawData)) {
        itemList = rawData;
      } else if (rawData && typeof rawData === 'object') {
        if (Array.isArray(rawData.items)) itemList = rawData.items;
        if (rawData.stats) setStats(rawData.stats);
        if (rawData.branch) setCurrentBranchInfo(rawData.branch);
      }

      setItems(itemList);

      const paginationMeta = (res as any)?.meta || rawData?.meta || null;
      if (paginationMeta) setMeta(paginationMeta);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải thực đơn chi nhánh');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleToggleAvailability = async (item: IBranchMenuItem) => {
    const nextAvailability = !item.isAvailable;
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.menuItemId === item.menuItemId ? { ...i, isAvailable: nextAvailability } : i)),
    );

    try {
      await branchMenuService.toggleAvailability(selectedBranchId, item.menuItemId, nextAvailability);
      toast.success(
        nextAvailability
          ? `Món "${item.menuItem?.name}" đã chuyển sang CÒN HÀNG`
          : `Món "${item.menuItem?.name}" đã đánh dấu TẠM HẾT hôm nay`,
      );
      fetchBranchMenu(false);
    } catch (error: any) {
      setItems((prev) =>
        prev.map((i) => (i.menuItemId === item.menuItemId ? { ...i, isAvailable: item.isAvailable } : i)),
      );
      toast.error(error.response?.data?.message || 'Không thể cập nhật tình trạng món');
    }
  };

  const handleToggleStatus = async (item: IBranchMenuItem) => {
    const nextStatus = !item.isActive;
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.menuItemId === item.menuItemId ? { ...i, isActive: nextStatus } : i)),
    );

    try {
      await branchMenuService.toggleStatus(selectedBranchId, item.menuItemId, nextStatus);
      toast.success(
        nextStatus
          ? `Món "${item.menuItem?.name}" đã BẬT phục vụ tại chi nhánh`
          : `Món "${item.menuItem?.name}" đã NGỪNG phục vụ tại chi nhánh`,
      );
      fetchBranchMenu(false);
    } catch (error: any) {
      setItems((prev) =>
        prev.map((i) => (i.menuItemId === item.menuItemId ? { ...i, isActive: item.isActive } : i)),
      );
      toast.error(error.response?.data?.message || 'Không thể thay đổi trạng thái món');
    }
  };

  const handleSavePriceOverride = async (menuItemId: string, priceOverride: number | null) => {
    await branchMenuService.updatePriceOverride(selectedBranchId, menuItemId, priceOverride);
    fetchBranchMenu(false);
  };

  const handleSyncMenu = async () => {
    if (!selectedBranchId) return;
    try {
      setSyncing(true);
      const res = await branchMenuService.syncBranchMenu(selectedBranchId);
      const count = (res as any)?.data?.syncedCount || 0;
      toast.success(
        count > 0
          ? `Đã đồng bộ bổ sung ${count} món mới từ chuỗi!`
          : 'Thực đơn chi nhánh đã được cập nhật mới nhất!',
      );
      fetchBranchMenu(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi đồng bộ thực đơn');
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedItemIds.length === items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(items.map((i) => i.menuItemId));
    }
  };

  const handleToggleSelectItem = (menuItemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(menuItemId) ? prev.filter((id) => id !== menuItemId) : [...prev, menuItemId],
    );
  };

  const handleBulkSetAvailability = async (isAvailable: boolean) => {
    if (selectedItemIds.length === 0) return;

    try {
      setIsBulkUpdating(true);
      await branchMenuService.bulkUpdateAvailability(selectedBranchId, selectedItemIds, isAvailable);
      toast.success(
        `Đã chuyển ${selectedItemIds.length} món sang: ${isAvailable ? 'CÒN HÀNG' : 'TẠM HẾT HÔM NAY'}`,
      );
      setSelectedItemIds([]);
      fetchBranchMenu(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật hàng loạt');
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
    <div
      className={
        isStaff
          ? 'bg-white min-h-full p-6 space-y-6'
          : 'bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6'
      }
    >
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

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleSyncMenu}
            disabled={syncing || !selectedBranchId}
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Đồng bộ món mới nhất từ thực đơn chuỗi"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Đang đồng bộ...' : 'Đồng bộ món mới'}</span>
          </button>

          {!isStaff && (
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-300">
              <Building2 size={16} className="text-primary shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Cơ Sở Phục Vụ</span>
                <Select
                  tone="light"
                  variant="ghost"
                  className="min-w-[220px] -ml-1"
                  value={selectedBranchId}
                  onChange={(id) => {
                    setSelectedBranchId(id);
                    setPage(1);
                    setSelectedItemIds([]);
                  }}
                  aria-label="Cơ sở phục vụ"
                  options={branches.map((b) => ({ value: b.id, label: b.name }))}
                />
              </div>
            </div>
          )}
        </div>
      </div>

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
          <Select
            size="sm" tone="light"
            value={categoryFilter}
            onChange={(v) => {
              setCategoryFilter(v);
              setPage(1);
            }}
            aria-label="Lọc danh mục"
            options={[
              { value: 'ALL', label: 'Tất cả danh mục' },
              ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
            ]}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            size="sm" tone="light"
            value={availabilityFilter}
            onChange={(v) => {
              setAvailabilityFilter(v);
              setPage(1);
            }}
            aria-label="Lọc tình trạng kho"
            options={[
              { value: 'ALL', label: 'Tất cả tình trạng kho' },
              { value: 'IN_STOCK', label: 'Còn hàng hôm nay' },
              { value: 'OUT_OF_STOCK', label: 'Tạm hết hôm nay' },
            ]}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            size="sm" tone="light"
            value={activeFilter}
            onChange={(v) => {
              setActiveFilter(v);
              setPage(1);
            }}
            aria-label="Lọc trạng thái phục vụ"
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái phục vụ' },
              { value: 'ACTIVE', label: 'Đang phục vụ tại cơ sở' },
              { value: 'INACTIVE', label: 'Ngừng bán tại cơ sở' },
            ]}
          />
        </div>
      </div>

      <BranchMenuTable
        items={items}
        loading={loading}
        selectedItemIds={selectedItemIds}
        isBulkUpdating={isBulkUpdating}
        onToggleSelectAll={handleToggleSelectAll}
        onToggleSelectItem={handleToggleSelectItem}
        onBulkSetAvailability={handleBulkSetAvailability}
        onClearSelection={() => setSelectedItemIds([])}
        onToggleAvailability={handleToggleAvailability}
        onToggleStatus={handleToggleStatus}
        onEditPrice={(item) => setEditingItem(item)}
        formatVND={formatVND}
      />

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
