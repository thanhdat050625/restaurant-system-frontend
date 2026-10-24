import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Navigation, RotateCcw, Building2, AlertCircle } from 'lucide-react';
import { branchService } from '../../services/admin/branchService';
import { IBranch, IProvince, IWard } from '../../types/admin/branch.type';
import { BranchCard } from './BranchCard';
import { BranchDetailModal } from './BranchDetailModal';

export const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [provinces, setProvinces] = useState<IProvince[]>([]);
  const [wards, setWards] = useState<IWard[]>([]);

  const [search, setSearch] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [selectedBranch, setSelectedBranch] = useState<IBranch | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await branchService.getProvinces();
        const data = res?.data?.data || res?.data || [];
        setProvinces(Array.isArray(data) ? data : []);
      } catch {
        setProvinces([]);
      }
    };
    fetchProvinces();
  }, []);

  // Load wards when province changes
  useEffect(() => {
    if (!selectedProvince) {
      setWards([]);
      setSelectedWard('');
      return;
    }
    const fetchWards = async () => {
      try {
        const res = await branchService.getWardsByProvince(selectedProvince);
        const data = res?.data?.data || res?.data || [];
        setWards(Array.isArray(data) ? data : []);
      } catch {
        setWards([]);
      }
    };
    fetchWards();
  }, [selectedProvince]);

  // Fetch branches with filters
  const fetchBranches = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        status: 'ACTIVE',
      };
      if (search.trim()) params.search = search.trim();
      if (selectedProvince) params.provinceCode = selectedProvince;
      if (selectedWard) params.wardCode = selectedWard;
      if (isOpenNow) params.isOpenNow = true;
      if (userCoords) {
        params.lat = userCoords.lat;
        params.lng = userCoords.lng;
      }

      const res = await branchService.getBranches(params);
      const data = res?.data?.data || res?.data || [];
      const branchItems = Array.isArray(data) ? data : data.items || [];
      setBranches(branchItems);
    } catch {
      setBranches([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedProvince, selectedWard, isOpenNow, userCoords]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchBranches();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchBranches]);

  // Handle Geolocation
  const handleGetLocation = () => {
    if (userCoords) {
      // Toggle off
      setUserCoords(null);
      setLocationError(null);
      return;
    }

    if (!navigator.geolocation) {
      setLocationError('Trình duyệt của bạn không hỗ trợ định vị.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      () => {
        setLocationError('Không thể lấy vị trí. Vui lòng cấp quyền truy cập vị trí.');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedProvince('');
    setSelectedWard('');
    setIsOpenNow(false);
    setUserCoords(null);
    setLocationError(null);
  };

  const handleOpenDetail = (branch: IBranch) => {
    setSelectedBranch(branch);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors pt-20 pb-16">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80 text-white py-14 sm:py-20 px-4 mb-8 sm:mb-12">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-amber-300">
            <Building2 size={14} />
            <span>Hệ thống chuỗi nhà hàng chất lượng cao</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-[family-name:var(--font-heading)]">
            Hệ Thống Chi Nhánh FoodHub
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Khám phá không gian ẩm thực sang trọng và hương vị tinh tế tại mọi chi nhánh của FoodHub trên toàn quốc.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Filter Controls Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-700/80 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên, số điện thoại, đường..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Province Select */}
            <div>
              <select
                value={selectedProvince}
                onChange={(e) => {
                  setSelectedProvince(e.target.value);
                  setSelectedWard('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Tất cả Tỉnh / Thành phố</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ward Select */}
            <div>
              <select
                value={selectedWard}
                disabled={!selectedProvince}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
              >
                <option value="">Tất cả Phường / Xã</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.fullName || w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Near Me Geo Button */}
            <div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  userCoords
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <Navigation size={16} className={isLocating ? 'animate-spin' : ''} />
                <span>{isLocating ? 'Đang định vị...' : userCoords ? 'Đang bật Gần tôi (Tắt)' : 'Gần tôi nhất'}</span>
              </button>
            </div>
          </div>

          {/* Secondary filter & reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-slate-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={isOpenNow}
                onChange={(e) => setIsOpenNow(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary/40 border-slate-300 dark:border-slate-600"
              />
              <span>Chỉ hiển thị chi nhánh đang mở cửa</span>
            </label>

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-primary transition-colors flex items-center gap-1 font-medium"
            >
              <RotateCcw size={13} />
              <span>Đặt lại bộ lọc</span>
            </button>
          </div>

          {locationError && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{locationError}</span>
            </div>
          )}
        </div>

        {/* Branch List Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 rounded-2xl h-80 animate-pulse border border-slate-200 dark:border-slate-700"
              />
            ))}
          </div>
        ) : branches.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <Building2 size={48} className="mx-auto text-slate-400" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Không tìm thấy chi nhánh phù hợp
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Vui lòng thử điều chỉnh lại từ khóa tìm kiếm, Tỉnh/Thành phố hoặc tắt bộ lọc đang mở cửa.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-xl transition-colors"
            >
              Xem tất cả chi nhánh
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Tìm thấy <strong className="text-slate-800 dark:text-slate-100">{branches.length}</strong> chi nhánh phù hợp:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  onSelectDetail={handleOpenDetail}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Branch Detail Modal */}
      <BranchDetailModal
        branch={selectedBranch}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedBranch(null);
        }}
      />
    </div>
  );
};

export default BranchesPage;
