import React, { useState, useEffect } from 'react';
import { BrushCleaning, Users, UserCheck, CheckCircle, Clock, ShieldAlert, Lock, QrCode, Receipt } from 'lucide-react';
import { ITable } from '../../types/admin/table.type';
import ConfirmModal from '../../components/ui/ConfirmModal';

interface TableTurnoverCardProps {
  table: ITable;
  onUpdateStatus: (tableId: string, status: string) => void;
  onViewQr?: (table: ITable) => void;
  onViewInvoice?: (table: ITable) => void;
  isUpdating: boolean;
}

const statusMap: Record<string, { label: string; bg: string; text: string; border: string }> = {
  AVAILABLE: {
    label: 'Sẵn sàng',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800/60',
  },
  OCCUPIED: {
    label: 'Đang có khách',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800/60',
  },
  DIRTY: {
    label: 'Cần dọn dẹp',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-800 dark:text-amber-400',
    border: 'border-amber-300 dark:border-amber-700',
  },
  MAINTENANCE: {
    label: 'Bảo trì / Tạm khóa',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
  },
};

export const TableTurnoverCard: React.FC<TableTurnoverCardProps> = ({
  table,
  onUpdateStatus,
  onViewQr,
  onViewInvoice,
  isUpdating,
}) => {
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Timer đếm giây chạy liên tục khi bàn đang DIRTY
  useEffect(() => {
    if (table.status !== 'DIRTY' || !table.dirtySince) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [table.status, table.dirtySince]);

  const currentStatus = statusMap[table.status] || {
    label: table.status,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };

  // Tính số phút chờ dọn
  const elapsedSeconds = table.dirtySince
    ? Math.max(0, Math.floor((now - table.dirtySince) / 1000))
    : 0;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const elapsedRemainderSeconds = elapsedSeconds % 60;
  const timerText = `${String(elapsedMinutes).padStart(2, '0')}:${String(elapsedRemainderSeconds).padStart(2, '0')}`;

  const isUrgent = table.status === 'DIRTY' && elapsedMinutes >= 10;
  const isWarning = table.status === 'DIRTY' && elapsedMinutes >= 5 && elapsedMinutes < 10;

  return (
    <>
      <div
        className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 bg-white dark:bg-slate-800 shadow-sm ${
          isUrgent
            ? 'border-red-400 dark:border-red-600 shadow-red-100 ring-2 ring-red-300 animate-pulse'
            : currentStatus.border
        }`}
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-base sm:text-lg text-slate-800 dark:text-slate-100">
                {table.tableNumber}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Tầng {table.floor}</span>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isUrgent
                  ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                  : `${currentStatus.bg} ${currentStatus.text}`
              }`}
            >
              {isUrgent ? 'Cần dọn gấp!' : currentStatus.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Users size={14} className="text-primary" />
            <span>
              {table.tableType?.name || 'Bàn'} ({table.tableType?.capacity || 4} chỗ)
            </span>
          </div>

          {/* Timer đếm thời gian chờ dọn nếu bàn đang bẩn */}
          {table.status === 'DIRTY' && (
            <div
              className={`mt-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                isUrgent
                  ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200'
                  : isWarning
                    ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200'
                    : 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isUrgent ? (
                  <ShieldAlert size={14} className="text-red-600 animate-bounce" />
                ) : (
                  <Clock size={14} className={isWarning ? 'text-amber-600' : 'text-slate-400'} />
                )}
                <span>Chờ dọn:</span>
              </div>
              <span className="font-mono font-bold text-sm">{timerText}</span>
            </div>
          )}

          {/* Cảnh báo bàn đang giữ chỗ online */}
          {table.lockStatus?.isLocked && (
            <div className="mt-2 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold">
                <Lock size={13} className="text-amber-600 animate-pulse" />
                <span>Đã có khách giữ chỗ</span>
              </div>
              {table.lockStatus.expiresIn && (
                <span className="font-mono font-bold text-xs">
                  {Math.floor(table.lockStatus.expiresIn / 60)}p
                </span>
              )}
            </div>
          )}

          {/* Lượt khách đặt tiếp theo trong ngày */}
          {table.nextReservation && (
            <div className="mt-2 px-2.5 py-1 rounded-lg bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/60 text-[11px] text-orange-800 dark:text-orange-300 flex items-center gap-1.5">
              <Clock size={12} className="text-orange-600 shrink-0" />
              <span>
                Lượt tới: <strong>{table.nextReservation.reservationTime}</strong> ({table.nextReservation.guestCount}k)
              </span>
            </div>
          )}

          {table.note && (
            <p className="mt-1.5 text-[11px] text-slate-400 italic line-clamp-1">
              "{table.note}"
            </p>
          )}
        </div>

        {/* Nút hành động dọn dẹp hoặc chuyển trạng thái */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1.5">
          {(onViewQr || onViewInvoice) && table.status !== 'MAINTENANCE' && (
            <div className="grid grid-cols-2 gap-1.5">
              {onViewQr && (
                <button
                  type="button"
                  onClick={() => onViewQr(table)}
                  className="py-1.5 px-2 bg-orange-50 hover:bg-orange-100 text-primary dark:bg-orange-950/40 dark:hover:bg-orange-900/50 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Xem mã QR gọi món của bàn"
                >
                  <QrCode size={13} />
                  <span>QR Bàn</span>
                </button>
              )}
              {onViewInvoice && (
                <button
                  type="button"
                  onClick={() => onViewInvoice(table)}
                  className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:text-emerald-300 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Xem hóa đơn bàn ăn & thanh toán"
                >
                  <Receipt size={13} />
                  <span>Hóa đơn</span>
                </button>
              )}
            </div>
          )}

          {table.status === 'DIRTY' ? (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(table.id, 'AVAILABLE')}
              className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <BrushCleaning size={14} />
              <span>Đã dọn sạch</span>
            </button>
          ) : table.status === 'OCCUPIED' ? (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => setShowConfirmLeave(true)}
              className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 dark:text-blue-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <UserCheck size={14} />
              <span>Khách rời bàn</span>
            </button>
          ) : table.status === 'AVAILABLE' ? (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(table.id, 'OCCUPIED')}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <CheckCircle size={14} className="text-emerald-500" />
              <span>Xếp khách vào</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(table.id, 'AVAILABLE')}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Mở lại bàn
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmLeave}
        title="Xác nhận khách rời bàn"
        message={`Chuyển bàn ${table.tableNumber} sang trạng thái "Cần dọn dẹp"? Hệ thống sẽ tự động kích hoạt đồng hồ đếm thời gian chờ dọn.`}
        confirmText="Xác nhận"
        cancelText="Đóng"
        type="warning"
        onConfirm={() => {
          onUpdateStatus(table.id, 'DIRTY');
          setShowConfirmLeave(false);
        }}
        onClose={() => setShowConfirmLeave(false)}
      />
    </>
  );
};
