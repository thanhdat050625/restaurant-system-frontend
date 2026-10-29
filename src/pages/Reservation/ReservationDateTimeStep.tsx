import React, { useMemo } from 'react';
import { Building2, CalendarDays, Users, Clock, AlertCircle, Minus, Plus, Sunrise, Sun, Sunset, Moon, MapPin, Timer } from 'lucide-react';
import { IBranch } from '../../types/admin/branch.type';
import { IAvailableSlot } from '../../types/reservation.type';
import { ui, SectionTitle, StepActions } from './reservationUi';
import Select from '../../components/ui/Select';

interface ReservationDateTimeStepProps {
  branches: IBranch[];
  selectedBranchId: string;
  onSelectBranch: (id: string) => void;
  date: string;
  onSelectDate: (d: string) => void;
  nextDates: { value: string; label: string; isToday: boolean }[];
  guests: number;
  onSelectGuests: (g: number) => void;
  slotCount: number;
  onSelectSlotCount: (count: number) => void;
  slotDurationMinutes: number;
  endTime: string;
  openTime?: string;
  closeTime?: string;
  time: string;
  onSelectTime: (t: string) => void;
  availableSlots: IAvailableSlot[];
  slotsMessage?: string;
  isLoadingSlots: boolean;
  onNext: () => void;
}

const MAX_GUESTS = 30;
const QUICK_GUESTS = [2, 4, 6, 8, 10];

const formatDuration = (mins: number) => {
  const h = mins / 60;
  return Number.isInteger(h) ? `${h} giờ` : `${h.toFixed(1)} giờ`;
};

const DAY_PERIODS = [
  { label: 'Buổi sáng', icon: Sunrise, from: 0, to: 11 * 60 },
  { label: 'Buổi trưa', icon: Sun, from: 11 * 60, to: 14 * 60 },
  { label: 'Buổi chiều', icon: Sunset, from: 14 * 60, to: 17 * 60 },
  { label: 'Buổi tối', icon: Moon, from: 17 * 60, to: 24 * 60 },
];

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
};

export const ReservationDateTimeStep: React.FC<ReservationDateTimeStepProps> = ({
  branches,
  selectedBranchId,
  onSelectBranch,
  date,
  onSelectDate,
  nextDates,
  guests,
  onSelectGuests,
  slotCount,
  onSelectSlotCount,
  slotDurationMinutes,
  endTime,
  openTime,
  closeTime,
  time,
  onSelectTime,
  availableSlots,
  slotsMessage,
  isLoadingSlots,
  onNext,
}) => {
  const selectedBranch = branches.find((b) => b.id === selectedBranchId);
  const hasAvailable = availableSlots.some((s) => s.isAvailable);

  // Chia khung giờ theo buổi cho dễ chọn
  const slotGroups = useMemo(
    () =>
      DAY_PERIODS.map((p) => ({
        ...p,
        slots: availableSlots.filter((s) => toMinutes(s.time) >= p.from && toMinutes(s.time) < p.to),
      })).filter((g) => g.slots.length > 0),
    [availableSlots],
  );

  // Tính số slot tối đa theo khung giờ hoạt động của chi nhánh (tối đa lên đến 8 slot)
  const maxSlots = useMemo(() => {
    const oMins = openTime ? toMinutes(openTime) : 8 * 60;
    const cMins = closeTime ? toMinutes(closeTime) : 22 * 60;
    const totalOperatingMins = Math.max(cMins - oMins, slotDurationMinutes);
    const calculated = Math.floor(totalOperatingMins / (slotDurationMinutes || 60));
    return Math.min(8, Math.max(4, calculated));
  }, [openTime, closeTime, slotDurationMinutes]);

  const quickSlots = useMemo(() => {
    return [1, 2, 3, 4, 6].filter((s) => s <= maxSlots);
  }, [maxSlots]);

  return (
    <div className="space-y-5">
      {/* Chi nhánh */}
      <div className={`${ui.card} p-5 sm:p-6`}>
        <SectionTitle icon={Building2} title="Chi nhánh" description="Chọn nhà hàng bạn muốn đến" />
        <Select
          value={selectedBranchId}
          onChange={onSelectBranch}
          icon={Building2}
          placeholder="Chọn chi nhánh"
          aria-label="Chi nhánh"
          options={branches.map((b) => ({ value: b.id, label: b.name, description: b.streetAddress || undefined }))}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {selectedBranch?.streetAddress && (
            <span className={`flex items-center gap-1.5 ${ui.muted}`}>
              <MapPin size={13} className="text-primary shrink-0" />
              {selectedBranch.streetAddress}
            </span>
          )}
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-text-secondary dark:text-gray-300">
            <Clock size={12} className="text-primary shrink-0" />
            Giờ phục vụ: {openTime || selectedBranch?.openingTime || '08:00'} - {closeTime || selectedBranch?.closingTime || '22:00'}
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-medium">
            <Timer size={12} className="shrink-0" />
            1 slot = {slotDurationMinutes} phút
          </span>
        </div>
      </div>

      {/* Ngày + số khách + thời lượng slot */}
      <div className={`${ui.card} p-5 sm:p-6 space-y-6`}>
        <div>
          <SectionTitle icon={CalendarDays} title="Ngày dùng bữa" />
          <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {nextDates.map((d) => {
              const dt = new Date(`${d.value}T00:00:00`);
              const weekday = dt.toLocaleDateString('vi-VN', { weekday: 'short' });
              const isSelected = date === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => onSelectDate(d.value)}
                  className={`min-w-[68px] py-2.5 rounded-xl border text-center transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary text-white shadow-glow'
                      : 'border-light-border dark:border-dark-border text-text-secondary dark:text-gray-300 hover:border-primary/60 hover:text-primary'
                  }`}
                >
                  <span className={`block text-[11px] ${isSelected ? 'text-white/85' : ''}`}>
                    {d.isToday ? 'Hôm nay' : weekday}
                  </span>
                  <span className={`block text-xl font-bold leading-tight ${isSelected ? '' : ui.heading}`}>
                    {dt.getDate()}
                  </span>
                  <span className={`block text-[11px] ${isSelected ? 'text-white/85' : 'text-text-light'}`}>
                    Th{dt.getMonth() + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-5 border-t border-light-border dark:border-dark-border">
          <SectionTitle icon={Users} title="Số lượng khách" description={`Đặt trực tuyến tối đa ${MAX_GUESTS} khách`} />
          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
              <button
                type="button"
                aria-label="Giảm số khách"
                onClick={() => onSelectGuests(Math.max(1, guests - 1))}
                disabled={guests <= 1}
                className="w-11 h-11 flex items-center justify-center text-text-secondary dark:text-gray-300 hover:bg-light-card dark:hover:bg-dark-card disabled:opacity-40 cursor-pointer"
              >
                <Minus size={16} />
              </button>
              <span className={`w-16 text-center font-bold ${ui.heading}`}>{guests}</span>
              <button
                type="button"
                aria-label="Tăng số khách"
                onClick={() => onSelectGuests(Math.min(MAX_GUESTS, guests + 1))}
                disabled={guests >= MAX_GUESTS}
                className="w-11 h-11 flex items-center justify-center text-primary hover:bg-primary/10 disabled:opacity-40 cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_GUESTS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => onSelectGuests(g)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    guests === g
                      ? 'bg-primary/10 text-primary ring-1 ring-primary/40'
                      : 'bg-light-card dark:bg-dark-card text-text-secondary dark:text-gray-300 hover:text-primary'
                  }`}
                >
                  {g} người
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bộ chọn số lượng slot thời gian */}
        <div className="pt-5 border-t border-light-border dark:border-dark-border">
          <SectionTitle
            icon={Timer}
            title="Thời lượng dùng bữa"
            description={`Tiêu chuẩn 1 slot = ${slotDurationMinutes} phút (${formatDuration(slotDurationMinutes)}). Bạn có thể cộng thêm slot nếu dùng bữa lâu hơn (tiệc, gặp mặt...).`}
          />
          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
              <button
                type="button"
                aria-label="Giảm slot"
                onClick={() => onSelectSlotCount(Math.max(1, slotCount - 1))}
                disabled={slotCount <= 1}
                className="w-11 h-11 flex items-center justify-center text-text-secondary dark:text-gray-300 hover:bg-light-card dark:hover:bg-dark-card disabled:opacity-40 cursor-pointer"
              >
                <Minus size={16} />
              </button>
              <div className="w-24 text-center">
                <span className={`block font-bold leading-tight ${ui.heading}`}>
                  {slotCount} slot
                </span>
                <span className="text-[11px] text-text-light block">
                  {slotCount * slotDurationMinutes} phút
                </span>
              </div>
              <button
                type="button"
                aria-label="Tăng slot"
                onClick={() => onSelectSlotCount(Math.min(maxSlots, slotCount + 1))}
                disabled={slotCount >= maxSlots}
                className="w-11 h-11 flex items-center justify-center text-primary hover:bg-primary/10 disabled:opacity-40 cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickSlots.map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => onSelectSlotCount(cnt)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    slotCount === cnt
                      ? 'bg-primary/10 text-primary ring-1 ring-primary/40'
                      : 'bg-light-card dark:bg-dark-card text-text-secondary dark:text-gray-300 hover:text-primary'
                  }`}
                >
                  {cnt === 1 ? '1 slot (Tiêu chuẩn)' : `${cnt} slot (${cnt * slotDurationMinutes}p)`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Khung giờ */}
      <div className={`${ui.card} p-5 sm:p-6 space-y-4`}>
        <SectionTitle
          icon={Clock}
          title="Giờ đến"
          description={`Khung giờ còn bàn phù hợp cho ${guests} khách trong ${slotCount * slotDurationMinutes} phút (${slotCount} slot)`}
        />

        {/* Hiển thị thời gian đến và thời gian trả bàn */}
        {time && endTime && (
          <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between flex-wrap gap-2 text-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-text-secondary dark:text-gray-300">
                Giờ đến: <strong className={ui.heading}>{time}</strong>
              </span>
              <span className="text-primary font-bold">➔</span>
              <span className="text-text-secondary dark:text-gray-300">
                Giờ trả bàn dự kiến: <strong className="text-primary text-base font-bold">{endTime}</strong>
              </span>
            </div>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              Giữ bàn {slotCount * slotDurationMinutes} phút ({slotCount} slot)
            </span>
          </div>
        )}

        {isLoadingSlots ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-11 rounded-xl bg-light-card dark:bg-dark-card animate-pulse" />
            ))}
          </div>
        ) : availableSlots.length === 0 || !hasAvailable ? (
          <div className="p-4 rounded-xl bg-warning/10 text-amber-700 dark:text-amber-300 text-sm flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 mt-px" />
            <span>
              {availableSlots.length === 0
                ? slotsMessage || 'Chi nhánh đóng cửa hoặc không còn khung giờ phục vụ vào ngày này.'
                : `Đã kín bàn phù hợp cho ${guests} khách trong ${slotCount * slotDurationMinutes} phút. Vui lòng chọn ngày khác hoặc giảm số slot.`}
            </span>
          </div>
        ) : (
          <div className="space-y-5">
            {slotGroups.map((group) => (
              <div key={group.label}>
                <p className={`text-xs font-semibold mb-2.5 flex items-center gap-1.5 ${ui.muted}`}>
                  <group.icon size={14} className="text-primary" />
                  {group.label}
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {group.slots.map((s) => (
                    <button
                      key={s.time}
                      type="button"
                      disabled={!s.isAvailable}
                      onClick={() => onSelectTime(s.time)}
                      title={s.isAvailable ? `Còn ${s.remainingTables} bàn phù hợp` : 'Đã hết bàn phù hợp'}
                      className={`h-11 rounded-xl text-sm font-semibold border transition-all ${
                        !s.isAvailable
                          ? 'border-transparent bg-light-card dark:bg-dark-card text-text-light line-through cursor-not-allowed opacity-60'
                          : time === s.time
                            ? 'border-primary bg-primary text-white shadow-glow'
                            : 'border-light-border dark:border-dark-border text-text-primary dark:text-gray-200 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <StepActions
        onNext={onNext}
        nextDisabled={!selectedBranchId || !date || !time}
        nextLabel="Tiếp theo: Chọn bàn trên sơ đồ"
      />
    </div>
  );
};
