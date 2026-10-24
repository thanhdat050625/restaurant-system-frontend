import React from 'react';
import { ChevronLeft, CheckCircle2, Phone, Mail, User, FileText, UtensilsCrossed } from 'lucide-react';
import { IPreOrderItem } from '../../types/reservation.type';
import { formatPrice } from '../../utils/helpers';

interface ReservationContactStepProps {
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  specialNotes: string;
  setSpecialNotes: (v: string) => void;
  branchName?: string;
  date: string;
  time: string;
  guests: number;
  preOrders: IPreOrderItem[];
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export const ReservationContactStep: React.FC<ReservationContactStepProps> = ({
  name,
  setName,
  phone,
  setPhone,
  email,
  setEmail,
  specialNotes,
  setSpecialNotes,
  branchName,
  date,
  time,
  guests,
  preOrders,
  isSubmitting,
  onBack,
  onSubmit,
}) => {
  const totalAmount = preOrders.reduce((sum, p) => {
    const price = p.menuItem?.price || 0;
    return sum + price * p.quantity;
  }, 0);

  return (
    <div className="space-y-5">
      {/* Contact inputs card */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <User size={18} className="text-primary" /> Thông tin người đặt bàn
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Họ và tên *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Số điện thoại *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912 345 678"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <div className="text-xs">
          <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Email nhận xác nhận</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="text-xs">
          <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Ghi chú đặc biệt</label>
          <textarea
            rows={2}
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            placeholder="VD: Tổ chức sinh nhật, cần ghế trẻ em..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
        </div>
      </div>

      {/* Booking Summary Box */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Tóm tắt thông tin đặt chỗ</h3>
        <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-700/60">
          <div className="flex justify-between py-1.5">
            <span>Chi nhánh:</span>
            <strong className="text-slate-800 dark:text-slate-100">{branchName}</strong>
          </div>
          <div className="flex justify-between py-1.5">
            <span>Thời gian:</span>
            <strong className="text-slate-800 dark:text-slate-100">{date} vào lúc {time}</strong>
          </div>
          <div className="flex justify-between py-1.5">
            <span>Số lượng khách:</span>
            <strong className="text-slate-800 dark:text-slate-100">{guests} người</strong>
          </div>
          {preOrders.length > 0 && (
            <div className="py-2 space-y-1">
              <div className="flex justify-between font-semibold text-primary">
                <span>Món đặt trước ({preOrders.length} món):</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="pl-2 space-y-1 text-[11px] text-slate-500">
                {preOrders.map((p) => (
                  <div key={p.menuItemId} className="flex justify-between">
                    <span>{p.menuItem?.name} x {p.quantity}</span>
                    <span>{formatPrice((p.menuItem?.price || 0) * p.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-1/3 py-3 border border-slate-300 dark:border-slate-600 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
        >
          <ChevronLeft size={16} /> Quay lại
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !name.trim() || !phone.trim()}
          className="w-2/3 py-3 bg-gradient-to-r from-primary to-accent hover:opacity-95 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl transition-opacity flex items-center justify-center gap-1 shadow-sm"
        >
          {isSubmitting ? (
            <span>Đang ghi nhận đặt bàn...</span>
          ) : (
            <>
              <CheckCircle2 size={16} />
              <span>Xác nhận đặt bàn</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
