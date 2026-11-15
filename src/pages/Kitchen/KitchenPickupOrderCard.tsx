import React from 'react';
import {
  ShoppingBag,
  Clock,
  Flame,
  PackageCheck,
  CheckCircle2,
  User,
  Phone,
  Calendar,
} from 'lucide-react';
import { IKitchenPickupOrder, KitchenPickupTransitionStatus } from '../../types/kitchen.type';

interface KitchenPickupOrderCardProps {
  order: IKitchenPickupOrder;
  updatingOrderId: string | null;
  onUpdateStatus: (pickupOrderId: string, nextStatus: KitchenPickupTransitionStatus) => void;
}

const pickupStatusBadge: Record<string, { label: string; cls: string }> = {
  CONFIRMED: {
    label: 'Chờ bếp làm',
    cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  PREPARING: {
    label: 'Đang chuẩn bị',
    cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  READY: {
    label: 'Đã xong - Chờ lấy',
    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
};

export const KitchenPickupOrderCard: React.FC<KitchenPickupOrderCardProps> = ({
  order,
  updatingOrderId,
  onUpdateStatus,
}) => {
  const isBusy = updatingOrderId === order.id;
  const badge = pickupStatusBadge[order.status] || {
    label: order.status,
    cls: 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 border-gray-200',
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-purple-200/80 dark:border-purple-800/50 shadow-sm flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="px-4 py-3 rounded-t-xl border-b border-gray-100 dark:border-slate-800 bg-purple-50/60 dark:bg-purple-950/20 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
                <ShoppingBag size={10} />
                Mang về
              </span>
              <span className="text-sm font-mono font-extrabold text-gray-900 dark:text-white">
                #{order.orderCode}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-gray-600 dark:text-gray-300 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 font-semibold">
                <User size={11} />
                {order.customerName}
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-gray-500 dark:text-gray-400">
                <Phone size={11} />
                {order.customerPhone}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0 space-y-1">
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.cls}`}
            >
              {badge.label}
            </span>
            <div className="flex items-center justify-end gap-1 text-xs font-extrabold text-purple-700 dark:text-purple-300">
              <Clock size={12} />
              <span>Hẹn {order.pickupTime}</span>
            </div>
            <div className="text-[10px] text-gray-400 inline-flex items-center gap-1">
              <Calendar size={10} />
              {new Date(order.pickupDate).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>

        {/* Special Notes */}
        {order.specialNotes && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 font-medium">
            Ghi chú khách: {order.specialNotes}
          </div>
        )}

        {/* Item List */}
        <div className="p-4 space-y-2">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40"
            >
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-black text-purple-600 dark:text-purple-400 shrink-0">
                  {item.quantity}x
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                  {item.menuItem?.name}
                </span>
              </div>
              {item.note && (
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                  Lưu ý: {item.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/30 rounded-b-xl">
        {order.status === 'CONFIRMED' && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onUpdateStatus(order.id, 'PREPARING')}
            className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Flame size={14} />
            <span>{isBusy ? 'Đang cập nhật...' : 'Bắt đầu làm món'}</span>
          </button>
        )}

        {order.status === 'PREPARING' && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onUpdateStatus(order.id, 'READY')}
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <PackageCheck size={14} />
            <span>{isBusy ? 'Đang cập nhật...' : 'Đã xong - Sẵn sàng giao'}</span>
          </button>
        )}

        {order.status === 'READY' && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
            className="w-full py-2 px-3 rounded-xl bg-gray-800 hover:bg-gray-900 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <CheckCircle2 size={14} />
            <span>{isBusy ? 'Đang cập nhật...' : 'Khách đã nhận - Hoàn tất'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
export default KitchenPickupOrderCard;

