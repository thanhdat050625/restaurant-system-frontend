import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle2, Info, LayoutGrid, Timer } from 'lucide-react';
import { ui, SectionTitle, StepActions } from './reservationUi';
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
  durationMinutes?: number;
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
  durationMinutes,
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

  return (
    <div className="space-y-5">
      <div className={`${ui.card} p-5 sm:p-6`}>
        <SectionTitle
          icon={LayoutGrid}
          title="Chọn vị trí bàn trên sơ đồ"
          description={`${branchName || 'Chi nhánh'} · ${time} · ${partySize} khách`}
        />

        {selectedTable ? (
          <div className="mb-5 px-4 py-3 rounded-xl bg-success/10 border border-success/30 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
            <CheckCircle2 size={18} className="text-success shrink-0" />
            <span className={ui.heading}>
              Đang giữ bàn <strong>{selectedTable.tableNumber}</strong>
              <span className={ui.muted}>
                {' '}
                · Tầng {selectedTable.floor || 1} · {selectedTable.tableType?.capacity || 2} chỗ
              </span>
            </span>
            {holdExpiresAt && (
              <span className="sm:ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-warning">
                <Timer size={14} /> còn {formatCountdown(holdExpiresAt - now)}
              </span>
            )}
          </div>
        ) : (
          <div className={`mb-5 px-4 py-3 rounded-xl bg-light-card dark:bg-dark-card text-xs flex items-start gap-2 ${ui.muted}`}>
            <Info size={15} className="text-primary shrink-0 mt-px" />
            <span>
              {isAuthenticated
                ? 'Bấm vào bàn màu xanh để giữ bàn trong 10 phút, hoặc bỏ qua để nhà hàng tự xếp bàn phù hợp.'
                : 'Đăng nhập để tự chọn vị trí bàn. Bạn vẫn có thể tiếp tục, nhà hàng sẽ tự xếp bàn phù hợp.'}
            </span>
          </div>
        )}

        <TableMap
          tables={tables}
          mode="customer"
          selectedTableId={selectedTable?.id || null}
          onSelectTable={handleTableClick}
          partySize={partySize}
          loading={loading}
        />
      </div>

      <StepActions
        onBack={onBack}
        onNext={onNext}
        nextLabel={selectedTable ? `Tiếp tục với bàn ${selectedTable.tableNumber}` : 'Tiếp tục, nhà hàng tự xếp bàn'}
      />
    </div>
  );
};
