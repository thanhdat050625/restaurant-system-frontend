import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { ReservationStepper } from './ReservationStepper';
import { ReservationSummaryCard } from './ReservationSummaryCard';
import PageHero from '../../components/ui/PageHero';
import { CalendarCheck } from 'lucide-react';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920';
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
  const [slotCount, setSlotCount] = useState<number>(1);
  const [slotDurationMinutes, setSlotDurationMinutes] = useState<number>(90);
  const [openTime, setOpenTime] = useState<string>('');
  const [closeTime, setCloseTime] = useState<string>('');

  const totalDurationMinutes = slotCount * slotDurationMinutes;

  const endTime = useMemo(() => {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const endMinutes = h * 60 + (m || 0) + totalDurationMinutes;
    const endH = Math.floor(endMinutes / 60) % 24;
    const endM = endMinutes % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  }, [time, totalDurationMinutes]);

  const [availableSlots, setAvailableSlots] = useState<IAvailableSlot[]>([]);
  const [slotsMessage, setSlotsMessage] = useState('');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Bàn đang giữ gắn với đúng chi nhánh + ngày + giờ + số khách + thời lượng; đổi bất kỳ yếu tố nào sẽ nhả bàn
  const { heldTable: selectedTable, holdExpiresAt, holdTable, clearHold } = useTableHold(
    `${selectedBranchId}|${date}|${time}|${guests}|${totalDurationMinutes}`,
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

  // Khi đổi chi nhánh: đồng bộ cấu hình slotDurationMinutes, giờ mở/đóng cửa và reset slot
  useEffect(() => {
    const branch = branches.find((b) => b.id === selectedBranchId);
    if (branch?.slotDurationMinutes) {
      setSlotDurationMinutes(branch.slotDurationMinutes);
    }
    if (branch?.openingTime) setOpenTime(branch.openingTime);
    if (branch?.closingTime) setCloseTime(branch.closingTime);
    setSlotCount(1);
    setPreOrders([]);
  }, [selectedBranchId, branches]);

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

  // Tải khung giờ trống khi thay đổi chi nhánh, ngày, số khách hoặc thời lượng slot
  useEffect(() => {
    if (!selectedBranchId || !date) return;
    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const res = await reservationService.getAvailableSlots({
          branchId: selectedBranchId,
          date,
          guestCount: guests,
          durationMinutes: totalDurationMinutes,
        });
        const data = (res as any)?.data?.data || (res as any)?.data || res;
        const slots: IAvailableSlot[] = data?.slots || (Array.isArray(data) ? data : []);
        setAvailableSlots(slots);
        setSlotsMessage(data?.message || '');
        if (data?.slotDurationMinutes) {
          setSlotDurationMinutes(data.slotDurationMinutes);
        }
        if (data?.openTime) setOpenTime(data.openTime);
        if (data?.closeTime) setCloseTime(data.closeTime);

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
  }, [selectedBranchId, date, guests, totalDurationMinutes]);

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
        durationMinutes: totalDurationMinutes,
        guestCount: guests,
        tableId: selectedTable?.id || undefined,
        tableTypeId: selectedTable?.tableTypeId || undefined,
        customerName: name.trim(),
        customerPhone: phone.replace(/[\s.-]/g, ''),
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

  // Chuyển bước -> cuộn về đầu stepper (nút Tiếp theo nằm cuối trang)
  const stepperRef = useRef<HTMLDivElement>(null);
  const isFirstStepRender = useRef(true);
  useEffect(() => {
    if (isFirstStepRender.current) {
      isFirstStepRender.current = false;
      return;
    }
    stepperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  if (createdReservation) {
    return <ReservationSuccessView reservation={createdReservation} onReset={handleReset} />;
  }

  const summary = (
    <ReservationSummaryCard
      branch={selectedBranch}
      date={date}
      time={time}
      endTime={endTime}
      slotCount={slotCount}
      slotDurationMinutes={slotDurationMinutes}
      guests={guests}
      selectedTable={selectedTable}
      holdExpiresAt={holdExpiresAt}
      preOrders={preOrders}
    />
  );

  const stepMotion = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.25 },
  };

  return (
    <PageWrapper className="bg-light dark:bg-dark">
      <PageHero
        overlap
        image={HERO_IMAGE}
        eyebrow="Đặt bàn trực tuyến"
        eyebrowIcon={CalendarCheck}
        title={
          <>
            Đặt bàn tại <span className="gradient-text">FoodHub</span>
          </>
        }
        subtitle="Chọn giờ đến, giữ vị trí bàn yêu thích trên sơ đồ và gọi món trước để bữa ăn được chuẩn bị sẵn sàng."
      />

      <section className="relative -mt-16 sm:-mt-20 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div ref={stepperRef} className="scroll-mt-24">
            <ReservationStepper step={step} onStepClick={setStep} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
            <div className="min-w-0">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" {...stepMotion}>
                    <ReservationDateTimeStep
                      branches={branches}
                      selectedBranchId={selectedBranchId}
                      onSelectBranch={setSelectedBranchId}
                      date={date}
                      onSelectDate={setDate}
                      nextDates={nextDates}
                      guests={guests}
                      onSelectGuests={setGuests}
                      slotCount={slotCount}
                      onSelectSlotCount={setSlotCount}
                      slotDurationMinutes={slotDurationMinutes}
                      endTime={endTime}
                      openTime={openTime}
                      closeTime={closeTime}
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
                  <motion.div key="step2" {...stepMotion}>
                    <ReservationTableStep
                      branchId={selectedBranchId}
                      branchName={selectedBranch?.name}
                      date={date}
                      time={time}
                      durationMinutes={totalDurationMinutes}
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
                  <motion.div key="step3" {...stepMotion}>
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
                  <motion.div key="step4" {...stepMotion}>
                    <ReservationContactStep
                      name={name}
                      setName={setName}
                      phone={phone}
                      setPhone={setPhone}
                      email={email}
                      setEmail={setEmail}
                      specialNotes={specialNotes}
                      setSpecialNotes={setSpecialNotes}
                      summary={summary}
                      isSubmitting={isSubmitting}
                      onBack={() => setStep(3)}
                      onSubmit={handleSubmit}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <aside className="hidden lg:block sticky top-28">{summary}</aside>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Reservation;
