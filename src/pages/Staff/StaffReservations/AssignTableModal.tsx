import React, { useState, useEffect } from 'react';
import { MapPin, Users, Check, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../../components/ui/Modal';
import { IReservation } from '../../../types/reservation.type';
import { tableService } from '../../../services/admin/tableService';
import { ITable } from '../../../types/admin/table.type';

interface AssignTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: IReservation | null;
  branchId: string;
  onConfirmAssign: (tableId: string) => Promise<void>;
}

const statusDisplay: Record<string, { label: string; badge: string; isSelectable: boolean }> = {
  AVAILABLE: {
    label: 'Sẵn sàng',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
    isSelectable: true,
  },
  OCCUPIED: {
    label: 'Có khách',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300',
    isSelectable: false,
  },
  DIRTY: {
    label: 'Cần dọn',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300',
    isSelectable: false,
  },
  MAINTENANCE: {
    label: 'Bảo trì',
    badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-300',
    isSelectable: false,
  },
};

export const AssignTableModal: React.FC<AssignTableModalProps> = ({
  isOpen,
  onClose,
  reservation,
  branchId,
  onConfirmAssign,
}) => {
  const [tables, setTables] = useState<ITable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !branchId) return;

    setSelectedTableId(reservation?.tableId || null);

    const loadTables = async () => {
      setIsLoading(true);
      try {
        const res: any = await tableService.getTableTurnover(branchId);
        const data = res?.data?.data || res?.data || res;
        const all: ITable[] = (data?.floors || []).flatMap((f: any) => f.tables);
        setTables(all);
      } catch {
        toast.error('Không thể tải sơ đồ bàn của chi nhánh.');
        setTables([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTables();
  }, [isOpen, branchId, reservation]);

  if (!reservation) return null;

  const floors = Array.from(new Set(tables.map((t) => t.floor))).sort((a, b) => a - b);
  const displayedTables = tables.filter((t) => (selectedFloor === 'ALL' ? true : t.floor === selectedFloor));

  const handleConfirm = async () => {
    if (!selectedTableId) {
      toast.error('Vui lòng chọn một bàn trống để xếp chỗ.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirmAssign(selectedTableId);
      onClose();
    } catch {
      // Error handled by caller
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xếp bàn cho khách">
      <div className="space-y-4 text-xs">
        {/* Reservation summary bar */}
        <div className="p-3 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-bold text-gray-800 dark:text-gray-100">
              Khách: {reservation.customerName} ({reservation.guestCount} người)
            </p>
            <p className="text-[11px] text-gray-500">
              Mã #{reservation.reservationCode} • Giờ hẹn: {reservation.reservationTime} • Ngày{' '}
              {reservation.reservationDate.split('T')[0]}
            </p>
          </div>
          {reservation.table && (
            <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg text-primary font-bold border border-primary/30">
              Bàn hiện tại: {reservation.table.tableNumber} (Tầng {reservation.table.floor})
            </span>
          )}
        </div>

        {/* Floor filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedFloor('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              selectedFloor === 'ALL'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            Tất cả các tầng
          </button>
          {floors.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSelectedFloor(f)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                selectedFloor === f
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              Tầng {f}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 pt-1">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Trống (Sẵn sàng)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Đang có khách
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Cần dọn
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Bảo trì
          </span>
        </div>

        {/* Tables grid */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
            <RefreshCw size={24} className="animate-spin text-primary" />
            <p>Đang tải danh sách bàn...</p>
          </div>
        ) : displayedTables.length === 0 ? (
          <div className="py-10 text-center text-gray-400">Không có bàn nào ở tầng này.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto custom-scrollbar p-1">
            {displayedTables.map((t) => {
              const statusCfg = statusDisplay[t.status] || {
                label: t.status,
                badge: 'bg-gray-100 text-gray-600',
                isSelectable: false,
              };
              const isSelected = selectedTableId === t.id;
              const isSuitableCapacity = (t.tableType?.capacity || 4) >= reservation.guestCount;
              const isSelectable = statusCfg.isSelectable || isSelected;

              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={!isSelectable}
                  onClick={() => setSelectedTableId(t.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30'
                      : isSelectable
                        ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-400'
                        : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/40 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-extrabold text-sm text-gray-800 dark:text-gray-100">
                      Bàn {t.tableNumber}
                    </span>
                    {isSelected && <Check size={16} className="text-primary font-bold" />}
                  </div>

                  <div className="flex items-center justify-between gap-1 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users size={12} className={isSuitableCapacity ? 'text-primary' : 'text-gray-400'} />
                      {t.tableType?.capacity || 4} chỗ
                    </span>
                    <span className="text-[10px]">Tầng {t.floor}</span>
                  </div>

                  <div className="pt-1 border-t border-gray-100 dark:border-slate-700">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${statusCfg.badge}`}
                    >
                      {statusCfg.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-3 border-t border-gray-200 dark:border-slate-700 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedTableId || isSubmitting}
            className="px-4 py-2 bg-primary hover:bg-primary-hover active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            <span>Xác nhận xếp bàn</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
