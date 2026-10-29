import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import TableMap from '../../components/table/TableMap';
import { ITable } from '../../types/admin/table.type';
import { tableService } from '../../services/admin/tableService';
import { socketService, ITableSlot, ITableLockEvent } from '../../services/socketService';
import { useAuth } from '../../features/auth/AuthContext';
import toast from 'react-hot-toast';

interface ReservationTableStepProps {
  branchId: string;
  branchName?: string;
  date: string;
  time: string;
  partySize: number;
  selectedTable: ITable | null;
  holdExpiresAt: number | null;
  onTableHeld: (table: ITable, slot: ITableSlot, expiresAt: number) => void;
  onReleaseTable: (notifyServer?: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}

const formatCountdown = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const ReservationTableStep: React.FC<ReservationTableStepProps> = ({
  branchId,
  branchName,
  date,
  time,
  partySize,
  selectedTable,
  holdExpiresAt,
  onTableHeld,
  onReleaseTable,
  onBack,
  onNext,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [tables, setTables] = useState<ITable[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [now, setNow] = useState(Date.now());

  const tablesRef = useRef<ITable[]>([]);
  tablesRef.current = tables;

  // 1. Tải sơ đồ bàn theo đúng khung giờ khách chọn (bàn đã có đơn trùng giờ sẽ hiển thị "Đã được đặt")
  const fetchTables = useCallback(
    async (showLoading = false) => {
      if (!branchId || !date || !time) return;

      try {
        if (showLoading) setLoading(true);
        const res = await tableService.searchAvailableTables({
          branchId,
          partySize,
          date,
          time,
          includeLocked: true,
        });

        let list: ITable[] = [];
        if (Array.isArray(res)) list = res;
        else if (Array.isArray(res?.data)) list = res.data;

        setTables(list);
        setHasLoaded(true);
      } catch (err) {
        console.error('Error fetching available tables:', err);
        toast.error('Lỗi khi tải sơ đồ bàn');
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [branchId, partySize, date, time],
  );

  const fetchTablesRef = useRef(fetchTables);
  fetchTablesRef.current = fetchTables;

  useEffect(() => {
    fetchTables(true);
  }, [fetchTables]);

  // Bàn đang giữ đã bị người khác đặt (hoặc không còn phù hợp) -> bỏ chọn
  useEffect(() => {
    if (!selectedTable || !hasLoaded || loading) return;
    const current = tables.find((t) => t.id === selectedTable.id);
    if (!current || current.isReserved) {
      onReleaseTable(false);
      toast.error(`Bàn ${selectedTable.tableNumber} không còn trống trong khung giờ này. Vui lòng chọn bàn khác.`);
    }
  }, [tables, selectedTable, hasLoaded, loading, onReleaseTable]);

  // Đồng hồ đếm ngược thời gian giữ bàn
  useEffect(() => {
    if (!holdExpiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [holdExpiresAt]);

  // 2. Kết nối Socket.IO realtime: mọi thay đổi giữ/nhả/đặt bàn trong chi nhánh -> tải lại sơ đồ của khung giờ
  useEffect(() => {
    if (!branchId) return;

    // Truyền user id để tạo lại socket khi đăng nhập/đăng xuất (server xác thực lúc handshake)
    socketService.connect(user?.id ?? null);
    socketService.joinBranch(branchId);

    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleRefresh = (event?: ITableLockEvent) => {
      if (event?.date && event.date !== date) return;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => fetchTablesRef.current(), 300);
    };

    const handleLockSuccess = (lockInfo: ITableLockEvent) => {
      if (lockInfo.date !== date || lockInfo.time !== time) return;
      const lockedTable = tablesRef.current.find((t) => t.id === lockInfo.tableId);
      if (lockedTable) {
        const expiresAt = lockInfo.expiresAt ? Date.parse(lockInfo.expiresAt) : Date.now() + 10 * 60 * 1000;
        onTableHeld(lockedTable, { branchId, tableId: lockedTable.id, date, time }, expiresAt);
        toast.success(`Đã giữ bàn ${lockInfo.tableNumber || lockedTable.tableNumber} trong 10 phút!`);
      }
      scheduleRefresh();
    };

    const handleLockFailed = (err: { reason?: string }) => {
      toast.error(err.reason || 'Bàn này vừa được người khác giữ. Vui lòng chọn bàn khác.');
      scheduleRefresh();
    };

    socketService.on('table:locked', scheduleRefresh);
    socketService.on('table:released', scheduleRefresh);
    socketService.on('table:reserved', scheduleRefresh);
    socketService.on('table:lock_success', handleLockSuccess);
    socketService.on('table:lock_failed', handleLockFailed);

    return () => {
      clearTimeout(refreshTimer);
      socketService.off('table:locked', scheduleRefresh);
      socketService.off('table:released', scheduleRefresh);
      socketService.off('table:reserved', scheduleRefresh);
      socketService.off('table:lock_success', handleLockSuccess);
      socketService.off('table:lock_failed', handleLockFailed);
      socketService.leaveBranch(branchId);
    };
  }, [branchId, date, time, user?.id, onTableHeld]);

  // 3. Xử lý click chọn bàn trên TableMap
  const handleTableClick = (table: ITable) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để chọn và giữ bàn. Bạn vẫn có thể tiếp tục để nhà hàng tự xếp bàn.');
      return;
    }

    if (selectedTable?.id === table.id) {
      onReleaseTable();
      toast('Đã nhả bàn.', { icon: 'ℹ️' });
      return;
    }

    // Server tự nhả bàn cũ của bạn khi giữ bàn mới (mỗi khách chỉ giữ 1 bàn)
    socketService.lockTable({ branchId, tableId: table.id, date, time, guestCount: partySize });
  };

  const displayDate = date ? new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN') : '';

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
              {branchName || 'Chi nhánh'} • {time} ngày {displayDate} • <strong>{partySize} khách</strong>
            </p>
          </div>

          {selectedTable ? (
            <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>
                Đang giữ bàn: <strong>{selectedTable.tableNumber}</strong> (Tầng {selectedTable.floor || 1} -{' '}
                {selectedTable.tableType?.capacity || 2} chỗ)
                {holdExpiresAt && <> • còn {formatCountdown(holdExpiresAt - now)}</>}
              </span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1.5">
              <AlertCircle size={14} className="text-amber-500" />
              <span>Chưa chọn bàn (Nhà hàng sẽ tự xếp bàn phù hợp)</span>
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
