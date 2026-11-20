import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ITable } from '../../types/admin/table.type';
import { socketService, ITableSlot } from '../../services/socketService';

interface TableHoldEntry {
  table: ITable;
  slot: ITableSlot;
  /** Khóa của lựa chọn (chi nhánh|ngày|giờ|số khách|thời lượng) tại thời điểm giữ bàn */
  selectionKey: string;
  expiresAt: number;
}

/**
 * Quản lý danh sách bàn đang giữ trong luồng đặt bàn (cho phép ghép nhiều bàn cùng khung giờ):
 * - Đổi chi nhánh / ngày / giờ / số khách => nhả toàn bộ bàn đang giữ.
 * - Hết thời gian giữ bàn => bỏ chọn và báo khách chọn lại.
 * - Rời trang đặt bàn => nhả bàn cho người khác (trừ khi clearHold(false) trước khi redirect thanh toán).
 */
export const useTableHold = (selectionKey: string) => {
  const [holds, setHolds] = useState<TableHoldEntry[]>([]);
  const holdsRef = useRef<TableHoldEntry[]>([]);
  holdsRef.current = holds;

  const clearHold = useCallback((notifyServer = true) => {
    const current = holdsRef.current;
    if (notifyServer) {
      for (const entry of current) {
        socketService.releaseTable(entry.slot);
      }
    }
    holdsRef.current = [];
    setHolds([]);
  }, []);

  const releaseSingleTable = useCallback((tableId: string, notifyServer = true) => {
    const current = holdsRef.current;
    const target = current.find((h) => h.table.id === tableId);
    if (target && notifyServer) {
      socketService.releaseTable(target.slot);
    }
    const next = current.filter((h) => h.table.id !== tableId);
    holdsRef.current = next;
    setHolds(next);
  }, []);

  const holdTable = useCallback(
    (table: ITable, slot: ITableSlot, expiresAt: number) => {
      setHolds((prev) => {
        const next = [
          ...prev.filter((h) => h.table.id !== table.id).map((h) => ({ ...h, expiresAt })),
          { table, slot, selectionKey, expiresAt },
        ];
        holdsRef.current = next;
        return next;
      });
    },
    [selectionKey],
  );

  useEffect(() => {
    if (holdsRef.current.length > 0 && holdsRef.current.some((h) => h.selectionKey !== selectionKey)) {
      clearHold();
      toast('Bạn đã đổi thời gian/số khách nên các bàn đang giữ đã được nhả.', { icon: 'ℹ️' });
    }
  }, [selectionKey, clearHold]);

  const holdExpiresAt = holds.length > 0 ? Math.max(...holds.map((h) => h.expiresAt)) : null;

  useEffect(() => {
    if (!holdExpiresAt) return;
    const remainingMs = holdExpiresAt - Date.now();
    const timer = setTimeout(() => {
      holdsRef.current = [];
      setHolds([]);
      toast.error('Đã hết thời gian giữ bàn. Vui lòng chọn lại bàn.');
    }, Math.max(0, remainingMs));
    return () => clearTimeout(timer);
  }, [holdExpiresAt]);

  useEffect(() => {
    return () => {
      for (const entry of holdsRef.current) {
        socketService.releaseTable(entry.slot);
      }
    };
  }, []);

  return {
    heldTables: holds.map((h) => h.table),
    holdExpiresAt,
    holdTable,
    releaseSingleTable,
    clearHold,
  };
};
