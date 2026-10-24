import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, AlertCircle, UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../../layouts/PageWrapper';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { reservationService } from '../../services/reservationService';
import { IReservation } from '../../types/reservation.type';
import { ReservationHistoryCard } from './ReservationHistoryCard';
import { ReservationQRModal } from './ReservationQRModal';

export const ReservationHistoryPage: React.FC = () => {
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
    <PageWrapper>
      {/* Hero Header */}
      <section className="pt-28 pb-12 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold font-[family-name:var(--font-heading)]">
            Lịch Sử Đặt Bàn Của Bạn
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Theo dõi trạng thái đặt bàn, mã check-in và thực đơn đã gọi trước
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-10 bg-slate-50 dark:bg-slate-900 min-h-[60vh]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Tabs */}
          <div className="flex rounded-2xl bg-slate-200/80 dark:bg-slate-800 p-1.5 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setTimeline('UPCOMING')}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                timeline === 'UPCOMING'
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sắp tới
            </button>
            <button
              type="button"
              onClick={() => setTimeline('PAST')}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                timeline === 'PAST'
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Lịch sử / Đã qua
            </button>
          </div>

          {/* List or Empty State */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-36 bg-white dark:bg-slate-800 rounded-2xl animate-pulse border border-slate-200 dark:border-slate-700"
                />
              ))}
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-3">
              <Calendar size={48} className="mx-auto text-slate-300 dark:text-slate-600" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {timeline === 'UPCOMING'
                  ? 'Bạn chưa có lịch đặt bàn nào sắp tới'
                  : 'Chưa có lịch sử đặt bàn nào'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Hãy chọn chi nhánh gần bạn nhất để đặt chỗ và trải nghiệm không gian ẩm thực tuyệt vời.
              </p>
              <Link
                to="/reservation"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold hover:opacity-95 shadow-sm transition-opacity"
              >
                <span>Đặt bàn ngay</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((r) => (
                <ReservationHistoryCard
                  key={r.id}
                  reservation={r}
                  onOpenQR={(res) => setSelectedQRReservation(res)}
                  onOpenCancel={(res) => setCancellingReservation(res)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* QR Check-in Modal */}
      <ReservationQRModal
        reservation={selectedQRReservation}
        isOpen={Boolean(selectedQRReservation)}
        onClose={() => setSelectedQRReservation(null)}
      />

      {/* Confirm Cancel Modal */}
      <ConfirmModal
        isOpen={Boolean(cancellingReservation)}
        onClose={() => setCancellingReservation(null)}
        onConfirm={handleConfirmCancel}
        title="Xác nhận hủy đặt bàn"
        message={`Bạn có chắc chắn muốn hủy đơn đặt bàn "${cancellingReservation?.reservationCode}" tại ${cancellingReservation?.branch?.name}?`}
        confirmText="Xác nhận hủy"
        cancelText="Giữ lại"
        type="danger"
        isLoading={isCancelling}
      />
    </PageWrapper>
  );
};

export default ReservationHistoryPage;
