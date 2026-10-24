import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Clock,
  Users,
  Building2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../../layouts/PageWrapper';
import { useAuth } from '../../features/auth/AuthContext';
import { branchService } from '../../services/admin/branchService';
import { reservationService } from '../../services/reservationService';
import { IBranch } from '../../types/admin/branch.type';
import { IReservation, IAvailableSlot } from '../../types/reservation.type';
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

  const [availableSlots, setAvailableSlots] = useState<IAvailableSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReservation, setCreatedReservation] = useState<IReservation | null>(null);

  // Auto fill user contact info if logged in
  useEffect(() => {
    if (user) {
      if (user.fullName) setName(user.fullName);
      if (user.phone) setPhone(user.phone);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  // Load branches
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

  // Generate 14 next dates
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

  // Set default date to today
  useEffect(() => {
    if (!date && nextDates.length > 0) {
      setDate(nextDates[0].value);
    }
  }, [date, nextDates]);

  // Fetch available slots when branch, date or guests change
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
        const data = res?.data?.data || res?.data;
        const slots = data?.slots || [];
        setAvailableSlots(slots);
        if (slots.length > 0) {
          const firstAvail = slots.find((s: IAvailableSlot) => s.isAvailable);
          setTime(firstAvail ? firstAvail.time : '');
        } else {
          setTime('');
        }
      } catch {
        setAvailableSlots([]);
        setTime('');
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
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || undefined,
        specialNotes: specialNotes.trim() || undefined,
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
    setSpecialNotes('');
  };

  if (createdReservation) {
    return <ReservationSuccessView reservation={createdReservation} onReset={handleReset} />;
  }

  return (
    <PageWrapper>
      {/* Hero Banner */}
      <section className="relative pt-28 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80 overflow-hidden text-center text-white">
        <div className="relative max-w-4xl mx-auto px-4 space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-[family-name:var(--font-heading)]">
            Đặt Bàn Trực Tuyến
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Giữ chỗ nhanh chóng, phục vụ tận tâm với không gian phù hợp cho mọi dịp gặp gỡ.
          </p>
        </div>
      </section>

      {/* Step Indicator */}
      <section className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          {['Chọn bàn & Thời gian', 'Thông tin liên hệ', 'Xác nhận'].map((title, idx) => (
            <div key={idx} className="flex items-center gap-2">
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
                className={`text-xs font-medium hidden sm:inline ${
                  step === idx + 1 ? 'text-primary font-bold' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {title}
              </span>
              {idx < 2 && <div className="w-8 sm:w-16 h-0.5 bg-slate-200 dark:bg-slate-700 mx-1" />}
            </div>
          ))}
        </div>
      </section>

      {/* Main Form Content */}
      <section className="py-10 bg-slate-50 dark:bg-slate-900 min-h-[60vh]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                {/* Branch selection */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Building2 size={18} className="text-primary" /> Chọn chi nhánh
                  </h3>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} - {b.streetAddress}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date selection */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <CalendarDays size={18} className="text-primary" /> Chọn ngày dùng bữa
                  </h3>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {nextDates.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setDate(d.value)}
                        className={`min-w-[85px] py-2.5 px-2 rounded-xl border text-center transition-all ${
                          date === d.value
                            ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary/50'
                        }`}
                      >
                        <div className="text-[11px] opacity-80">{d.label}</div>
                        {d.isToday && <span className="text-[9px] text-primary block font-medium">Hôm nay</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guests selection */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Users size={18} className="text-primary" /> Số lượng khách
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold"
                    >
                      -
                    </button>
                    <span className="text-base font-bold text-slate-800 dark:text-slate-100 min-w-10 text-center">
                      {guests} người
                    </span>
                    <button
                      type="button"
                      onClick={() => setGuests(Math.min(30, guests + 1))}
                      className="w-9 h-9 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Time slot selection */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Clock size={18} className="text-primary" /> Khung giờ phục vụ
                  </h3>
                  {isLoadingSlots ? (
                    <div className="text-center py-6 text-xs text-slate-400">Đang tải khung giờ...</div>
                  ) : availableSlots.length === 0 ? (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle size={15} />
                      <span>Chi nhánh đóng cửa hoặc không còn khung giờ phục vụ vào ngày này.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {availableSlots.map((s) => (
                        <button
                          key={s.time}
                          type="button"
                          disabled={!s.isAvailable}
                          onClick={() => setTime(s.time)}
                          className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all ${
                            !s.isAvailable
                              ? 'border-slate-200 dark:border-slate-700 text-slate-400 bg-slate-50 dark:bg-slate-800/40 opacity-40 cursor-not-allowed'
                              : time === s.time
                                ? 'border-primary bg-primary text-white font-bold shadow-sm'
                                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary/50'
                          }`}
                        >
                          {s.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!selectedBranchId || !date || !time}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl transition-opacity flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Tiếp theo: Điền thông tin</span>
                  <ChevronRight size={16} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Thông tin liên hệ</h3>
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
                      rows={3}
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="VD: Tổ chức sinh nhật, cần ghế trẻ em, bàn gần cửa sổ..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3 border border-slate-300 dark:border-slate-600 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
                  >
                    <ChevronLeft size={16} /> Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!name.trim() || !phone.trim()}
                    className="w-2/3 py-3 bg-gradient-to-r from-primary to-accent hover:opacity-95 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-opacity flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>Xem lại & Xác nhận</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Xác nhận thông tin đặt bàn</h3>
                  <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-700/60">
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Chi nhánh</span>
                      <strong className="text-slate-800 dark:text-slate-100">{selectedBranch?.name}</strong>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Ngày dùng bữa</span>
                      <strong className="text-slate-800 dark:text-slate-100">{date}</strong>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Giờ đặt</span>
                      <strong className="text-slate-800 dark:text-slate-100">{time}</strong>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Số lượng khách</span>
                      <strong className="text-slate-800 dark:text-slate-100">{guests} người</strong>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Họ tên & SĐT</span>
                      <strong className="text-slate-800 dark:text-slate-100">{name} - {phone}</strong>
                    </div>
                    {specialNotes && (
                      <div className="flex justify-between py-2">
                        <span className="text-slate-500">Ghi chú</span>
                        <span className="text-slate-800 dark:text-slate-200 italic">{specialNotes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={isSubmitting}
                    className="w-1/3 py-3 border border-slate-300 dark:border-slate-600 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
                  >
                    <ChevronLeft size={16} /> Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-2/3 py-3 bg-gradient-to-r from-primary to-accent hover:opacity-95 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-opacity flex items-center justify-center gap-1 shadow-sm"
                  >
                    {isSubmitting ? (
                      <span>Đang gửi yêu cầu...</span>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Xác nhận đặt bàn</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Reservation;
