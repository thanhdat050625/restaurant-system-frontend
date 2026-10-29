import React, { useState, useEffect, useCallback } from 'react';
import {
  BrushCleaning,
  Sparkles,
  RefreshCw,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
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

  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const fetchTurnover = useCallback(
    async (showLoading = false) => {
      if (!branchId) return;
      if (showLoading) setIsLoading(true);
      try {
        const res = await tableService.getTableTurnover(branchId);
        const data = res?.data?.data || res?.data;
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
              <Sparkles size={18} />
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
        </div>

        {dirtyTables.length === 0 ? (
          <div className="p-6 text-center bg-white/80 rounded-xl border border-emerald-200 flex flex-col items-center justify-center gap-1.5 text-emerald-700">
            <CheckCircle2 size={28} className="text-emerald-500" />
            <span className="text-sm font-bold">Tất cả bàn ăn đã được dọn dẹp sạch sẽ!</span>
            <span className="text-xs text-emerald-600">Hiện tại không có bàn nào trong hàng đợi chờ dọn.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {dirtyTables.map((table) => (
              <TableTurnoverCard
                key={`urgent-${table.id}`}
                table={table}
                onUpdateStatus={handleUpdateStatus}
                isUpdating={updatingTableId === table.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* KHU VỰC 2: SƠ ĐỒ TOÀN BỘ BÀN THEO TẦNG */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-primary" />
            <h2 className="text-base font-bold text-gray-800">Sơ Đồ Toàn Bộ Bàn</h2>
          </div>

          {/* Lọc trạng thái nhanh dạng Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'ALL', label: 'Tất cả', count: summary.total },
              { id: 'DIRTY', label: 'Cần dọn', count: summary.dirty, color: 'text-amber-700 bg-amber-100' },
              { id: 'OCCUPIED', label: 'Đang có khách', count: summary.occupied },
              { id: 'AVAILABLE', label: 'Sẵn sàng', count: summary.available },
              { id: 'MAINTENANCE', label: 'Bảo trì', count: summary.maintenance },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  selectedStatus === st.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{st.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedStatus === st.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {st.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Lọc tầng */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-500 font-medium mr-1">Tầng phục vụ:</span>
          <button
            type="button"
            onClick={() => setSelectedFloor('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedFloor === 'ALL'
                ? 'bg-gray-800 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tất cả tầng ({allTables.length} bàn)
          </button>
          {floorNumbers.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSelectedFloor(f)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedFloor === f
                  ? 'bg-gray-800 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tầng {f} ({allTables.filter((t) => t.floor === f).length} bàn)
            </button>
          ))}
        </div>

        {/* Tables Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-32 bg-gray-50 rounded-2xl animate-pulse border border-gray-200" />
            ))}
          </div>
        ) : displayedTables.length === 0 ? (
          <div className="p-12 text-center bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-500">
            Không có bàn nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
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
