import React from 'react';
import {
  Utensils,
  Clock,
  Flame,
  CheckCircle2,
  XCircle,
  Sparkles,
  User,
  Receipt,
  CheckCheck,
} from 'lucide-react';
import { IDineInOrderItem, KitchenItemStatus } from '../../types/dine-in.type';
import { IKitchenDineInBatch } from '../../types/kitchen.type';

interface KitchenDineInBatchCardProps {
  batch: IKitchenDineInBatch;
  nowMs: number;
  updatingItemId: string | null;
  updatingBatchId: string | null;
  onUpdateItemStatus: (itemId: string, status: KitchenItemStatus) => void;
  onRequestCancelItem: (item: IDineInOrderItem, batchLabel: string) => void;
  onUpdateBatchStatus: (batchId: string, status: KitchenItemStatus) => void;
}

const statusMeta: Record<KitchenItemStatus, { label: string; badgeCls: string }> = {
  QUEUED: {
    label: 'Chờ làm',
    badgeCls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  },
  PREPARING: {
    label: 'Đang nấu',
    badgeCls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  READY: {
    label: 'Đã xong',
    badgeCls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  SERVED: {
    label: 'Đã ra bàn',
    badgeCls: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  },
  CANCELLED: {
    label: 'Đã hủy',
    badgeCls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800',
  },
};

export const KitchenDineInBatchCard: React.FC<KitchenDineInBatchCardProps> = ({
  batch,
  nowMs,
  updatingItemId,
  updatingBatchId,
  onUpdateItemStatus,
  onRequestCancelItem,
  onUpdateBatchStatus,
}) => {
  const createdMs = new Date(batch.createdAt).getTime();
  const waitMinutes = Math.max(0, Math.floor((nowMs - createdMs) / 60000));
  const isUrgent = waitMinutes >= 15;

  const hasQueued = batch.items.some((i) => i.status === 'QUEUED');
  const hasPreparing = batch.items.some((i) => i.status === 'PREPARING');
  const hasReady = batch.items.some((i) => i.status === 'READY');

  const isBatchBusy = updatingBatchId === batch.id;
  const batchLabel = `${batch.table.tableNumber} • Đợt #${batch.batchNumber}`;

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-slate-900 border-2 shadow-sm flex flex-col justify-between transition-all ${
        isUrgent && (hasQueued || hasPreparing)
          ? 'border-red-400 dark:border-red-700/80'
          : hasQueued
          ? 'border-primary/50 dark:border-primary/40'
          : 'border-gray-200 dark:border-slate-800'
      }`}
    >
      <div>
        {/* Card Header */}
        <div
          className={`px-4 py-3 rounded-t-xl border-b border-gray-100 dark:border-slate-800 flex items-start justify-between gap-2 ${
            isUrgent && (hasQueued || hasPreparing)
              ? 'bg-red-50/80 dark:bg-red-950/30'
              : 'bg-gray-50/80 dark:bg-slate-800/50'
          }`}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
                <Utensils size={10} />
                Tại bàn
              </span>
              <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                {batch.table.tableNumber}
              </span>
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                (Tầng {batch.table.floor})
              </span>
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-extrabold">
                Đợt #{batch.batchNumber}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <User size={11} />
                {batch.invoice.customerName}
              </span>
              <span className="inline-flex items-center gap-1 font-mono">
                <Receipt size={11} />
                {batch.invoice.invoiceCode}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-extrabold ${
                isUrgent && (hasQueued || hasPreparing)
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300'
              }`}
            >
              <Clock size={11} />
              <span>{waitMinutes}p</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {new Date(batch.createdAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>

        {/* Batch Note */}
        {batch.note && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 font-medium">
            Ghi chú chung: {batch.note}
          </div>
        )}

        {/* Item Rows */}
        <div className="p-4 space-y-2.5">
          {batch.items.map((item) => {
            const meta = statusMeta[item.status] || statusMeta.QUEUED;
            const isItemBusy = updatingItemId === item.id || isBatchBusy;
            const isCancelled = item.status === 'CANCELLED';

            return (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 space-y-2 ${
                  isCancelled ? 'opacity-55' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-primary shrink-0">
                        {item.quantity}x
                      </span>
                      <span
                        className={`text-sm font-bold text-gray-900 dark:text-white leading-snug ${
                          isCancelled ? 'line-through' : ''
                        }`}
                      >
                        {item.menuItem?.name}
                      </span>
                    </div>
                    {item.note && (
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                        Lưu ý: {item.note}
                      </p>
                    )}
                    {isCancelled && item.cancelledReason && (
                      <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">
                        Lý do: {item.cancelledReason}
                      </p>
                    )}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${meta.badgeCls}`}
                  >
                    {meta.label}
                  </span>
                </div>

                {/* Individual Action Controls */}
                {item.status !== 'SERVED' && item.status !== 'CANCELLED' && (
                  <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-gray-200/70 dark:border-slate-700/60">
                    {(item.status === 'QUEUED' || item.status === 'PREPARING') && (
                      <button
                        type="button"
                        disabled={isItemBusy}
                        onClick={() => onRequestCancelItem(item, batchLabel)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 inline-flex items-center gap-1 cursor-pointer disabled:opacity-40"
                      >
                        <XCircle size={12} />
                        <span>Hết/Hủy</span>
                      </button>
                    )}

                    {item.status === 'QUEUED' && (
                      <button
                        type="button"
                        disabled={isItemBusy}
                        onClick={() => onUpdateItemStatus(item.id, 'PREPARING')}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white inline-flex items-center gap-1 cursor-pointer disabled:opacity-40"
                      >
                        <Flame size={12} />
                        <span>Nấu</span>
                      </button>
                    )}

                    {item.status === 'PREPARING' && (
                      <button
                        type="button"
                        disabled={isItemBusy}
                        onClick={() => onUpdateItemStatus(item.id, 'READY')}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1 cursor-pointer disabled:opacity-40"
                      >
                        <Sparkles size={12} />
                        <span>Xong món</span>
                      </button>
                    )}

                    {item.status === 'READY' && (
                      <button
                        type="button"
                        disabled={isItemBusy}
                        onClick={() => onUpdateItemStatus(item.id, 'SERVED')}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-teal-600 hover:bg-teal-700 text-white inline-flex items-center gap-1 cursor-pointer disabled:opacity-40"
                      >
                        <CheckCircle2 size={12} />
                        <span>Đã ra bàn</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Batch Bulk Footer */}
      {(hasQueued || hasPreparing || hasReady) && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/30 rounded-b-xl flex flex-wrap items-center justify-end gap-2">
          {hasQueued && (
            <button
              type="button"
              disabled={isBatchBusy}
              onClick={() => onUpdateBatchStatus(batch.id, 'PREPARING')}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Flame size={14} />
              <span>{isBatchBusy ? 'Đang cập nhật...' : 'Nhận làm cả đợt'}</span>
            </button>
          )}
          {!hasQueued && hasPreparing && (
            <button
              type="button"
              disabled={isBatchBusy}
              onClick={() => onUpdateBatchStatus(batch.id, 'READY')}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Sparkles size={14} />
              <span>{isBatchBusy ? 'Đang cập nhật...' : 'Báo xong cả đợt'}</span>
            </button>
          )}
          {!hasQueued && !hasPreparing && hasReady && (
            <button
              type="button"
              disabled={isBatchBusy}
              onClick={() => onUpdateBatchStatus(batch.id, 'SERVED')}
              className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCheck size={14} />
              <span>{isBatchBusy ? 'Đang cập nhật...' : 'Xác nhận đã ra cả đợt'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
export default KitchenDineInBatchCard;

