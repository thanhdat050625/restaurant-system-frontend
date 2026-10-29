import React, { useState, useEffect } from 'react';
import { Sparkles, Users, UserCheck, CheckCircle, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { ITable } from '../../types/admin/table.type';
import ConfirmModal from '../../components/ui/ConfirmModal';

interface TableTurnoverCardProps {
  table: ITable;
  onUpdateStatus: (tableId: string, status: string) => void;
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
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">
              Ghi chú: {table.note}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5">
          {table.status === 'DIRTY' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(table.id, 'AVAILABLE')}
              className={`w-full py-2 px-3 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50 ${
                isUrgent
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Sparkles size={14} />
              <span>Đã dọn sạch xong</span>
            </button>
          )}

          {table.status === 'OCCUPIED' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => setShowConfirmLeave(true)}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              <UserCheck size={14} />
              <span>Khách đã trả bàn</span>
            </button>
          )}

          {table.status === 'AVAILABLE' && (
            <div className="w-full flex items-center justify-between text-xs py-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle size={14} />
                <span>Sẵn sàng đón khách</span>
              </span>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onUpdateStatus(table.id, 'MAINTENANCE')}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline cursor-pointer"
                title="Tạm khóa bàn để bảo trì"
              >
                Khóa bàn
              </button>
            </div>
          )}

          {table.status === 'MAINTENANCE' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(table.id, 'AVAILABLE')}
              className="w-full py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle size={14} />
              <span>Mở lại bàn</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal xác nhận khách trả bàn để tránh bấm nhầm */}
      <ConfirmModal
        isOpen={showConfirmLeave}
        onClose={() => setShowConfirmLeave(false)}
        onConfirm={() => {
          setShowConfirmLeave(false);
          onUpdateStatus(table.id, 'DIRTY');
        }}
        title={`Xác nhận trả bàn ${table.tableNumber}?`}
        message={`Khách tại bàn ${table.tableNumber} đã hoàn tất dùng bữa và rời đi? Bàn sẽ được đưa vào hàng đợi "Cần dọn dẹp" để nhân viên tiến hành dọn bàn.`}
        confirmText="Xác nhận trả bàn"
        cancelText="Đóng"
        type="warning"
      />
    </>
  );
};
