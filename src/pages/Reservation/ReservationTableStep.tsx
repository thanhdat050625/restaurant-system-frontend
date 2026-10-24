import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import TableMap from '../../components/table/TableMap';
import { ITable } from '../../types/admin/table.type';
import { tableService } from '../../services/admin/tableService';
import { socketService } from '../../services/socketService';
import { useAuth } from '../../features/auth/AuthContext';
import toast from 'react-hot-toast';

interface ReservationTableStepProps {
  branchId: string;
  branchName?: string;
  partySize: number;
  selectedTable: ITable | null;
  onSelectTable: (table: ITable | null) => void;
  onBack: () => void;
  onNext: () => void;
}

export const ReservationTableStep: React.FC<ReservationTableStepProps> = ({
  branchId,
  branchName,
  partySize,
  selectedTable,
  onSelectTable,
  onBack,
  onNext,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [tables, setTables] = useState<ITable[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Tải danh sách bàn khả dụng theo chi nhánh và số khách
  const fetchTables = useCallback(async () => {
    if (!branchId) return;

    try {
      setLoading(true);
      const res = await tableService.searchAvailableTables({
        branchId,
        partySize,
        includeLocked: true,
      });

      let list: ITable[] = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;

      setTables(list);

      // Nếu bàn đã chọn trước đó không còn trong danh sách khả dụng
      if (selectedTable && !list.some((t) => t.id === selectedTable.id)) {
        onSelectTable(null);
      }
    } catch (err) {
      console.error('Error fetching available tables:', err);
      toast.error('Lỗi khi tải danh sách bàn khả dụng');
    } finally {
      setLoading(false);
    }
  }, [branchId, partySize, selectedTable, onSelectTable]);

  useEffect(() => {
    fetchTables();
  }, [branchId, partySize]);

  // 2. Kết nối Socket.IO realtime nhận cập nhật giữ bàn
  useEffect(() => {
    if (!branchId) return;

    socketService.connect();
    socketService.joinBranch(branchId);

    const handleTableLocked = (lockInfo: { tableId: string; lockedBy: string; tableNumber?: string }) => {
      setTables((prev) =>
        prev.map((t) =>
          t.id === lockInfo.tableId
            ? {
                ...t,
                lockStatus: {
                  isLocked: true,
                  lockedByMe: user?.id ? lockInfo.lockedBy === user.id : false,
                  expiresIn: 600,
                },
              }
            : t
        )
      );

      if (user?.id && lockInfo.lockedBy === user.id) {
        const found = tables.find((t) => t.id === lockInfo.tableId);
        if (found) {
          onSelectTable(found);
        }
      }
    };

    const handleTableReleased = ({ tableId }: { tableId: string }) => {
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId
            ? {
                ...t,
                lockStatus: {
                  isLocked: false,
                  lockedByMe: false,
                  expiresIn: null,
                },
              }
            : t
        )
      );

      if (selectedTable?.id === tableId) {
        onSelectTable(null);
      }
    };

    const handleLockSuccess = (lockInfo: { tableId: string; tableNumber?: string }) => {
      const lockedTbl = tables.find((t) => t.id === lockInfo.tableId);
      if (lockedTbl) {
        onSelectTable(lockedTbl);
      }
      toast.success(`Đã giữ bàn ${lockInfo.tableNumber || ''} trong 10 phút!`);
    };

    const handleLockFailed = (err: { reason?: string }) => {
      toast.error(err.reason || 'Bàn này vừa được người khác giữ. Vui lòng chọn bàn khác.');
    };

    socketService.on('table:locked', handleTableLocked);
    socketService.on('table:released', handleTableReleased);
    socketService.on('table:lock_success', handleLockSuccess);
    socketService.on('table:lock_failed', handleLockFailed);

    return () => {
      socketService.off('table:locked', handleTableLocked);
      socketService.off('table:released', handleTableReleased);
      socketService.off('table:lock_success', handleLockSuccess);
      socketService.off('table:lock_failed', handleLockFailed);
      socketService.leaveBranch(branchId);
    };
  }, [branchId, user?.id, tables, selectedTable, onSelectTable]);

  // 3. Xử lý click chọn bàn trên TableMap
  const handleTableClick = (table: ITable) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thực hiện chọn và giữ bàn thời gian thực.');
      return;
    }

    if (selectedTable?.id === table.id) {
      socketService.releaseTable(branchId, table.id);
      onSelectTable(null);
      toast('Đã nhả bàn.', { icon: 'ℹ️' });
      return;
    }

    // Gửi event lock bàn qua Socket
    socketService.lockTable(branchId, table.id);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              Chọn vị trí bàn trực tiếp trên sơ đồ
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin size={13} className="text-primary shrink-0" />
              {branchName || 'Chi nhánh'} • Đang tìm bàn cho <strong>{partySize} khách</strong>
            </p>
          </div>

          {selectedTable ? (
            <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>
                Đang giữ bàn: <strong>{selectedTable.tableNumber}</strong> (Tầng {selectedTable.floor || 1} - {selectedTable.tableType?.capacity || 2} chỗ)
              </span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1.5">
              <AlertCircle size={14} className="text-amber-500" />
              <span>Chưa chọn bàn (Hệ thống có thể tự xếp bàn khi bạn đến)</span>
            </div>
          )}
        </div>
      </div>

      {/* Sơ đồ bàn TableMap */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
        <TableMap
          tables={tables}
          mode="customer"
          selectedTableId={selectedTable?.id || null}
          onSelectTable={handleTableClick}
          partySize={partySize}
          loading={loading}
        />
      </div>

      {/* Điều hướng Next / Back */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 py-3 border border-slate-300 dark:border-slate-600 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
        >
          <ChevronLeft size={16} /> Quay lại
        </button>

        <button
          type="button"
          onClick={onNext}
          className="w-2/3 py-3 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs sm:text-sm font-semibold rounded-xl transition-opacity flex items-center justify-center gap-1 shadow-sm"
        >
          <span>
            {selectedTable ? `Tiếp tục với bàn ${selectedTable.tableNumber}` : 'Tiếp tục (Nhà hàng tự xếp bàn)'}
          </span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
