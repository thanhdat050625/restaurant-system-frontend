import React from 'react';
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  User,
  UtensilsCrossed,
  FileText,
  MapPin,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import { IReservation, ReservationStatus } from '../../../types/reservation.type';
import { formatPrice } from '../../../utils/helpers';

interface ReservationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: IReservation | null;
  onAssignTable?: (reservation: IReservation) => void;
}

const statusBadgeMap: Record<
  ReservationStatus,
  { label: string; bg: string; text: string; icon: React.ComponentType<any> }
> = {
  PENDING: {
    label: 'Chờ duyệt',
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-800 dark:text-amber-300',
    icon: Clock3,
  },
  CONFIRMED: {
    label: 'Đã nhận chỗ',
    bg: 'bg-blue-100 dark:bg-blue-950/60',
    text: 'text-blue-800 dark:text-blue-300',
    icon: CheckCircle2,
  },
  SEATED: {
    label: 'Đang dùng bữa',
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    text: 'text-emerald-800 dark:text-emerald-300',
    icon: UtensilsCrossed,
  },
  COMPLETED: {
    label: 'Đã hoàn thành',
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Đã hủy đơn',
    bg: 'bg-red-100 dark:bg-red-950/60',
    text: 'text-red-800 dark:text-red-300',
    icon: XCircle,
  },
  NO_SHOW: {
    label: 'Khách không đến',
    bg: 'bg-purple-100 dark:bg-purple-950/60',
    text: 'text-purple-800 dark:text-purple-300',
    icon: AlertTriangle,
  },
};

export const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({
  isOpen,
  onClose,
  reservation,
  onAssignTable,
}) => {
  if (!reservation) return null;

  const statusInfo = statusBadgeMap[reservation.status] || {
    label: reservation.status,
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    icon: Clock3,
  };
  const StatusIcon = statusInfo.icon;

  const orders = reservation.orders || [];
  const totalPreOrderAmount = orders.reduce(
    (sum, o) => sum + Number(o.unitPrice || o.menuItem?.price || 0) * o.quantity,
    0,
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Chi tiết đặt bàn #${reservation.reservationCode}`}>
      <div className="space-y-5 text-sm">
        {/* Status & Timing Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusInfo.bg} ${statusInfo.text}`}
            >
              <StatusIcon size={14} />
              {statusInfo.label}
            </span>
            <span className="text-xs text-gray-400 font-mono">#{reservation.reservationCode}</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span className="flex items-center gap-1 text-primary">
              <Calendar size={14} />
              {reservation.reservationDate.split('T')[0]}
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <Clock size={14} />
              {reservation.reservationTime} ({reservation.slotDurationMinutes || 90}p)
            </span>
          </div>
        </div>

        {/* Customer Information */}
        <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Thông tin khách hàng</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <User size={15} className="text-gray-400 shrink-0" />
              <span className="font-semibold">{reservation.customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <Phone size={15} className="text-gray-400 shrink-0" />
              <a href={`tel:${reservation.customerPhone}`} className="text-primary hover:underline font-mono">
                {reservation.customerPhone}
              </a>
            </div>
            {reservation.customerEmail && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 sm:col-span-2">
                <Mail size={15} className="text-gray-400 shrink-0" />
                <span>{reservation.customerEmail}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <Users size={15} className="text-gray-400 shrink-0" />
              <span>
                Số khách: <strong>{reservation.guestCount} người</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Table Assignment Info */}
        <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Vị trí bàn phục vụ</h4>
            {reservation.status === 'CONFIRMED' && onAssignTable && (
              <button
                type="button"
                onClick={() => onAssignTable(reservation)}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                {reservation.table ? 'Đổi bàn khác' : 'Xếp bàn ngay'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
            <MapPin size={15} className="text-primary shrink-0" />
            {reservation.table ? (
              <span>
                Bàn <strong className="text-primary font-bold">{reservation.table.tableNumber}</strong> (Tầng{' '}
                {reservation.table.floor})
                {reservation.tableType && (
                  <span className="text-gray-400 ml-1">
                    - {reservation.tableType.name} ({reservation.tableType.capacity} chỗ)
                  </span>
                )}
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Chưa xếp bàn cụ thể{' '}
                {reservation.tableType ? `(Yêu cầu: ${reservation.tableType.name})` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Special Notes */}
        {reservation.specialNotes && (
          <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-xs">
            <div className="flex items-start gap-2 text-amber-800 dark:text-amber-300">
              <FileText size={15} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Ghi chú từ khách:</p>
                <p className="mt-0.5 italic">"{reservation.specialNotes}"</p>
              </div>
            </div>
          </div>
        )}

        {/* Cancelled Reason */}
        {reservation.cancelledReason && (
          <div className="p-3 bg-red-50/60 dark:bg-red-950/30 rounded-xl border border-red-200/60 dark:border-red-900/40 text-xs">
            <div className="flex items-start gap-2 text-red-800 dark:text-red-300">
              <XCircle size={15} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Lý do hủy:</p>
                <p className="mt-0.5">{reservation.cancelledReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pre-ordered Food Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <UtensilsCrossed size={14} className="text-primary" />
              Món ăn gọi trước ({orders.length} món)
            </h4>
            {orders.length > 0 && (
              <span className="text-xs font-bold text-primary font-mono">
                Tổng: {formatPrice(totalPreOrderAmount)}
              </span>
            )}
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-2 text-center bg-gray-50 dark:bg-slate-800/40 rounded-xl">
              Khách không đặt trước món ăn.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {orders.map((o) => {
                const itemPrice = Number(o.unitPrice || o.menuItem?.price || 0);
                const subtotal = itemPrice * o.quantity;
                return (
                  <div
                    key={o.id}
                    className="flex items-center justify-between gap-3 p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/60 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {o.menuItem?.imageUrl ? (
                        <img
                          src={o.menuItem.imageUrl}
                          alt={o.menuItem.name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-400 shrink-0">
                          <UtensilsCrossed size={16} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 dark:text-gray-100 truncate">
                          {o.menuItem?.name || 'Món ăn'}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {formatPrice(itemPrice)} × {o.quantity}
                        </p>
                        {o.note && <p className="text-[10px] text-amber-600 italic truncate">"{o.note}"</p>}
                      </div>
                    </div>
                    <span className="font-bold font-mono text-gray-800 dark:text-gray-200 shrink-0">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};
