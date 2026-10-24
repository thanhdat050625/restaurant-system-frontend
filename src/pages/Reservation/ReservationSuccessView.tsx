import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Clock, Users, Building2, Phone, UtensilsCrossed, RotateCcw } from 'lucide-react';
import { IReservation } from '../../types/reservation.type';

interface ReservationSuccessViewProps {
  reservation: IReservation;
  onReset: () => void;
}

export const ReservationSuccessView: React.FC<ReservationSuccessViewProps> = ({
  reservation,
  onReset,
}) => {
  const formattedDate = new Date(reservation.reservationDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <section className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-lg w-full mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-600 dark:text-emerald-400"
        >
          <CheckCircle2 size={44} />
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-2 font-[family-name:var(--font-heading)]">
          Đặt Bàn Thành Công!
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
          Nhà hàng đã ghi nhận thông tin đặt chỗ của bạn.
        </p>

        {/* Reservation Card Details */}
        <div className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-left space-y-4 shadow-sm mb-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Mã đặt bàn</span>
            <span className="font-mono font-bold text-sm text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
              {reservation.reservationCode}
            </span>
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2.5">
              <Building2 size={16} className="text-primary shrink-0" />
              <span>Chi nhánh: <strong className="text-slate-800 dark:text-slate-100">{reservation.branch?.name || 'Chi nhánh FoodHub'}</strong></span>
            </div>

            <div className="flex items-center gap-2.5">
              <Calendar size={16} className="text-primary shrink-0" />
              <span>Ngày: <strong className="text-slate-800 dark:text-slate-100">{formattedDate}</strong></span>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock size={16} className="text-primary shrink-0" />
              <span>Khung giờ: <strong className="text-slate-800 dark:text-slate-100">{reservation.reservationTime}</strong> ({reservation.slotDurationMinutes || 90} phút)</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Users size={16} className="text-primary shrink-0" />
              <span>Số lượng khách: <strong className="text-slate-800 dark:text-slate-100">{reservation.guestCount} người</strong></span>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone size={16} className="text-primary shrink-0" />
              <span>Người liên hệ: <strong className="text-slate-800 dark:text-slate-100">{reservation.customerName}</strong> ({reservation.customerPhone})</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={15} />
            <span>Đặt bàn khác</span>
          </button>

          <Link
            to={reservation.branchId ? `/menu?branchId=${reservation.branchId}` : '/menu'}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-xs sm:text-sm font-semibold hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-sm"
          >
            <UtensilsCrossed size={15} />
            <span>Xem thực đơn món ăn</span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};
