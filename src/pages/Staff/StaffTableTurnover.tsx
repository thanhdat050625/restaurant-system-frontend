import React, { useState, useEffect, useCallback } from 'react';
import {
  BrushCleaning,
  RefreshCw,
  Building2,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../features/auth/AuthContext';
import { tableService, ITableTurnoverResponse } from '../../services/admin/tableService';
import { socketService } from '../../services/socketService';
import { TableTurnoverCard } from './TableTurnoverCard';
import { ITable } from '../../types/admin/table.type';

export const StaffTableTurnover: React.FC = () => {
  const { user } = useAuth();
  const branchId = (user as any)?.branchId || (user as any)?.branch?.id;

  const [turnoverData, setTurnoverData] = useState<ITableTurnoverResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingTableId, setUpdatingTableId] = useState<string | null>(null);
  const [isBulkCleaning, setIsBulkCleaning] = useState(false);

  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const fetchTurnover = useCallback(
    async (showLoading = false) => {
      if (!branchId) return;
      if (showLoading) setIsLoading(true);
      try {
        const res: any = await tableService.getTableTurnover(branchId);
        const data = res?.data?.data || res?.data || res;
        setTurnoverData(data || null);
      } catch {
        setTurnoverData(null);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [branchId],
  );

  useEffect(() => {
    fetchTurnover(true);
  }, [fetchTurnover]);

  // Lắng nghe sự kiện WebSocket thời gian thực khi trạng thái bàn thay đổi
  useEffect(() => {
    if (!branchId) return;

    socketService.connect((user as any)?.id);
    socketService.joinBranch(branchId);

    const handleStatusChanged = () => {
      fetchTurnover(false);
    };

    socketService.on('table:status_changed', handleStatusChanged);
    socketService.on('table:reserved', handleStatusChanged);

    return () => {
      socketService.off('table:status_changed', handleStatusChanged);
      socketService.off('table:reserved', handleStatusChanged);
      socketService.leaveBranch(branchId);
    };
  }, [branchId, user, fetchTurnover]);

  const handleUpdateStatus = async (tableId: string, status: string) => {
    setUpdatingTableId(tableId);
    try {
      await tableService.updateTableStatus(tableId, status);
      toast.success(
        status === 'AVAILABLE'
          ? 'Đã chuyển bàn về trạng thái Sẵn sàng đón khách.'
          : status === 'DIRTY'
            ? 'Đã chuyển bàn vào hàng đợi Cần dọn dẹp.'
            : 'Cập nhật trạng thái bàn thành công.',
      );
      fetchTurnover(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể cập nhật trạng thái bàn.';
      toast.error(msg);
    } finally {
      setUpdatingTableId(null);
    }
  };

  const handleBulkClean = async () => {
    if (!branchId) return;
    setIsBulkCleaning(true);
    try {
      const res: any = await tableService.bulkCleanTables(branchId);
      const msg = res?.message || res?.data?.message || 'Đã dọn sạch tất cả bàn thành công.';
      toast.success(msg);
      fetchTurnover(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể dọn dẹp bàn.');
    } finally {
      setIsBulkCleaning(false);
    }
  };

  if (!branchId) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-200">
        <Building2 size={48} className="mx-auto text-gray-400 mb-3" />
        <h3 className="text-base font-bold text-gray-800">Tài khoản chưa được gán chi nhánh</h3>
        <p className="text-xs text-gray-500 mt-1">
          Vui lòng liên hệ Quản trị viên để phân quyền chi nhánh làm việc cho bạn.
        </p>
      </div>
    );
  }

  const summary = turnoverData?.summary || {
    total: 0,
    available: 0,
    occupied: 0,
    dirty: 0,
    maintenance: 0,
    occupancyRate: 0,
  };

  const floors = turnoverData?.floors || [];
  const allTables: ITable[] = floors.flatMap((f) => f.tables);

  // Danh sách các bàn đang bẩn (DIRTY), sắp xếp theo thời gian chờ dọn lâu nhất lên đầu
  const dirtyTables = allTables
    .filter((t) => t.status === 'DIRTY')
    .sort((a, b) => (a.dirtySince || 0) - (b.dirtySince || 0));

  // Bộ lọc bàn theo tầng và trạng thái
  const displayedTables = allTables.filter((t) => {
    if (selectedFloor !== 'ALL' && t.floor !== selectedFloor) return false;
    if (selectedStatus !== 'ALL' && t.status !== selectedStatus) return false;
    return true;
  });

  const floorNumbers = Array.from(new Set(floors.map((f) => f.floor))).sort((a, b) => a - b);

  return (
    <div className="min-h-full p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BrushCleaning className="text-primary" size={24} />
            <span>Quản Lý Dọn Bàn & Xoay Vòng Bàn</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Theo dõi thời gian thực các bàn ăn cần dọn dẹp sau khi khách rời đi và chuyển về sẵn sàng đón khách
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchTurnover(true)}
          disabled={isLoading}
          className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* KPI Stats summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-xs text-gray-500 font-medium">Tỷ lệ lấp đầy</span>
          <p className="text-2xl font-extrabold text-gray-800">{summary.occupancyRate}%</p>
          <span className="text-[11px] text-gray-400">Tổng {summary.total} bàn phục vụ</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-xs text-blue-600 font-medium">Đang có khách</span>
          <p className="text-2xl font-extrabold text-blue-700">{summary.occupied}</p>
          <span className="text-[11px] text-gray-400">Bàn đang dùng bữa</span>
        </div>

        <div
          className={`p-4 bg-white rounded-2xl border shadow-sm space-y-1 transition-all ${
            summary.dirty > 0
              ? 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-200'
              : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-800 font-semibold">Cần dọn dẹp ngay</span>
            {summary.dirty > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <p className="text-2xl font-extrabold text-amber-800">{summary.dirty}</p>
          <span className="text-[11px] text-amber-700 font-medium">
            {summary.dirty > 0 ? 'Ưu tiên xử lý kịp thời' : 'Không có bàn chờ dọn'}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-sm space-y-1 bg-emerald-50/50">
          <span className="text-xs text-emerald-700 font-medium">Sẵn sàng đón khách</span>
          <p className="text-2xl font-extrabold text-emerald-700">{summary.available}</p>
          <span className="text-[11px] text-emerald-600">Bàn sạch sẽ</span>
        </div>
      </div>

      {/* KHU VỰC 1: HÀNG ĐỢI DỌN DẸP KHẨN CẤP */}
      <div className="p-5 bg-white rounded-2xl border-2 border-amber-300 shadow-sm space-y-4 bg-amber-50/30">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <BrushCleaning size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <span>Hàng Đợi Cần Dọn Dẹp</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-200 text-amber-900">
                  {dirtyTables.length} bàn
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Ưu tiên dọn bàn có thời gian chờ lâu nhất để xoay vòng phục vụ lượt khách tiếp theo
              </p>
            </div>
          </div>

          {dirtyTables.length > 0 && (
            <button
              type="button"
              onClick={handleBulkClean}
              disabled={isBulkCleaning}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <BrushCleaning size={14} className={isBulkCleaning ? 'animate-spin' : ''} />
              <span>Dọn sạch tất cả ({dirtyTables.length} bàn)</span>
            </button>
          )}
        </div>

        {dirtyTables.length === 0 ? (
          <div className="p-6 text-center bg-white/80 rounded-xl border border-emerald-200 flex flex-col items-center justify-center gap-1.5 text-emerald-700">
            <CheckCircle2 size={28} className="text-emerald-500" />
            <span className="text-sm font-bold">Tất cả bàn ăn đã được dọn dẹp sạch sẽ!</span>
            <span className="text-xs text-emerald-600">Hiện tại không có bàn nào trong hàng đợi chờ dọn.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {dirtyTables.map((table) => (
              <TableTurnoverCard
                key={table.id}
                table={table}
                onUpdateStatus={handleUpdateStatus}
                isUpdating={updatingTableId === table.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* KHU VỰC 2: TẤT CẢ CÁC BÀN THEO TẦNG */}
      <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="text-gray-500" size={20} />
            <h2 className="text-base font-bold text-gray-800">
              Sơ Đồ Toàn Bộ Bàn Phục Vụ ({displayedTables.length} bàn)
            </h2>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {/* Lọc theo tầng */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setSelectedFloor('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedFloor === 'ALL'
                    ? 'bg-white text-gray-900 shadow-sm font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tất cả tầng
              </button>
              {floorNumbers.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedFloor(f)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    selectedFloor === f
                      ? 'bg-white text-gray-900 shadow-sm font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Tầng {f}
                </button>
              ))}
            </div>

            {/* Lọc theo trạng thái */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-xs bg-gray-100 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="AVAILABLE">Sẵn sàng</option>
              <option value="OCCUPIED">Đang có khách</option>
              <option value="DIRTY">Cần dọn dẹp</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
          </div>
        </div>

        {displayedTables.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">
            Không tìm thấy bàn nào phù hợp với bộ lọc đã chọn.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {displayedTables.map((table) => (
              <TableTurnoverCard
                key={table.id}
                table={table}
                onUpdateStatus={handleUpdateStatus}
                isUpdating={updatingTableId === table.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffTableTurnover;
