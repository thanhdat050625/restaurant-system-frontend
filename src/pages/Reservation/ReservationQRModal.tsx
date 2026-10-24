import React from 'react';
import { QrCode, Calendar, Clock, Building2, User } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { IReservation } from '../../types/reservation.type';

interface ReservationQRModalProps {
  reservation: IReservation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationQRModal: React.FC<ReservationQRModalProps> = ({
  reservation,
  isOpen,
  onClose,
}) => {
  if (!reservation) return null;

  const qrData =
    (reservation as any).qrCheckInPayload ||
    JSON.stringify({
      code: reservation.reservationCode,
      branchId: reservation.branchId,
      phone: reservation.customerPhone,
    });

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    qrData,
  )}&margin=10`;

  const dateStr = new Date(reservation.reservationDate).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mã QR Check-in Nhận Bàn"
      subtitle="Đưa mã này cho nhân viên phục vụ khi bạn đến nhà hàng"
      size="sm"
    >
      <div className="text-center space-y-4">
        {/* QR Code Container */}
        <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 dark:border-slate-700 inline-block shadow-sm">
          <img
            src={qrImageUrl}
            alt="Mã QR Đặt bàn"
            className="w-52 h-52 object-contain mx-auto"
          />
        </div>

        {/* Reservation Code Badge */}
        <div>
          <span className="text-xs text-slate-400 font-medium">Mã đặt bàn</span>
          <p className="font-mono font-extrabold text-lg text-primary tracking-wider">
            {reservation.reservationCode}
          </p>
        </div>

        {/* Details snippet */}
        <div className="bg-slate-50 dark:bg-slate-700/50 p-3.5 rounded-xl text-left text-xs space-y-2 text-slate-700 dark:text-slate-200">
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-primary shrink-0" />
            <span className="line-clamp-1">{reservation.branch?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-primary shrink-0" />
            <span>{dateStr} lúc {reservation.reservationTime} ({reservation.guestCount} khách)</span>
          </div>
          <div className="flex items-center gap-2">
            <User size={14} className="text-primary shrink-0" />
            <span>{reservation.customerName} - {reservation.customerPhone}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 transition-colors"
        >
          Đóng
        </button>
      </div>
    </Modal>
  );
};
