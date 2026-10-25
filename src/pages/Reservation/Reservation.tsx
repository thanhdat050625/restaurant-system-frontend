import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PageWrapper from '../../layouts/PageWrapper';
import { useAuth } from '../../features/auth/AuthContext';
import { branchService } from '../../services/admin/branchService';
import { reservationService } from '../../services/reservationService';
import { IBranch } from '../../types/admin/branch.type';
import { ITable } from '../../types/admin/table.type';
import { IReservation, IAvailableSlot, IPreOrderItem } from '../../types/reservation.type';
import { ReservationDateTimeStep } from './ReservationDateTimeStep';
import { ReservationTableStep } from './ReservationTableStep';
import { ReservationPreOrderStep } from './ReservationPreOrderStep';
import { ReservationContactStep } from './ReservationContactStep';
import { ReservationSuccessView } from './ReservationSuccessView';

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

  const [selectedTable, setSelectedTable] = useState<ITable | null>(null);

  const [availableSlots, setAvailableSlots] = useState<IAvailableSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

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

  // Tải danh sách chi nhánh hoạt động
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await branchService.getBranches({ status: 'ACTIVE' });
        const data = res?.data?.data || res?.data || [];
        const items = Array.isArray(data) ? data : data.items || [];
        setBranches(items);
        if (items.length > 0 && !selectedBranchId) {
          setSelectedBranchId(items[0].id);
        }
      } catch {
        setBranches([]);
      }
    };
    fetchBranches();
  }, [selectedBranchId]);

  // Tạo danh sách 14 ngày tới
  const nextDates = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const val = d.toISOString().split('T')[0];
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
        if (slots.length > 0) {
          const firstAvail = slots.find((s: IAvailableSlot) => s.isAvailable);
          setTime(firstAvail ? firstAvail.time : '');
        } else {
          setTime('');
        }
      } catch (err) {
        console.warn('Lỗi khi tải khung giờ từ BE, sử dụng khung giờ dự phòng:', err);
        const defaultSlots: IAvailableSlot[] = [
          '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
          '13:00', '13:30', '14:00', '17:00', '17:30', '18:00',
          '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
        ].map((t) => ({ time: t, isAvailable: true, remainingTables: 5 }));
        setAvailableSlots(defaultSlots);
        setTime(defaultSlots[0].time);
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
      setCreatedReservation(resData);
      toast.success('Đặt bàn thành công!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Đặt bàn thất bại. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCreatedReservation(null);
    setStep(1);
    setTime('');
    setSelectedTable(null);
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
                  partySize={guests}
                  selectedTable={selectedTable}
                  onSelectTable={setSelectedTable}
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
