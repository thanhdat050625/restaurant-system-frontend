import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../features/auth/AuthContext';
import { branchService } from '../../../services/admin/branchService';
import { IBranch } from '../../../types/admin/branch.type';
import {
  IDailyOperatingHour,
  IBranchCapacityStats,
} from '../../../types/admin/branch-operating-hours.type';
import {
  Clock,
  Users,
  LayoutGrid,
  Building2,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DAY_NAMES: { [key: number]: string } = {
  1: 'Thứ Hai',
  2: 'Thứ Ba',
  3: 'Thứ Tư',
  4: 'Thứ Năm',
  5: 'Thứ Sáu',
  6: 'Thứ Bảy',
  0: 'Chủ Nhật',
};

const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const BranchOperatingHours: React.FC = () => {
  const { user } = useAuth();
  const isStaff = user?.role === 'STAFF';

  // Branches list & Selected branch
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // General Settings
  const [openingTime, setOpeningTime] = useState<string>('08:00');
  const [closingTime, setClosingTime] = useState<string>('22:00');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState<number>(90);

  // 7 Days Schedule
  const [dailyHours, setDailyHours] = useState<IDailyOperatingHour[]>([]);

  // Capacity Stats
  const [capacity, setCapacity] = useState<IBranchCapacityStats | null>(null);

  // 1. Fetch initial branches
  useEffect(() => {
    fetchInitialBranches();
  }, []);

  // 2. Fetch operating hours and capacity when selectedBranchId changes
  useEffect(() => {
    if (selectedBranchId) {
      fetchBranchData();
    }
  }, [selectedBranchId]);

  const fetchInitialBranches = async () => {
    try {
      const res = await branchService.getBranches({ limit: 100 });
      let branchList: IBranch[] = [];
      if (Array.isArray(res)) {
        branchList = res;
      } else if (Array.isArray((res as any)?.data?.items)) {
        branchList = (res as any).data.items;
      } else if (Array.isArray((res as any)?.data)) {
        branchList = (res as any).data;
      }

      const staffBranchId = user?.branchId ? user.branchId : (user?.branch?.id ? user.branch.id : undefined);
      if (isStaff && staffBranchId) {
        const myBranch = branchList.filter((b: IBranch) => b.id === staffBranchId);
        setBranches(
          myBranch.length > 0 ? myBranch : (user as any)?.branch ? [(user as any).branch] : []
        );
        setSelectedBranchId(staffBranchId);
      } else {
        setBranches(branchList);
        if (branchList.length > 0 && !selectedBranchId) {
          setSelectedBranchId(branchList[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
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
      toast.error(errMsg ? errMsg : 'Lỗi khi tải thông tin giờ hoạt động');
    } finally {
      setLoading(false);
    }
  };

  // Helper autoSave: Tự động lưu cấu hình bất kỳ khi nào có thay đổi
  const autoSave = async (
    updates: {
      openingTime?: string;
      closingTime?: string;
      slotDurationMinutes?: number;
      dailyHours?: IDailyOperatingHour[];
    },
    message?: string
  ) => {
    if (!selectedBranchId) return;
    try {
      setSaving(true);
      const payload = {
        openingTime: updates.openingTime !== undefined ? updates.openingTime : openingTime,
        closingTime: updates.closingTime !== undefined ? updates.closingTime : closingTime,
        slotDurationMinutes: updates.slotDurationMinutes !== undefined ? updates.slotDurationMinutes : slotDurationMinutes,
        dailyHours: updates.dailyHours !== undefined ? updates.dailyHours : dailyHours,
      };
      await branchService.updateOperatingHours(selectedBranchId, payload);
      if (message) {
        toast.success(message);
      }
    } catch (error: any) {
      console.error('Error auto-saving operating hours:', error);
      const errMsg = error?.response?.data?.message;
      toast.error(errMsg ? errMsg : 'Lỗi khi tự động lưu');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDay = async (dayOfWeek: number) => {
    const updated = dailyHours.map((d) =>
      d.dayOfWeek === dayOfWeek ? { ...d, isOpen: !d.isOpen } : d
    );
    setDailyHours(updated);
    const dayItem = updated.find((d) => d.dayOfWeek === dayOfWeek);
    await autoSave(
      { dailyHours: updated },
      `Đã chuyển sang: ${dayItem?.isOpen ? 'Mở cửa' : 'Nghỉ đóng'} (${DAY_NAMES[dayOfWeek]})`
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

  const handleDailyTimeBlur = async (
    dayOfWeek: number,
    field: 'openTime' | 'closeTime',
    value: string
  ) => {
    if (!value) return;
    const updated = dailyHours.map((d) =>
      d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d
    );
    await autoSave({ dailyHours: updated }, `Đã lưu giờ hoạt động cho ${DAY_NAMES[dayOfWeek]}`);
  };

  const handleDefaultTimeBlur = async (
    field: 'openingTime' | 'closingTime',
    value: string
  ) => {
    if (!value) return;
    await autoSave(
      { [field]: value },
      field === 'openingTime' ? 'Đã lưu giờ mở cửa mặc định' : 'Đã lưu giờ đóng cửa mặc định'
    );
  };

  const handleSlotDurationChange = async (newDuration: number) => {
    setSlotDurationMinutes(newDuration);
    await autoSave(
      { slotDurationMinutes: newDuration },
      `Đã lưu thời lượng slot: ${newDuration} phút`
    );
  };

  const handleApplyToAllDays = async () => {
    const updated = dailyHours.map((d) => ({
      ...d,
      openTime: openingTime,
      closeTime: closingTime,
    }));
    setDailyHours(updated);
    await autoSave(
      { dailyHours: updated },
      'Đã áp dụng và lưu giờ cho cả tuần!'
    );
  };

  const sortedDailyHours = DISPLAY_ORDER.map(
    (day) =>
      dailyHours.find((d) => d.dayOfWeek === day) || {
        dayOfWeek: day,
        openTime: openingTime,
        closeTime: closingTime,
        isOpen: true,
      }
  );

  const selectedBranchName =
    branches.find((b) => b.id === selectedBranchId)?.name || 'Chi nhánh';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6 font-body">
      {/* Header đồng bộ chuẩn với các tab Quản lý khác */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Giờ Hoạt Động & Sức Chứa Chi Nhánh
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Thiết lập khung giờ đón khách, thời lượng slot dùng bữa và theo dõi sức chứa bàn ghế phục vụ theo từng cơ sở
          </p>
        </div>

        {/* Action Controls: Branch dropdown cho Admin */}
        <div className="flex items-center gap-3 flex-wrap">
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
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 space-y-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Đang tải dữ liệu giờ hoạt động & sức chứa cơ sở...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Cards: Năng lực sức chứa (Capacity) */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={16} className="text-primary" />
              <span>
                Năng Lực Sức Chứa Phục Vụ ({selectedBranchName})
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                  <LayoutGrid size={22} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-600 uppercase">Tổng Bàn Hoạt Động</span>
                  <p className="text-2xl font-black text-gray-900">
                    {capacity ? capacity.totalTables : 0}{' '}
                    <span className="text-xs font-medium text-gray-500">bàn</span>
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <Users size={22} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-emerald-700 uppercase">
                    Tổng Sức Chứa (Ghế Ngồi)
                  </span>
                  <p className="text-2xl font-black text-gray-900">
                    {capacity ? capacity.totalSeats : 0}{' '}
                    <span className="text-xs font-medium text-gray-500">khách tối đa</span>
                  </p>
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <Clock size={22} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-amber-700 uppercase">
                    Thời Lượng Slot Chuẩn
                  </span>
                  <p className="text-2xl font-black text-gray-900">
                    {slotDurationMinutes}{' '}
                    <span className="text-xs font-medium text-gray-500">phút / lượt dùng</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Phân bổ theo loại bàn */}
            {capacity?.byTableType && capacity.byTableType.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-xs text-gray-500 font-medium">Cơ cấu bàn ăn:</span>
                {capacity.byTableType.map((tt) => (
                  <span
                    key={tt.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200"
                  >
                    <strong className="text-gray-900">{tt.name}</strong>
                    <span className="text-gray-400">|</span>
                    <span>{tt.tableCount} bàn</span>
                    <span className="text-gray-500 font-normal">({tt.totalSeats} chỗ)</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cấu hình chung */}
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
                  onChange={(e) => setOpeningTime(e.target.value)}
                  onBlur={(e) => handleDefaultTimeBlur('openingTime', e.target.value)}
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
                  onChange={(e) => setClosingTime(e.target.value)}
                  onBlur={(e) => handleDefaultTimeBlur('closingTime', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Thời lượng slot dùng bữa
                </label>
                <select
                  value={slotDurationMinutes}
                  onChange={(e) => handleSlotDurationChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value={45}>45 phút</option>
                  <option value={60}>60 phút (1 giờ)</option>
                  <option value={90}>90 phút (1 giờ 30 phút - Chuẩn)</option>
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

          {/* Bảng lịch 7 ngày trong tuần */}
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
                        className={`hover:bg-gray-50/80 transition-colors ${!item.isOpen ? 'bg-gray-50/50 text-gray-400' : ''
                          }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${isWeekend ? 'text-primary' : 'text-gray-900'
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
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${item.isOpen
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
                            onBlur={(e) =>
                              handleDailyTimeBlur(item.dayOfWeek, 'openTime', e.target.value)
                            }
                            className={`px-2.5 py-1.5 rounded-lg border text-sm font-semibold outline-none transition-colors ${item.isOpen
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
                            onBlur={(e) =>
                              handleDailyTimeBlur(item.dayOfWeek, 'closeTime', e.target.value)
                            }
                            className={`px-2.5 py-1.5 rounded-lg border text-sm font-semibold outline-none transition-colors ${item.isOpen
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
      )}
    </div>
  );
};

export default BranchOperatingHours;
