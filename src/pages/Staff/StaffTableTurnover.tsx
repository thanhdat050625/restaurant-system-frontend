import React, { useState, useEffect, useCallback } from 'react';
import { BrushCleaning, Users, RefreshCw, AlertCircle, Building2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../features/auth/AuthContext';
import { tableService, ITableTurnoverResponse } from '../../services/admin/tableService';
import { TableTurnoverCard } from './TableTurnoverCard';
import Select from '../../components/ui/Select';

export const StaffTableTurnover: React.FC = () => {
  const { user } = useAuth();
  const branchId = (user as any)?.branchId || (user as any)?.branch?.id;

  const [turnoverData, setTurnoverData] = useState<ITableTurnoverResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingTableId, setUpdatingTableId] = useState<string | null>(null);

  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const fetchTurnover = useCallback(async () => {
    if (!branchId) return;
    setIsLoading(true);
    try {
      const res = await tableService.getTableTurnover(branchId);
      const data = res?.data?.data || res?.data;
      setTurnoverData(data || null);
    } catch {
      setTurnoverData(null);
    } finally {
      setIsLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchTurnover();
  }, [fetchTurnover]);

  const handleUpdateStatus = async (tableId: string, status: string) => {
    setUpdatingTableId(tableId);
    try {
      await tableService.updateTableStatus(tableId, status);
      toast.success('Cập nhật trạng thái bàn thành công.');
      fetchTurnover();
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

  // Filter floors and tables
  const floors = turnoverData?.floors || [];
  const allTables = floors.flatMap((f) => f.tables);
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
            Theo dõi trạng thái phục vụ thời gian thực và dọn dẹp bàn sẵn sàng đón khách
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTurnover}
          disabled={isLoading}
          className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
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
          <span className="text-[11px] text-gray-400">Tổng {summary.total} bàn</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-xs text-blue-600 font-medium">Đang có khách</span>
          <p className="text-2xl font-extrabold text-blue-700">{summary.occupied}</p>
          <span className="text-[11px] text-gray-400">Bàn đang phục vụ</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-300 shadow-sm space-y-1 bg-amber-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-800 font-semibold">Cần dọn dẹp</span>
            {summary.dirty > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <p className="text-2xl font-extrabold text-amber-800">{summary.dirty}</p>
          <span className="text-[11px] text-amber-700 font-medium">Cần xử lý ngay</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-sm space-y-1 bg-emerald-50/50">
          <span className="text-xs text-emerald-700 font-medium">Sẵn sàng đón khách</span>
          <p className="text-2xl font-extrabold text-emerald-700">{summary.available}</p>
          <span className="text-[11px] text-emerald-600">Bàn trống sạch sẽ</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Floor filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-gray-500 font-medium mr-1">Tầng:</span>
          <button
            type="button"
            onClick={() => setSelectedFloor('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              selectedFloor === 'ALL'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          {floorNumbers.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSelectedFloor(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                selectedFloor === f
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tầng {f}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 font-medium">Trạng thái:</span>
          <Select
            size="sm"
            tone="light"
            className="min-w-[200px]"
            value={selectedStatus}
            onChange={setSelectedStatus}
            aria-label="Lọc trạng thái bàn"
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'DIRTY', label: `Cần dọn dẹp (${summary.dirty})` },
              { value: 'OCCUPIED', label: `Đang có khách (${summary.occupied})` },
              { value: 'AVAILABLE', label: `Sẵn sàng (${summary.available})` },
              { value: 'MAINTENANCE', label: `Bảo trì (${summary.maintenance})` },
            ]}
          />
        </div>
      </div>

      {/* Tables Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : displayedTables.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 text-xs text-gray-500">
          Không có bàn nào phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
  );
};

export default StaffTableTurnover;
