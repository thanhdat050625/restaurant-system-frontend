import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, CalendarDays, Clock, Users, Building2, Phone, UtensilsCrossed, RotateCcw, Armchair, History } from 'lucide-react';
import { IReservation } from '../../types/reservation.type';
import { ui } from './reservationUi';

interface ReservationSuccessViewProps {
  reservation: IReservation;
  onReset: () => void;
}

export const ReservationSuccessView: React.FC<ReservationSuccessViewProps> = ({ reservation, onReset }) => {
  const formattedDate = new Date(reservation.reservationDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const { table } = reservation;

  const details = [
    { icon: Building2, label: 'Chi nhánh', value: reservation.branch?.name || 'Chi nhánh FoodHub' },
    { icon: CalendarDays, label: 'Ngày', value: formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1) },
    {
      icon: Clock,
      label: 'Giờ đến',
      value: `${reservation.reservationTime} (khoảng ${reservation.slotDurationMinutes || 90} phút)`,
    },
    { icon: Users, label: 'Số khách', value: `${reservation.guestCount} người` },
    {
      icon: Armchair,
      label: 'Vị trí bàn',
      value: table ? `Bàn ${table.tableNumber} · Tầng ${table.floor}` : 'Nhà hàng tự xếp bàn',
    },
    { icon: Phone, label: 'Người liên hệ', value: `${reservation.customerName} · ${reservation.customerPhone}` },
  ];

  return (
    <section className="pt-32 pb-20 min-h-screen bg-light dark:bg-dark px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.15 }}
          className="w-20 h-20 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto mb-5 ring-8 ring-success/5"
        >
          <CheckCircle2 size={44} />
        </motion.div>

        <h1 className={`text-3xl font-bold font-[family-name:var(--font-heading)] mb-2 ${ui.heading}`}>
          Đặt bàn thành công!
        </h1>
        <p className={`text-sm mb-8 ${ui.muted}`}>
          Đơn của bạn đang chờ nhà hàng xác nhận. Vui lòng đưa mã đặt bàn cho nhân viên khi đến.
        </p>

        <div className={`${ui.card} overflow-hidden text-left mb-6`}>
          <div className="px-6 py-5 bg-gradient-to-r from-primary to-primary-dark text-white flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-white/80">Mã đặt bàn</p>
              <p className="font-mono text-xl font-bold tracking-wider">{reservation.reservationCode}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">Chờ xác nhận</span>
          </div>

          <dl className="px-6 py-2 divide-y divide-light-border dark:divide-dark-border">
            {details.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 py-3">
                <Icon size={17} className="text-primary shrink-0" />
                <dt className={`text-sm w-28 shrink-0 ${ui.muted}`}>{label}</dt>
                <dd className={`text-sm font-medium text-right flex-1 ${ui.heading}`}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onReset}
            className="py-3 px-4 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-surface text-sm font-semibold text-text-secondary dark:text-gray-200 hover:bg-light-card dark:hover:bg-dark-card transition-colors inline-flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            Đặt bàn khác
          </button>
          {reservation.userId ? (
            <Link
              to="/profile?tab=reservations"
              className="py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow-glow transition-colors inline-flex items-center justify-center gap-2"
            >
              <History size={16} />
              Xem lịch sử đặt bàn
            </Link>
          ) : (
            <Link
              to={reservation.branchId ? `/menu?branchId=${reservation.branchId}` : '/menu'}
              className="py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow-glow transition-colors inline-flex items-center justify-center gap-2"
            >
              <UtensilsCrossed size={16} />
              Xem thực đơn
            </Link>
          )}
        </div>
      </motion.div>
    </section>
  );
};
