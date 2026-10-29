import React from 'react';
import { IDailyOperatingHour } from '../../../types/admin/branch-operating-hours.type';
import { Clock, Sparkles } from 'lucide-react';
import Select from '../../../components/ui/Select';

const DAY_NAMES: Record<number, string> = {
  1: 'Thứ Hai',
  2: 'Thứ Ba',
  3: 'Thứ Tư',
  4: 'Thứ Năm',
  5: 'Thứ Sáu',
  6: 'Thứ Bảy',
  0: 'Chủ Nhật',
};

const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

interface OperatingHoursScheduleSectionProps {
  openingTime: string;
  closingTime: string;
  slotDurationMinutes: number;
  dailyHours: IDailyOperatingHour[];
  onOpeningTimeChange: (val: string) => void;
  onClosingTimeChange: (val: string) => void;
  onDefaultTimeBlur?: (field: 'openingTime' | 'closingTime', val: string) => void;
  onSlotDurationChange: (val: number) => void;
  onApplyToAllDays: () => void;
  onToggleDay: (dayOfWeek: number) => void;
  onChangeDayTime: (dayOfWeek: number, field: 'openTime' | 'closeTime', val: string) => void;
  onDayTimeBlur?: (dayOfWeek: number, field: 'openTime' | 'closeTime', val: string) => void;
}

export const OperatingHoursScheduleSection: React.FC<OperatingHoursScheduleSectionProps> = ({
  openingTime,
  closingTime,
  slotDurationMinutes,
  dailyHours,
  onOpeningTimeChange,
  onClosingTimeChange,
  onDefaultTimeBlur,
  onSlotDurationChange,
  onApplyToAllDays,
  onToggleDay,
  onChangeDayTime,
  onDayTimeBlur,
}) => {
  const sortedDailyHours = DISPLAY_ORDER.map(
    (day) =>
      dailyHours.find((d) => d.dayOfWeek === day) || {
        dayOfWeek: day,
        openTime: openingTime,
        closeTime: closingTime,
        isOpen: true,
      },
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3 pt-3 border-t border-gray-100">
        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
          <Clock size={16} className="text-primary" />
          <span>Khung Giờ Mặc Định & Thời Lượng Slot Dùng Bữa</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Giờ mở cửa mặc định
            </label>
            <input
              type="time"
              value={openingTime}
              onChange={(e) => onOpeningTimeChange(e.target.value)}
              onBlur={(e) => onDefaultTimeBlur?.('openingTime', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Giờ đóng cửa mặc định
            </label>
            <input
              type="time"
              value={closingTime}
              onChange={(e) => onClosingTimeChange(e.target.value)}
              onBlur={(e) => onDefaultTimeBlur?.('closingTime', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Thời lượng slot dùng bữa
            </label>
            <Select<number>
              size="sm"
              tone="light"
              value={slotDurationMinutes}
              onChange={onSlotDurationChange}
              aria-label="Thời lượng một lượt đặt bàn"
              options={[
                { value: 45, label: '45 phút' },
                { value: 60, label: '60 phút (1 giờ)' },
                { value: 90, label: '90 phút (1 giờ 30 phút)', description: 'Khuyến nghị' },
                { value: 120, label: '120 phút (2 giờ)' },
                { value: 150, label: '150 phút (2 giờ 30 phút)' },
                { value: 180, label: '180 phút (3 giờ)' },
              ]}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onApplyToAllDays}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Áp dụng giờ mặc định ({openingTime} - {closingTime}) cho cả tuần</span>
          </button>
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            Lịch Hoạt Động Chi Tiết 7 Ngày Trong Tuần
          </h4>
          <span className="text-xs text-gray-500">
            Hệ thống đặt bàn sẽ dựa vào lịch này để nhận khách
          </span>
        </div>

        <div className="overflow-hidden border border-gray-200 rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase border-b border-gray-200">
              <tr>
                <th className="p-3 font-bold">Ngày trong tuần</th>
                <th className="p-3 font-bold text-center">Trạng thái</th>
                <th className="p-3 font-bold">Giờ mở cửa</th>
                <th className="p-3 font-bold">Giờ đóng cửa</th>
                <th className="p-3 font-bold text-center">Khung giờ nhận khách</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedDailyHours.map((item) => {
                const isWeekend = item.dayOfWeek === 0 || item.dayOfWeek === 6;
                return (
                  <tr
                    key={item.dayOfWeek}
                    className={`hover:bg-gray-50/80 transition-colors ${
                      !item.isOpen ? 'bg-gray-50/50 text-gray-400' : ''
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isWeekend ? 'text-primary' : 'text-gray-900'}`}>
                          {DAY_NAMES[item.dayOfWeek]}
                        </span>
                        {isWeekend && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700">
                            Cuối tuần
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleDay(item.dayOfWeek)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          item.isOpen
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {item.isOpen ? 'Mở cửa' : 'Nghỉ đóng'}
                      </button>
                    </td>

                    <td className="p-3">
                      <input
                        type="time"
                        disabled={!item.isOpen}
                        value={item.openTime}
                        onChange={(e) => onChangeDayTime(item.dayOfWeek, 'openTime', e.target.value)}
                        onBlur={(e) => onDayTimeBlur?.(item.dayOfWeek, 'openTime', e.target.value)}
                        className={`px-2.5 py-1.5 rounded-lg border text-sm font-semibold outline-none transition-colors ${
                          item.isOpen
                            ? 'border-gray-300 bg-white text-gray-900 focus:border-primary'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      />
                    </td>

                    <td className="p-3">
                      <input
                        type="time"
                        disabled={!item.isOpen}
                        value={item.closeTime}
                        onChange={(e) => onChangeDayTime(item.dayOfWeek, 'closeTime', e.target.value)}
                        onBlur={(e) => onDayTimeBlur?.(item.dayOfWeek, 'closeTime', e.target.value)}
                        className={`px-2.5 py-1.5 rounded-lg border text-sm font-semibold outline-none transition-colors ${
                          item.isOpen
                            ? 'border-gray-300 bg-white text-gray-900 focus:border-primary'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      />
                    </td>

                    <td className="p-3 text-center">
                      {item.isOpen ? (
                        <span className="text-xs font-semibold text-gray-700">
                          {item.openTime} - {item.closeTime}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-gray-400 italic">
                          Tạm dừng phục vụ
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OperatingHoursScheduleSection;
