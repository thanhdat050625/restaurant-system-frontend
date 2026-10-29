import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, PlusCircle, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { reservationService } from '../../services/reservationService';
import { IReservation } from '../../types/reservation.type';
import { ReservationHistoryCard } from '../Reservation/ReservationHistoryCard';
import { ReservationQRModal } from '../Reservation/ReservationQRModal';
import ConfirmModal from '../../components/ui/ConfirmModal';

export const ProfileReservationsTab: React.FC = () => {
  const [timeline, setTimeline] = useState<'UPCOMING' | 'PAST'>('UPCOMING');
  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedQRReservation, setSelectedQRReservation] = useState<IReservation | null>(null);
  const [cancellingReservation, setCancellingReservation] = useState<IReservation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await reservationService.getMyReservations({ timeline });
      const data = res?.data?.data || res?.data;
      const items = Array.isArray(data) ? data : data?.items || [];
      setReservations(items);
    } catch {
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  }, [timeline]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleConfirmCancel = async () => {
    if (!cancellingReservation) return;
    setIsCancelling(true);
    try {
      await reservationService.cancelReservation(
        cancellingReservation.id,
        'Khách hàng tự hủy trên website.',
      );
      toast.success('Hủy đặt bàn thành công.');
      setCancellingReservation(null);
      fetchReservations();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể hủy đặt bàn. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <motion.div key="reservations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary dark:text-white">Lịch sử đặt bàn</h2>
          <p className="text-xs text-text-secondary dark:text-text-light mt-0.5">Theo dõi các lượt đặt bàn và món ăn đã gọi trước</p>
        </div>
        <Link
          to="/reservation"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm"
        >
          <PlusCircle size={16} />
          Đặt bàn mới
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-light-card dark:bg-dark-card p-1 max-w-xs mb-6 border border-light-border dark:border-dark-border">
        <button
          type="button"
          onClick={() => setTimeline('UPCOMING')}
          className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            timeline === 'UPCOMING'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary dark:text-text-light hover:text-text-primary dark:hover:text-white'
          }`}
        >
          Sắp tới
        </button>
        <button
          type="button"
          onClick={() => setTimeline('PAST')}
          className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            timeline === 'PAST'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary dark:text-text-light hover:text-text-primary dark:hover:text-white'
          }`}
        >
          Đã qua
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-text-light">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs">Đang tải lịch sử đặt bàn...</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-light-border dark:border-dark-border bg-light-card/50 dark:bg-dark-card/50">
          <Calendar size={40} className="text-text-light mx-auto mb-3" />
          <p className="font-semibold text-text-primary dark:text-white text-sm mb-1">
            {timeline === 'UPCOMING' ? 'Không có lượt đặt bàn sắp tới' : 'Không có lịch sử đặt bàn'}
          </p>
          <p className="text-xs text-text-light max-w-sm mx-auto mb-4">
            {timeline === 'UPCOMING'
              ? 'Bạn chưa có bàn nào đã đặt trước. Hãy đặt bàn ngay để nhà hàng chuẩn bị phục vụ chu đáo nhất!'
              : 'Các lượt đặt bàn đã hoàn tất hoặc đã hủy sẽ hiển thị tại đây.'}
          </p>
          {timeline === 'UPCOMING' && (
            <Link
              to="/reservation"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold rounded-xl transition-all"
            >
              <UtensilsCrossed size={16} /> Đặt bàn ngay
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => (
            <ReservationHistoryCard
              key={res.id}
              reservation={res}
              onOpenQR={setSelectedQRReservation}
              onOpenCancel={setCancellingReservation}
            />
          ))}
        </div>
      )}

      {/* QR Modal */}
      <ReservationQRModal
        reservation={selectedQRReservation}
        isOpen={Boolean(selectedQRReservation)}
        onClose={() => setSelectedQRReservation(null)}
      />

      {/* Confirm Cancel Modal */}
      <ConfirmModal
        isOpen={Boolean(cancellingReservation)}
        title="Xác nhận hủy đặt bàn"
        message={
          cancellingReservation
            ? `Bạn có chắc chắn muốn hủy lượt đặt bàn #${cancellingReservation.reservationCode} tại "${cancellingReservation.branch?.name || 'Chi nhánh'}" vào lúc ${cancellingReservation.reservationTime}? Thao tác này không thể hoàn tác.`
            : ''
        }
        confirmText="Hủy đặt bàn"
        cancelText="Giữ lại"
        type="danger"
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onClose={() => setCancellingReservation(null)}
      />
    </motion.div>
  );
};

