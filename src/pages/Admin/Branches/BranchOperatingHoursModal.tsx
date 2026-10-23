import React, { useState, useEffect } from 'react';
import { IBranch } from '../../../types/admin/branch.type';
import {
  IDailyOperatingHour,
  IBranchCapacityStats,
} from '../../../types/admin/branch-operating-hours.type';
import { branchService } from '../../../services/admin/branchService';
import Modal from '../../../components/ui/Modal';
import BranchCapacitySection from '../BranchOperatingHours/BranchCapacitySection';
import OperatingHoursScheduleSection from '../BranchOperatingHours/OperatingHoursScheduleSection';
import { Save, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface BranchOperatingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: IBranch | null;
  onSuccess?: () => void;
}

export const BranchOperatingHoursModal: React.FC<BranchOperatingHoursModalProps> = ({
  isOpen,
  onClose,
  branch,
  onSuccess,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [openingTime, setOpeningTime] = useState<string>('08:00');
  const [closingTime, setClosingTime] = useState<string>('22:00');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState<number>(90);
  const [dailyHours, setDailyHours] = useState<IDailyOperatingHour[]>([]);
  const [capacity, setCapacity] = useState<IBranchCapacityStats | null>(null);

  useEffect(() => {
    if (isOpen && branch) {
      fetchData();
    }
  }, [isOpen, branch]);

  const fetchData = async () => {
    if (!branch) return;
    try {
      setLoading(true);
      const [hoursRes, capRes] = await Promise.all([
        branchService.getOperatingHours(branch.id),
        branchService.getCapacity(branch.id),
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
      toast.error(error?.response?.data?.message || 'Không thể tải dữ liệu giờ hoạt động');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (dayOfWeek: number) => {
    setDailyHours((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, isOpen: !d.isOpen } : d)),
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

  const handleApplyToAllDays = () => {
    setDailyHours((prev) =>
      prev.map((d) => ({
        ...d,
        openTime: openingTime,
        closeTime: closingTime,
      })),
    );
    toast.success('Đã áp dụng giờ mặc định cho tất cả các ngày trong tuần!');
  };

  const handleSave = async () => {
    if (!branch) return;

    if (openingTime >= closingTime) {
      toast.error(`Giờ mở cửa (${openingTime}) phải trước giờ đóng cửa (${closingTime})`);
      return;
    }

    for (const d of dailyHours) {
      if (d.isOpen && d.openTime >= d.closeTime) {
        toast.error(`Ngày thứ ${d.dayOfWeek}: Giờ mở cửa phải trước giờ đóng cửa`);
        return;
      }
    }

    try {
      setSaving(true);
      await branchService.updateOperatingHours(branch.id, {
        openingTime,
        closingTime,
        slotDurationMinutes,
        dailyHours,
      });
      toast.success('Đã lưu cấu hình giờ hoạt động & suất dùng bữa thành công!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lỗi khi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cấu Hình Giờ Hoạt Động & Sức Chứa Chi Nhánh"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">{branch?.name}</h3>
              <p className="text-xs text-gray-500">
                {branch?.streetAddress}
                {branch?.ward?.name ? `, ${branch.ward.name}` : ''}
                {branch?.province?.name ? `, ${branch.province.name}` : ''}
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              branch?.status === 'ACTIVE'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {branch?.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm đóng'}
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 space-y-2">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Đang tải cấu hình giờ hoạt động & sức chứa...</p>
          </div>
        ) : (
          <>
            <BranchCapacitySection
              capacity={capacity}
              slotDurationMinutes={slotDurationMinutes}
            />

            <OperatingHoursScheduleSection
              openingTime={openingTime}
              closingTime={closingTime}
              slotDurationMinutes={slotDurationMinutes}
              dailyHours={dailyHours}
              onOpeningTimeChange={setOpeningTime}
              onClosingTimeChange={setClosingTime}
              onSlotDurationChange={setSlotDurationMinutes}
              onApplyToAllDays={handleApplyToAllDays}
              onToggleDay={handleToggleDay}
              onChangeDayTime={handleChangeDayTime}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Lưu Cấu Hình</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default BranchOperatingHoursModal;
