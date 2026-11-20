import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle2, Info, LayoutGrid, Timer, X } from 'lucide-react';
import { ui, SectionTitle, StepActions } from './reservationUi';
import TableMap from '../../components/table/TableMap';
import { ITable } from '../../types/admin/table.type';
import { tableService } from '../../services/admin/tableService';
import { socketService, ITableSlot, ITableLockEvent } from '../../services/socketService';
import { useAuth } from '../../features/auth/AuthContext';
import toast from 'react-hot-toast';

const MAX_SELECTED_TABLES = 5;

interface ReservationTableStepProps {
  branchId: string;
  branchName?: string;
  date: string;
  time: string;
  durationMinutes?: number;
  partySize: number;
  selectedTables: ITable[];
  holdExpiresAt: number | null;
  onTableHeld: (table: ITable, slot: ITableSlot, expiresAt: number) => void;
  onReleaseSingleTable: (tableId: string, notifyServer?: boolean) => void;
  onReleaseAllTables: (notifyServer?: boolean) => void;
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
  durationMinutes,
  partySize,
  selectedTables,
  holdExpiresAt,
  onTableHeld,
  onReleaseSingleTable,
  onReleaseAllTables,
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

  // 1. Tải sơ đồ bàn theo đúng khung giờ khách chọn
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
          durationMinutes,
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
    [branchId, partySize, date, time, durationMinutes],
  );

  const fetchTablesRef = useRef(fetchTables);
  fetchTablesRef.current = fetchTables;

  useEffect(() => {
    fetchTables(true);
  }, [fetchTables]);

  // Kiểm tra các bàn đang giữ có bị đặt mất không -> bỏ khỏi danh sách giữ
  useEffect(() => {
    if (selectedTables.length === 0 || !hasLoaded || loading) return;
    for (const held of selectedTables) {
      const current = tables.find((t) => t.id === held.id);
      if (!current || current.isReserved) {
        onReleaseSingleTable(held.id, false);
        toast.error(`Bàn ${held.tableNumber} không còn trống trong khung giờ này. Vui lòng chọn bàn khác.`);
      }
    }
  }, [tables, selectedTables, hasLoaded, loading, onReleaseSingleTable]);

  // Đồng hồ đếm ngược thời gian giữ bàn
  useEffect(() => {
    if (!holdExpiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [holdExpiresAt]);

  // 2. Kết nối Socket.IO realtime
  useEffect(() => {
    if (!branchId) return;

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
    socketService.on('table:status_changed', scheduleRefresh);
    socketService.on('table:lock_success', handleLockSuccess);
    socketService.on('table:lock_failed', handleLockFailed);

    return () => {
      clearTimeout(refreshTimer);
      socketService.off('table:locked', scheduleRefresh);
      socketService.off('table:released', scheduleRefresh);
      socketService.off('table:reserved', scheduleRefresh);
      socketService.off('table:status_changed', scheduleRefresh);
      socketService.off('table:lock_success', handleLockSuccess);
      socketService.off('table:lock_failed', handleLockFailed);
      socketService.leaveBranch(branchId);
    };
  }, [branchId, date, time, user?.id, onTableHeld]);

  // 3. Xử lý click chọn hoặc bỏ chọn từng bàn trên TableMap
  const handleTableClick = (table: ITable) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để chọn và giữ bàn. Bạn vẫn có thể tiếp tục để nhà hàng tự xếp bàn.');
      return;
    }

    if (selectedTables.some((t) => t.id === table.id)) {
      onReleaseSingleTable(table.id, true);
      toast(`Đã nhả bàn ${table.tableNumber}.`, { icon: 'ℹ️' });
      return;
    }

    if (selectedTables.length >= MAX_SELECTED_TABLES) {
      toast.error(`Bạn chỉ có thể chọn tối đa ${MAX_SELECTED_TABLES} bàn cùng lúc.`);
      return;
    }

    socketService.lockTable({ branchId, tableId: table.id, date, time, guestCount: partySize });
  };

  const totalSelectedSeats = selectedTables.reduce((sum, t) => sum + (t.tableType?.capacity || 2), 0);
  const isCapacityShort = selectedTables.length > 0 && totalSelectedSeats < partySize;

  return (
    <div className="space-y-5">
      <div className={`${ui.card} p-5 sm:p-6`}>
        <SectionTitle
          icon={LayoutGrid}
          title="Chọn vị trí bàn trên sơ đồ"
          description={`${branchName || 'Chi nhánh'} · ${time} · ${partySize} khách`}
        />

        {selectedTables.length > 0 ? (
          <div className="mb-5 p-4 rounded-xl bg-success/10 border border-success/30 text-sm space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-success shrink-0" />
                <span className={`font-medium ${ui.heading}`}>
                  Đang giữ {selectedTables.length}/{MAX_SELECTED_TABLES} bàn · Tổng{' '}
                  <strong className={isCapacityShort ? 'text-warning' : 'text-success'}>
                    {totalSelectedSeats}/{partySize} chỗ
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                {holdExpiresAt && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning">
                    <Timer size={14} /> còn {formatCountdown(holdExpiresAt - now)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onReleaseAllTables(true)}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Xóa hết
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedTables.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-dark-surface border border-success/40 text-xs font-semibold"
                >
                  <span>
                    Bàn {t.tableNumber} ({t.tableType?.capacity || 2} chỗ · T{t.floor || 1})
                  </span>
                  <button
                    type="button"
                    onClick={() => onReleaseSingleTable(t.id, true)}
                    className="text-text-light hover:text-rose-500 cursor-pointer"
                    title={`Bỏ chọn bàn ${t.tableNumber}`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>

            {isCapacityShort && (
              <p className="text-xs text-warning font-medium">
                Sức chứa các bàn đã chọn còn thiếu {partySize - totalSelectedSeats} chỗ — hãy chọn thêm bàn hoặc bấm
                &quot;Xóa hết&quot; để nhà hàng tự xếp bàn.
              </p>
            )}
          </div>
        ) : (
          <div className={`mb-5 px-4 py-3 rounded-xl bg-light-card dark:bg-dark-card text-xs flex items-start gap-2 ${ui.muted}`}>
            <Info size={15} className="text-primary shrink-0 mt-px" />
            <span>
              {isAuthenticated
                ? `Bấm vào các bàn màu xanh để chọn (có thể ghép tối đa ${MAX_SELECTED_TABLES} bàn, giữ trong 10 phút), hoặc bỏ qua để nhà hàng tự xếp bàn phù hợp.`
                : 'Đăng nhập để tự chọn vị trí bàn. Bạn vẫn có thể tiếp tục, nhà hàng sẽ tự xếp bàn phù hợp.'}
            </span>
          </div>
        )}

        <TableMap
          tables={tables}
          mode="customer"
          selectedTableId={selectedTables[0]?.id || null}
          selectedTableIds={selectedTables.map((t) => t.id)}
          onSelectTable={handleTableClick}
          partySize={partySize}
          loading={loading}
        />
      </div>

      <StepActions
        onBack={onBack}
        onNext={onNext}
        nextDisabled={isCapacityShort}
        nextLabel={
          selectedTables.length > 0
            ? `Tiếp tục với ${selectedTables.length} bàn (${totalSelectedSeats} chỗ)`
            : 'Tiếp tục, nhà hàng tự xếp bàn'
        }
      />
    </div>
  );
};
