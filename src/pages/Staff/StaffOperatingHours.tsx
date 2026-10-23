import React, { useState, useEffect } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { branchService } from '../../services/admin/branchService';
import {
  IDailyOperatingHour,
  IBranchCapacityStats,
} from '../../types/admin/branch-operating-hours.type';
import BranchCapacitySection from '../Admin/BranchOperatingHours/BranchCapacitySection';
import OperatingHoursScheduleSection from '../Admin/BranchOperatingHours/OperatingHoursScheduleSection';
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const StaffOperatingHours: React.FC = () => {
  const { user } = useAuth();
  const branchId = user?.branchId || user?.branch?.id || '';
  const branchName = user?.branch?.name || user?.branchName || 'Chi nhánh';

  const [loading, setLoading] = useState<boolean>(true);
  const [, setSaving] = useState<boolean>(false);

  const [openingTime, setOpeningTime] = useState<string>('08:00');
  const [closingTime, setClosingTime] = useState<string>('22:00');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState<number>(90);
  const [dailyHours, setDailyHours] = useState<IDailyOperatingHour[]>([]);
  const [capacity, setCapacity] = useState<IBranchCapacityStats | null>(null);

  useEffect(() => {
    if (branchId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [branchId]);

  const fetchData = async () => {
    if (!branchId) return;
    try {
      setLoading(true);
      const [hoursRes, capRes] = await Promise.all([
        branchService.getOperatingHours(branchId),
        branchService.getCapacity(branchId),
      ]);

      const hoursData = (hoursRes as any)?.data !== undefined ? (hoursRes as any).data : hoursRes;
      const capData = (capRes as any)?.data !== undefined ? (capRes as any).data : capRes;

      if (hoursData) {
        if (hoursData.openingTime) setOpeningTime(hoursData.openingTime);
        if (hoursData.closingTime) setClosingTime(hoursData.closingTime);
        if (hoursData.slotDurationMinutes) setSlotDurationMinutes(hoursData.slotDurationMinutes);
        if (Array.isArray(hoursData.dailyHours)) setDailyHours(hoursData.dailyHours);
      }

      if (capData) setCapacity(capData);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lỗi khi tải thông tin giờ hoạt động');
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async (
    updates: {
      openingTime?: string;
      closingTime?: string;
      slotDurationMinutes?: number;
      dailyHours?: IDailyOperatingHour[];
    },
    message?: string,
  ) => {
    if (!branchId) return;

    const opTime = updates.openingTime !== undefined ? updates.openingTime : openingTime;
    const clTime = updates.closingTime !== undefined ? updates.closingTime : closingTime;

    if (opTime && clTime && opTime >= clTime) {
      toast.error(`Giờ mở cửa (${opTime}) phải trước giờ đóng cửa (${clTime})`);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        openingTime: opTime,
        closingTime: clTime,
        slotDurationMinutes:
          updates.slotDurationMinutes !== undefined ? updates.slotDurationMinutes : slotDurationMinutes,
        dailyHours: updates.dailyHours !== undefined ? updates.dailyHours : dailyHours,
      };
      await branchService.updateOperatingHours(branchId, payload);
      if (message) toast.success(message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lỗi khi tự động lưu');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDay = async (dayOfWeek: number) => {
    const updated = dailyHours.map((d) =>
      d.dayOfWeek === dayOfWeek ? { ...d, isOpen: !d.isOpen } : d,
    );
    setDailyHours(updated);
    const dayItem = updated.find((d) => d.dayOfWeek === dayOfWeek);
    await autoSave(
      { dailyHours: updated },
      `Đã chuyển sang: ${dayItem?.isOpen ? 'Mở cửa' : 'Nghỉ đóng'}`,
    );
  };

  const handleChangeDayTime = (
    dayOfWeek: number,
    field: 'openTime' | 'closeTime',
    value: string,
  ) => {
    setDailyHours((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d)),
    );
  };

  const handleDailyTimeBlur = async (
    dayOfWeek: number,
    field: 'openTime' | 'closeTime',
    value: string,
  ) => {
    if (!value) return;
    const day = dailyHours.find((d) => d.dayOfWeek === dayOfWeek);
    if (day && day.isOpen) {
      const open = field === 'openTime' ? value : day.openTime;
      const close = field === 'closeTime' ? value : day.closeTime;
      if (open && close && open >= close) {
        toast.error(`Giờ mở cửa (${open}) phải trước giờ đóng cửa (${close})`);
        return;
      }
    }
    const updated = dailyHours.map((d) =>
      d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d,
    );
    await autoSave({ dailyHours: updated }, 'Đã lưu giờ hoạt động chi tiết');
  };

  const handleApplyToAllDays = async () => {
    const updated = dailyHours.map((d) => ({
      ...d,
      openTime: openingTime,
      closeTime: closingTime,
    }));
    setDailyHours(updated);
    await autoSave({ dailyHours: updated }, 'Đã áp dụng và lưu giờ cho cả tuần!');
  };

  if (!branchId) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
        <AlertCircle size={40} className="text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-800">Không tìm thấy thông tin cơ sở</h3>
        <p className="text-sm text-gray-500 mt-1">
          Tài khoản của bạn chưa được liên kết với chi nhánh nào. Vui lòng liên hệ Quản trị viên.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Giờ Hoạt Động & Sức Chứa Chi Nhánh
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Thiết lập khung giờ đón khách, thời lượng slot dùng bữa và theo dõi sức chứa bàn ghế phục vụ
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 space-y-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Đang tải dữ liệu giờ hoạt động & sức chứa cơ sở...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <BranchCapacitySection
            capacity={capacity}
            slotDurationMinutes={slotDurationMinutes}
            branchName={branchName}
          />

          <OperatingHoursScheduleSection
            openingTime={openingTime}
            closingTime={closingTime}
            slotDurationMinutes={slotDurationMinutes}
            dailyHours={dailyHours}
            onOpeningTimeChange={setOpeningTime}
            onClosingTimeChange={setClosingTime}
            onDefaultTimeBlur={(field, val) =>
              autoSave(
                { [field]: val },
                field === 'openingTime' ? 'Đã lưu giờ mở cửa mặc định' : 'Đã lưu giờ đóng cửa mặc định',
              )
            }
            onSlotDurationChange={(newDuration) => {
              setSlotDurationMinutes(newDuration);
              autoSave({ slotDurationMinutes: newDuration }, `Đã lưu thời lượng slot: ${newDuration} phút`);
            }}
            onApplyToAllDays={handleApplyToAllDays}
            onToggleDay={handleToggleDay}
            onChangeDayTime={handleChangeDayTime}
            onDayTimeBlur={handleDailyTimeBlur}
          />
        </div>
      )}
    </div>
  );
};

export default StaffOperatingHours;
