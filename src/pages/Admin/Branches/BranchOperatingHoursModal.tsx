import React, { useState, useEffect } from 'react';
import { IBranch } from '../../../types/admin/branch.type';
import {
  IDailyOperatingHour,
  IBranchCapacityStats,
} from '../../../types/admin/branch-operating-hours.type';
import { branchService } from '../../../services/admin/branchService';
import Modal from '../../../components/ui/Modal';
import {
  Clock,
  Users,
  LayoutGrid,
  Save,
  Sparkles,
  Building2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BranchOperatingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: IBranch | null;
  onSuccess?: () => void;
}

const DAY_NAMES: { [key: number]: string } = {
  1: 'Thứ Hai',
  2: 'Thứ Ba',
  3: 'Thứ Tư',
  4: 'Thứ Năm',
  5: 'Thứ Sáu',
  6: 'Thứ Bảy',
  0: 'Chủ Nhật',
};

// Thứ tự hiển thị từ Thứ 2 đến Chủ nhật
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const BranchOperatingHoursModal: React.FC<BranchOperatingHoursModalProps> = ({
  isOpen,
  onClose,
  branch,
  onSuccess,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // General Settings
  const [openingTime, setOpeningTime] = useState<string>('08:00');
  const [closingTime, setClosingTime] = useState<string>('22:00');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState<number>(90);

  // 7 Days Schedule
  const [dailyHours, setDailyHours] = useState<IDailyOperatingHour[]>([]);

  // Capacity Stats
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

        if (Array.isArray(hoursData.dailyHours)) {
          setDailyHours(hoursData.dailyHours);
        }
      }

      if (capData) {
        setCapacity(capData);
      }
    } catch (error: any) {
      console.error('Error fetching operating hours & capacity:', error);
      const errMsg = error?.response?.data?.message;
      toast.error(errMsg ? errMsg : 'Không thể tải dữ liệu giờ hoạt động');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (dayOfWeek: number) => {
    setDailyHours((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, isOpen: !d.isOpen } : d))
    );
  };

  const handleChangeTime = (
    dayOfWeek: number,
    field: 'openTime' | 'closeTime',
    value: string
  ) => {
    setDailyHours((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d))
    );
  };

  const handleApplyToAllDays = () => {
    setDailyHours((prev) =>
      prev.map((d) => ({
        ...d,
        openTime: openingTime,
        closeTime: closingTime,
      }))
    );
    toast.success('Đã áp dụng giờ mặc định cho tất cả các ngày trong tuần!');
  };

  const handleSave = async () => {
    if (!branch) return;
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
      console.error('Error updating operating hours:', error);
      const errMsg = error?.response?.data?.message;
      toast.error(errMsg ? errMsg : 'Lỗi khi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  // Sắp xếp danh sách hiển thị Thứ 2 -> Chủ Nhật
  const sortedDailyHours = DISPLAY_ORDER.map((day) => {
    const found = dailyHours.find((d) => d.dayOfWeek === day);
    if (found) return found;
    return {
      dayOfWeek: day,
      openTime: openingTime,
      closeTime: closingTime,
      isOpen: true,
    };
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cấu Hình Giờ Hoạt Động & Sức Chứa Chi Nhánh"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Branch Overview Header */}
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
            {/* KPI Cards: Năng lực sức chứa (Capacity) */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users size={16} className="text-primary" />
                <span>Năng Lực Sức Chứa Phục Vụ (Capacity)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                    <LayoutGrid size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-blue-600 uppercase">Tổng Bàn Ăn</span>
                    <p className="text-xl font-black text-gray-900">
                      {capacity ? capacity.totalTables : 0}{' '}
                      <span className="text-xs font-medium text-gray-500">bàn</span>
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Users size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-emerald-700 uppercase">
                      Tổng Chỗ Ngồi (Ghế)
                    </span>
                    <p className="text-xl font-black text-gray-900">
                      {capacity ? capacity.totalSeats : 0}{' '}
                      <span className="text-xs font-medium text-gray-500">chỗ tối đa</span>
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                    <Clock size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-amber-700 uppercase">
                      Thời Lượng Slot Chuẩn
                    </span>
                    <p className="text-xl font-black text-gray-900">
                      {slotDurationMinutes}{' '}
                      <span className="text-xs font-medium text-gray-500">phút / lượt</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Chi tiết phân bổ theo từng loại bàn */}
              {capacity?.byTableType && capacity.byTableType.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-xs text-gray-500 font-medium">Cơ cấu bàn:</span>
                  {capacity.byTableType.map((tt) => (
                    <span
                      key={tt.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium border border-gray-200"
                    >
                      <strong className="text-gray-900 font-bold">{tt.name}</strong>
                      <span className="text-gray-400">|</span>
                      <span>{tt.tableCount} bàn</span>
                      <span className="text-gray-400">({tt.totalSeats} ghế)</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* General Settings */}
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={16} className="text-primary" />
                <span>Cấu Hình Khung Giờ Hoạt Động & Thời Lượng Slot</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Giờ mở cửa mặc định
                  </label>
                  <input
                    type="time"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Giờ đóng cửa mặc định
                  </label>
                  <input
                    type="time"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Thời lượng slot dùng bữa
                  </label>
                  <select
                    value={slotDurationMinutes}
                    onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    <option value={45}>45 phút</option>
                    <option value={60}>60 phút (1 giờ)</option>
                    <option value={90}>90 phút (1 giờ 30 phút - Khuyên dùng)</option>
                    <option value={120}>120 phút (2 giờ)</option>
                    <option value={150}>150 phút (2 giờ 30 phút)</option>
                    <option value={180}>180 phút (3 giờ)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleApplyToAllDays}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>Áp dụng giờ mặc định ({openingTime} - {closingTime}) cho cả tuần</span>
                </button>
              </div>
            </div>

            {/* Weekly Schedule Table */}
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                  Lịch Hoạt Động 7 Ngày Trong Tuần
                </h4>
                <span className="text-xs text-gray-500">
                  Có thể tắt mở cửa vào ngày nghỉ định kỳ của cơ sở
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
                      <th className="p-3 font-bold text-center">Thời gian mở</th>
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
                              <span
                                className={`font-bold ${
                                  isWeekend ? 'text-primary' : 'text-gray-900'
                                }`}
                              >
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
                              onClick={() => handleToggleDay(item.dayOfWeek)}
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
                              onChange={(e) =>
                                handleChangeTime(item.dayOfWeek, 'openTime', e.target.value)
                              }
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
                              onChange={(e) =>
                                handleChangeTime(item.dayOfWeek, 'closeTime', e.target.value)
                              }
                              className={`px-2.5 py-1.5 rounded-lg border text-sm font-semibold outline-none transition-colors ${
                                item.isOpen
                                  ? 'border-gray-300 bg-white text-gray-900 focus:border-primary'
                                  : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                            />
                          </td>

                          <td className="p-3 text-center">
                            {item.isOpen ? (
                              <span className="text-xs font-semibold text-gray-600">
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

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
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
