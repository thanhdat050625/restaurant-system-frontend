import React from 'react';
import { Building2, CalendarDays, Users, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { IBranch } from '../../types/admin/branch.type';
import { IAvailableSlot } from '../../types/reservation.type';

interface ReservationDateTimeStepProps {
  branches: IBranch[];
  selectedBranchId: string;
  onSelectBranch: (id: string) => void;
  date: string;
  onSelectDate: (d: string) => void;
  nextDates: { value: string; label: string; isToday: boolean }[];
  guests: number;
  onSelectGuests: (g: number) => void;
  time: string;
  onSelectTime: (t: string) => void;
  availableSlots: IAvailableSlot[];
  slotsMessage?: string;
  isLoadingSlots: boolean;
  onNext: () => void;
}

export const ReservationDateTimeStep: React.FC<ReservationDateTimeStepProps> = ({
  branches,
  selectedBranchId,
  onSelectBranch,
  date,
  onSelectDate,
  nextDates,
  guests,
  onSelectGuests,
  time,
  onSelectTime,
  availableSlots,
  slotsMessage,
  isLoadingSlots,
  onNext,
}) => {
  return (
    <div className="space-y-5">
      {/* Branch selection */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Building2 size={18} className="text-primary" /> Chọn chi nhánh
        </h3>
        <select
          value={selectedBranchId}
          onChange={(e) => onSelectBranch(e.target.value)}
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
              onClick={() => onSelectDate(d.value)}
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
            onClick={() => onSelectGuests(Math.max(1, guests - 1))}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold"
          >
            -
          </button>
          <span className="text-base font-bold text-slate-800 dark:text-slate-100 min-w-10 text-center">
            {guests} người
          </span>
          <button
            type="button"
            onClick={() => onSelectGuests(Math.min(30, guests + 1))}
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
            <span>{slotsMessage || 'Chi nhánh đóng cửa hoặc không còn khung giờ phục vụ vào ngày này.'}</span>
          </div>
        ) : !availableSlots.some((s) => s.isAvailable) ? (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={15} />
            <span>Đã kín bàn phù hợp cho {guests} khách trong ngày này. Vui lòng chọn ngày khác.</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {availableSlots.map((s) => (
              <button
                key={s.time}
                type="button"
                disabled={!s.isAvailable}
                onClick={() => onSelectTime(s.time)}
                className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all ${
                  !s.isAvailable
                    ? 'border-slate-200 dark:border-slate-700 text-slate-400 bg-slate-50 dark:bg-slate-800/40 opacity-40 cursor-not-allowed'
                    : time === s.time
                      ? 'border-primary bg-primary text-white font-bold shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary/50'
                }`}
              >
                {s.time}
                {!s.isAvailable && <span className="block text-[9px]">Hết bàn</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!selectedBranchId || !date || !time}
        className="w-full py-3.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl transition-opacity flex items-center justify-center gap-2 shadow-sm"
      >
        <span>Tiếp theo: Chọn bàn trên sơ đồ</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
