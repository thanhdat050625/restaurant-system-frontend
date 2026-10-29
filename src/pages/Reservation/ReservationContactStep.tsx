import React from 'react';
import { CheckCircle2, UserRound, Phone, Mail, MessageSquareText } from 'lucide-react';
import { ui, SectionTitle, StepActions } from './reservationUi';

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

      <div className="lg:hidden">{summary}</div>

      <StepActions
        onBack={onBack}
        onNext={onSubmit}
        nextIcon={CheckCircle2}
        nextLabel={isSubmitting ? 'Đang ghi nhận đặt bàn...' : 'Xác nhận đặt bàn'}
        nextDisabled={!name.trim() || !phone.trim() || phoneInvalid}
        isLoading={isSubmitting}
      />
    </div>
  );
};
