import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../features/auth/AuthContext';
import { branchService } from '../../../services/admin/branchService';
import { IBranch } from '../../../types/admin/branch.type';
import {
  IDailyOperatingHour,
  IBranchCapacityStats,
} from '../../../types/admin/branch-operating-hours.type';
import BranchCapacitySection from './BranchCapacitySection';
import OperatingHoursScheduleSection from './OperatingHoursScheduleSection';
import { Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const BranchOperatingHours: React.FC = () => {
  const { user } = useAuth();
  const isStaff = user?.role === 'STAFF';

  const [branches, setBranches] = useState<IBranch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [, setSaving] = useState<boolean>(false);

  const [openingTime, setOpeningTime] = useState<string>('08:00');
  const [closingTime, setClosingTime] = useState<string>('22:00');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState<number>(90);
  const [dailyHours, setDailyHours] = useState<IDailyOperatingHour[]>([]);
  const [capacity, setCapacity] = useState<IBranchCapacityStats | null>(null);

  useEffect(() => {
    fetchInitialBranches();
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      fetchBranchData();
    }
  }, [selectedBranchId]);

  const fetchInitialBranches = async () => {
    try {
      const res = await branchService.getBranches({ limit: 100 });
      const branchList = Array.isArray(res)
        ? res
        : (res as any)?.data?.items || (res as any)?.data || [];

      const staffBranchId = user?.branchId || user?.branch?.id;
      if (isStaff && staffBranchId) {
        const myBranch = branchList.filter((b: IBranch) => b.id === staffBranchId);
        setBranches(myBranch.length > 0 ? myBranch : (user as any)?.branch ? [(user as any).branch] : []);
        setSelectedBranchId(staffBranchId);
      } else {
        setBranches(branchList);
        if (branchList.length > 0 && !selectedBranchId) {
          setSelectedBranchId(branchList[0].id);
        }
      }
    } catch {
      toast.error('Lỗi khi tải danh sách chi nhánh');
    }
  };

  const fetchBranchData = async () => {
    if (!selectedBranchId) return;
    try {
      setLoading(true);
      const [hoursRes, capRes] = await Promise.all([
        branchService.getOperatingHours(selectedBranchId),
        branchService.getCapacity(selectedBranchId),
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
    if (!selectedBranchId) return;

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
      await branchService.updateOperatingHours(selectedBranchId, payload);
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

  const selectedBranchName =
    branches.find((b) => b.id === selectedBranchId)?.name || 'Chi nhánh';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Giờ Hoạt Động & Sức Chứa Chi Nhánh
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Thiết lập khung giờ đón khách, thời lượng slot dùng bữa và theo dõi sức chứa bàn ghế
          </p>
        </div>

        {!isStaff && (
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-300">
            <Building2 size={16} className="text-primary shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Cơ Sở Phục Vụ</span>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent text-sm font-semibold text-gray-800 outline-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
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
            branchName={selectedBranchName}
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

export default BranchOperatingHours;
