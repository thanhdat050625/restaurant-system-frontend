import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PageWrapper from '../../layouts/PageWrapper';
import { useAuth } from '../../features/auth/AuthContext';
import { branchService } from '../../services/admin/branchService';
import { reservationService } from '../../services/reservationService';
import { IBranch } from '../../types/admin/branch.type';
import { IReservation, IAvailableSlot, IPreOrderItem } from '../../types/reservation.type';
import { ReservationDateTimeStep } from './ReservationDateTimeStep';
import { ReservationTableStep } from './ReservationTableStep';
import { ReservationPreOrderStep } from './ReservationPreOrderStep';
import { ReservationContactStep } from './ReservationContactStep';
import { ReservationSuccessView } from './ReservationSuccessView';
import { useTableHold } from './useTableHold';

/** Ngày theo giờ máy khách dạng YYYY-MM-DD (toISOString() lệch ngày vì dùng UTC) */
const toLocalDateString = (d: Date) => {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

export const Reservation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const branchIdParam = searchParams.get('branchId') || '';

  const { user } = useAuth();

  const [branches, setBranches] = useState<IBranch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState(branchIdParam);
  const [step, setStep] = useState(1);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);

  const [availableSlots, setAvailableSlots] = useState<IAvailableSlot[]>([]);
  const [slotsMessage, setSlotsMessage] = useState('');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Bàn đang giữ gắn với đúng chi nhánh + ngày + giờ + số khách; đổi bất kỳ yếu tố nào sẽ nhả bàn
  const { heldTable: selectedTable, holdExpiresAt, holdTable, clearHold } = useTableHold(
    `${selectedBranchId}|${date}|${time}|${guests}`,
  );

  const [preOrders, setPreOrders] = useState<IPreOrderItem[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReservation, setCreatedReservation] = useState<IReservation | null>(null);

  // Tự động điền thông tin khách hàng nếu đã đăng nhập
  useEffect(() => {
    if (user) {
      if (user.fullName || (user as any).name) setName(user.fullName || (user as any).name);
      if (user.phone) setPhone(user.phone);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  // Tải danh sách chi nhánh hoạt động (chỉ 1 lần)
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await branchService.getBranches({ status: 'ACTIVE' });
        const data = res?.data?.data || res?.data || [];
        const items: IBranch[] = Array.isArray(data) ? data : data.items || [];
        setBranches(items);
        setSelectedBranchId((current) =>
          items.some((b) => b.id === current) ? current : items[0]?.id || '',
        );
      } catch {
        setBranches([]);
      }
    };
    fetchBranches();
  }, []);

  // Thực đơn gọi trước theo từng chi nhánh: đổi chi nhánh thì bỏ các món đã chọn
  useEffect(() => {
    setPreOrders([]);
  }, [selectedBranchId]);

  // Tạo danh sách 14 ngày tới
  const nextDates = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const val = toLocalDateString(d);
      const label = d.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: 'numeric',
        month: 'numeric',
      });
      return { value: val, label, isToday: i === 0 };
    });
  }, []);

  // Mặc định chọn ngày hôm nay
  useEffect(() => {
    if (!date && nextDates.length > 0) {
      setDate(nextDates[0].value);
    }
  }, [date, nextDates]);

  // Tải khung giờ trống khi thay đổi chi nhánh, ngày hoặc số khách
  useEffect(() => {
    if (!selectedBranchId || !date) return;
    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const res = await reservationService.getAvailableSlots({
          branchId: selectedBranchId,
          date,
          guestCount: guests,
        });
        const data = (res as any)?.data?.data || (res as any)?.data || res;
        const slots: IAvailableSlot[] = data?.slots || (Array.isArray(data) ? data : []);
        setAvailableSlots(slots);
        setSlotsMessage(data?.message || '');
        // Giữ giờ khách đã chọn nếu vẫn còn bàn, ngược lại chọn khung giờ trống sớm nhất
        setTime((current) => {
          if (slots.some((s) => s.time === current && s.isAvailable)) return current;
          return slots.find((s) => s.isAvailable)?.time || '';
        });
      } catch (err: any) {
        // Không tự bịa khung giờ dự phòng: giờ hiển thị phải đúng giờ mở cửa & tình trạng bàn thực tế
        setAvailableSlots([]);
        setTime('');
        const status = err?.response?.status ?? 500;
        const serverMsg = err?.response?.data?.message;
        setSlotsMessage(
          status < 500 && typeof serverMsg === 'string'
            ? serverMsg
            : 'Không tải được khung giờ phục vụ. Vui lòng thử lại sau.',
        );
      } finally {
        setIsLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedBranchId, date, guests]);

  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  const handleSubmit = async () => {
    if (!selectedBranchId || !date || !time || !name.trim() || !phone.trim()) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await reservationService.createReservation({
        branchId: selectedBranchId,
        reservationDate: date,
        reservationTime: time,
        guestCount: guests,
        tableId: selectedTable?.id || undefined,
        tableTypeId: selectedTable?.tableTypeId || undefined,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || undefined,
        specialNotes: specialNotes.trim() || undefined,
        preOrders: preOrders.map((p) => ({
          menuItemId: p.menuItemId,
          quantity: p.quantity,
          note: p.note,
        })),
      });

      const resData = res?.data?.data || res?.data;
      // Khóa giữ bàn đã được server chuyển thành đơn đặt bàn
      clearHold(false);
      setCreatedReservation(resData);
      toast.success('Đặt bàn thành công! Nhà hàng sẽ liên hệ xác nhận.');
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message;
      const msg = Array.isArray(rawMsg) ? rawMsg[0] : rawMsg || 'Đặt bàn thất bại. Vui lòng thử lại.';
      toast.error(msg);
      // Bàn không còn được giữ / đã bị đặt -> quay lại bước chọn bàn
      if (selectedTable && /giữ bàn|đã được đặt|chọn lại bàn/i.test(msg)) {
        clearHold(false);
        setStep(2);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCreatedReservation(null);
    setStep(1);
    setTime('');
    clearHold(false);
    setPreOrders([]);
    setSpecialNotes('');
  };

  if (createdReservation) {
    return <ReservationSuccessView reservation={createdReservation} onReset={handleReset} />;
  }

  const stepTitles = ['Thời gian & Khách', 'Chọn bàn trên sơ đồ', 'Gọi món trước', 'Xác nhận'];

  return (
    <PageWrapper>
      {/* Hero Banner */}
      <section className="relative pt-28 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80 overflow-hidden text-center text-white">
        <div className="relative max-w-4xl mx-auto px-4 space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-[family-name:var(--font-heading)]">
            Đặt Bàn Trực Tuyến & Sơ Đồ Bàn
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Xem trực tiếp sơ đồ vị trí bàn theo từng tầng, giữ bàn trong 10 phút và gọi món trước để sẵn sàng phục vụ.
          </p>
        </div>
      </section>

      {/* Step Indicator */}
      <section className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          {stepTitles.map((title, idx) => (
            <div key={idx} className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step > idx + 1
                    ? 'bg-emerald-500 text-white'
                    : step === idx + 1
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                }`}
              >
                {step > idx + 1 ? '✓' : idx + 1}
              </div>
              <span
                className={`text-xs font-medium hidden md:inline ${
                  step === idx + 1 ? 'text-primary font-bold' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {title}
              </span>
              {idx < stepTitles.length - 1 && (
                <div className="w-4 sm:w-10 h-0.5 bg-slate-200 dark:bg-slate-700 mx-1" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-10 bg-slate-50 dark:bg-slate-900 min-h-[60vh]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <ReservationDateTimeStep
                  branches={branches}
                  selectedBranchId={selectedBranchId}
                  onSelectBranch={setSelectedBranchId}
                  date={date}
                  onSelectDate={setDate}
                  nextDates={nextDates}
                  guests={guests}
                  onSelectGuests={setGuests}
                  time={time}
                  onSelectTime={setTime}
                  availableSlots={availableSlots}
                  slotsMessage={slotsMessage}
                  isLoadingSlots={isLoadingSlots}
                  onNext={() => setStep(2)}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <ReservationTableStep
                  branchId={selectedBranchId}
                  branchName={selectedBranch?.name}
                  date={date}
                  time={time}
                  partySize={guests}
                  selectedTable={selectedTable}
                  holdExpiresAt={holdExpiresAt}
                  onTableHeld={holdTable}
                  onReleaseTable={clearHold}
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <ReservationPreOrderStep
                  branchId={selectedBranchId}
                  preOrders={preOrders}
                  onUpdatePreOrders={setPreOrders}
                  onBack={() => setStep(2)}
                  onNext={() => setStep(4)}
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <ReservationContactStep
                  name={name}
                  setName={setName}
                  phone={phone}
                  setPhone={setPhone}
                  email={email}
                  setEmail={setEmail}
                  specialNotes={specialNotes}
                  setSpecialNotes={setSpecialNotes}
                  branchName={selectedBranch?.name}
                  date={date}
                  time={time}
                  guests={guests}
                  selectedTable={selectedTable}
                  preOrders={preOrders}
                  isSubmitting={isSubmitting}
                  onBack={() => setStep(3)}
                  onSubmit={handleSubmit}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Reservation;
