import React from 'react';
import {
  CheckCircle2,
  UserRound,
  Phone,
  Mail,
  MessageSquareText,
  Wallet,
  Banknote,
} from 'lucide-react';
import { ui, SectionTitle, StepActions } from './reservationUi';
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
  /** Thẻ tóm tắt đơn, chỉ hiển thị ở màn hình nhỏ (màn hình lớn đã có ở cột phải) */
  summary: React.ReactNode;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
  paymentProvider: 'COD' | 'MOMO';
  setPaymentProvider: (provider: 'COD' | 'MOMO') => void;
  hasPreOrders: boolean;
  preOrdersTotal: number;
}

const PHONE_PATTERN = /^[0-9+]{9,15}$/;

const IconInput: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { icon: typeof Phone; label: string; required?: boolean }
> = ({ icon: Icon, label, required, ...inputProps }) => (
  <div>
    <label className={ui.label}>
      {label} {required && <span className="text-error">*</span>}
    </label>
    <div className="relative">
      <Icon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
      <input {...inputProps} className={`${ui.input} pl-10`} />
    </div>
  </div>
);

export const ReservationContactStep: React.FC<ReservationContactStepProps> = ({
  name,
  setName,
  phone,
  setPhone,
  email,
  setEmail,
  specialNotes,
  setSpecialNotes,
  summary,
  isSubmitting,
  onBack,
  onSubmit,
  paymentProvider,
  setPaymentProvider,
  hasPreOrders,
  preOrdersTotal,
}) => {
  const normalizedPhone = phone.replace(/[\s.-]/g, '');
  const phoneInvalid = phone.trim() !== '' && !PHONE_PATTERN.test(normalizedPhone);

  return (
    <div className="space-y-5">
      <div className={`${ui.card} p-5 sm:p-6`}>
        <SectionTitle
          icon={UserRound}
          title="Thông tin liên hệ"
          description="Nhà hàng sẽ dùng thông tin này để xác nhận đơn đặt bàn"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <IconInput
            icon={UserRound}
            label="Họ và tên"
            required
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nguyễn Văn A"
          />
          <div>
            <IconInput
              icon={Phone}
              label="Số điện thoại"
              required
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912 345 678"
            />
            {phoneInvalid && <p className="mt-1.5 text-xs text-error">Số điện thoại không hợp lệ.</p>}
          </div>
          <div className="sm:col-span-2">
            <IconInput
              icon={Mail}
              label="Email nhận xác nhận"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={ui.label}>Ghi chú cho nhà hàng</label>
            <div className="relative">
              <MessageSquareText size={17} className="absolute left-3.5 top-3.5 text-text-light" />
              <textarea
                rows={3}
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="VD: Tổ chức sinh nhật, cần ghế trẻ em..."
                className={`${ui.input} pl-10 resize-none`}
              />
            </div>
          </div>
        </div>
      </div>

      {hasPreOrders && (
        <div className={`${ui.card} p-5 sm:p-6`}>
          <fieldset className="border-0 p-0 m-0">
            <legend className="w-full mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-text-primary dark:text-white flex items-center gap-2">
                    <Wallet size={18} className="text-primary" />
                    Thanh toán tiền cọc món ăn
                  </h3>
                  <p className="text-xs text-text-secondary dark:text-text-light mt-0.5">
                    Đơn có chọn trước món. Bạn có thể cọc online ngay để đảm bảo chuẩn bị chu đáo.
                  </p>
                </div>
                <span className="text-sm font-extrabold text-primary font-mono bg-primary/10 px-3 py-1 rounded-xl">
                  {formatPrice(preOrdersTotal)}
                </span>
              </div>
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentProvider === 'COD'
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-light-border dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-dark-surface'
                }`}
              >
                <input
                  type="radio"
                  name="reservationPaymentMethod"
                  value="COD"
                  checked={paymentProvider === 'COD'}
                  onChange={() => setPaymentProvider('COD')}
                  className="sr-only"
                />
                <div className="flex items-center gap-2 mb-2">
                  <Banknote className="text-amber-500" size={20} />
                  <span className="font-bold text-xs text-text-primary dark:text-white">Tại nhà hàng</span>
                </div>
                <p className="text-[11px] text-text-secondary dark:text-text-light">
                  Thanh toán cọc hoặc toàn bộ khi đến dùng bữa tại quầy.
                </p>
              </label>

              <label
                className={`relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentProvider === 'MOMO'
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-light-border dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-dark-surface'
                }`}
              >
                <input
                  type="radio"
                  name="reservationPaymentMethod"
                  value="MOMO"
                  checked={paymentProvider === 'MOMO'}
                  onChange={() => setPaymentProvider('MOMO')}
                  className="sr-only"
                />
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-md bg-[#A50064] text-white flex items-center justify-center font-black text-[10px]">
                    M
                  </span>
                  <span className="font-bold text-xs text-text-primary dark:text-white">Ví MoMo</span>
                </div>
                <p className="text-[11px] text-text-secondary dark:text-text-light">
                  Thanh toán cọc tức thì qua Ví MoMo, Thẻ ATM nội địa hoặc Thẻ quốc tế.
                </p>
              </label>
            </div>
          </fieldset>
        </div>
      )}

      <div className="lg:hidden">{summary}</div>

      <StepActions
        onBack={onBack}
        onNext={onSubmit}
        nextIcon={CheckCircle2}
        nextLabel={
          isSubmitting
            ? 'Đang ghi nhận đặt bàn...'
            : hasPreOrders && paymentProvider !== 'COD'
              ? `Thanh toán cọc ${formatPrice(preOrdersTotal)}`
              : 'Xác nhận đặt bàn'
        }
        nextDisabled={!name.trim() || !phone.trim() || phoneInvalid}
        isLoading={isSubmitting}
      />
    </div>
  );
};
