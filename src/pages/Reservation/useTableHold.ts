import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ITable } from '../../types/admin/table.type';
import { socketService, ITableSlot } from '../../services/socketService';

interface TableHold {
  table: ITable;
  slot: ITableSlot;
  /** Khóa của lựa chọn (chi nhánh|ngày|giờ|số khách) tại thời điểm giữ bàn */
  selectionKey: string;
  expiresAt: number;
}

/**
 * Quản lý bàn đang giữ trong luồng đặt bàn:
 * - Đổi chi nhánh / ngày / giờ / số khách => bàn đang giữ không còn đúng, tự nhả bàn.
 * - Hết 10 phút giữ bàn => bỏ chọn và báo khách chọn lại.
 * - Rời trang đặt bàn => nhả bàn cho người khác.
 */
export const useTableHold = (selectionKey: string) => {
  const [hold, setHold] = useState<TableHold | null>(null);
  const holdRef = useRef<TableHold | null>(null);
  holdRef.current = hold;

  const clearHold = useCallback((notifyServer = true) => {
    const current = holdRef.current;
    if (current && notifyServer) {
      socketService.releaseTable(current.slot);
    }
    setHold(null);
  }, []);

  const holdTable = useCallback(
    (table: ITable, slot: ITableSlot, expiresAt: number) => {
      setHold({ table, slot, selectionKey, expiresAt });
    },
    [selectionKey],
  );

  useEffect(() => {
    if (holdRef.current && holdRef.current.selectionKey !== selectionKey) {
      clearHold();
      toast('Bạn đã đổi thời gian/số khách nên bàn đang giữ đã được nhả.', { icon: 'ℹ️' });
    }
  }, [selectionKey, clearHold]);

  useEffect(() => {
    if (!hold) return;
    const remainingMs = hold.expiresAt - Date.now();
    const timer = setTimeout(() => {
      setHold(null);
      toast.error('Đã hết thời gian giữ bàn. Vui lòng chọn lại bàn.');
    }, Math.max(0, remainingMs));
    return () => clearTimeout(timer);
  }, [hold]);

  useEffect(() => {
    return () => {
      if (holdRef.current) {
        socketService.releaseTable(holdRef.current.slot);
      }
    };
  }, []);

  return {
    heldTable: hold?.table ?? null,
    holdExpiresAt: hold?.expiresAt ?? null,
    holdTable,
    clearHold,
  };
};
