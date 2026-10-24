import React from 'react';
import { Calendar, Clock, Users, Building2, Phone, QrCode, XCircle, UtensilsCrossed } from 'lucide-react';
import { IReservation, ReservationStatus } from '../../types/reservation.type';
import { formatPrice } from '../../utils/helpers';

interface ReservationHistoryCardProps {
  reservation: IReservation;
  onOpenQR: (res: IReservation) => void;
  onOpenCancel: (res: IReservation) => void;
}

const statusConfig: Record<ReservationStatus, { label: string; bg: string; text: string }> = {
  PENDING: { label: 'Chờ xác nhận', bg: 'bg-amber-100 dark:bg-amber-950/50', text: 'text-amber-800 dark:text-amber-300' },
  CONFIRMED: { label: 'Đã xác nhận', bg: 'bg-emerald-100 dark:bg-emerald-950/50', text: 'text-emerald-800 dark:text-emerald-300' },
  SEATED: { label: 'Đã nhận bàn', bg: 'bg-blue-100 dark:bg-blue-950/50', text: 'text-blue-800 dark:text-blue-300' },
  COMPLETED: { label: 'Hoàn tất', bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-700 dark:text-slate-300' },
  CANCELLED: { label: 'Đã hủy', bg: 'bg-rose-100 dark:bg-rose-950/50', text: 'text-rose-800 dark:text-rose-300' },
  NO_SHOW: { label: 'Không đến', bg: 'bg-slate-200 dark:bg-slate-800', text: 'text-slate-500' },
};

export const ReservationHistoryCard: React.FC<ReservationHistoryCardProps> = ({
  reservation,
  onOpenQR,
  onOpenCancel,
}) => {
  const status = statusConfig[reservation.status] || {
    label: reservation.status,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
  };

  const dateFormatted = new Date(reservation.reservationDate).toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const orders = reservation.orders || [];
  const totalFoodAmount = orders.reduce(
    (sum, o) => sum + Number(o.unitPrice) * o.quantity,
    0,
  );

  const canShowQR =
    reservation.status === 'PENDING' ||
    reservation.status === 'CONFIRMED' ||
    reservation.status === 'SEATED';

  const canCancel = (reservation as any).canCancel ?? (reservation.status === 'PENDING' || reservation.status === 'CONFIRMED');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
      {/* Top row: Code and Status */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
        <div>
          <span className="text-[11px] text-slate-400 font-medium block">Mã đặt bàn</span>
          <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-100">
            {reservation.reservationCode}
          </span>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>

      {/* Info details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <Building2 size={15} className="text-primary shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
            {reservation.branch?.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-primary shrink-0" />
          <span>{dateFormatted} lúc <strong>{reservation.reservationTime}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <Users size={15} className="text-primary shrink-0" />
          <span>{reservation.guestCount} khách ({reservation.slotDurationMinutes || 90} phút)</span>
        </div>

        <div className="flex items-center gap-2">
          <Phone size={15} className="text-primary shrink-0" />
          <span>{reservation.customerName} - {reservation.customerPhone}</span>
        </div>
      </div>

      {/* Pre-ordered Food Summary */}
      {orders.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 space-y-1.5 text-xs">
          <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
            <span className="flex items-center gap-1.5 text-primary">
              <UtensilsCrossed size={14} /> Món gọi trước ({orders.length} món)
            </span>
            <span>{formatPrice(totalFoodAmount)}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
            {orders.map((o) => `${o.menuItem?.name || 'Món'} x${o.quantity}`).join(', ')}
          </div>
        </div>
      )}

      {/* Cancelled reason */}
      {reservation.cancelledReason && (
        <div className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl">
          Lý do hủy: {reservation.cancelledReason}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
        {canCancel && (
          <button
            type="button"
            onClick={() => onOpenCancel(reservation)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1"
          >
            <XCircle size={14} />
            <span>Hủy đặt bàn</span>
          </button>
        )}

        {canShowQR && (
          <button
            type="button"
            onClick={() => onOpenQR(reservation)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-dark transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <QrCode size={14} />
            <span>Mã QR Check-in</span>
          </button>
        )}
      </div>
    </div>
  );
};
