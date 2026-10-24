import React from 'react';
import { Sparkles, Users, UserCheck, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { ITable } from '../../types/admin/table.type';

interface TableTurnoverCardProps {
  table: ITable;
  onUpdateStatus: (tableId: string, status: string) => void;
  isUpdating: boolean;
}

const statusMap: Record<string, { label: string; bg: string; text: string; border: string }> = {
  AVAILABLE: {
    label: 'Sẵn sàng đón khách',
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
  const currentStatus = statusMap[table.status] || {
    label: table.status,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };

  return (
    <div
      className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 bg-white dark:bg-slate-800 shadow-sm ${currentStatus.border}`}
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
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${currentStatus.bg} ${currentStatus.text}`}
          >
            {currentStatus.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Users size={14} className="text-primary" />
          <span>{table.tableType?.name || 'Bàn'} ({table.tableType?.capacity || 4} chỗ)</span>
        </div>

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
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
          >
            <Sparkles size={14} />
            <span>Đã dọn sạch xong</span>
          </button>
        )}

        {table.status === 'OCCUPIED' && (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onUpdateStatus(table.id, 'DIRTY')}
            className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
          >
            <UserCheck size={14} />
            <span>Khách đã trả bàn</span>
          </button>
        )}

        {table.status === 'AVAILABLE' && (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onUpdateStatus(table.id, 'OCCUPIED')}
            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
          >
            <Users size={14} />
            <span>Xếp khách vào bàn</span>
          </button>
        )}

        {table.status === 'MAINTENANCE' && (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onUpdateStatus(table.id, 'AVAILABLE')}
            className="w-full py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <CheckCircle size={14} />
            <span>Mở lại bàn</span>
          </button>
        )}
      </div>
    </div>
  );
};
