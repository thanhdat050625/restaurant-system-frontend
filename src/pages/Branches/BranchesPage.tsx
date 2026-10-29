import React, { useState, useEffect, useCallback } from 'react';
import { Search, Navigation, RotateCcw, Building2, AlertCircle, Store, Map as MapIcon, MapPinned } from 'lucide-react';
import Select from '../../components/ui/Select';
import PageWrapper from '../../layouts/PageWrapper';
import PageHero from '../../components/ui/PageHero';
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
  const [loadError, setLoadError] = useState(false);
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
    setLoadError(false);
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
      setLoadError(true);
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

  const hasActiveFilters = Boolean(search || selectedProvince || selectedWard || isOpenNow || userCoords);
  const toggleClass = (active: boolean) =>
    `inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
      active
        ? 'bg-primary text-white border-primary shadow-glow'
        : 'bg-white dark:bg-dark-surface border-light-border dark:border-dark-border text-text-secondary dark:text-gray-300 hover:border-primary hover:text-primary'
    }`;

  return (
    <PageWrapper className="bg-light dark:bg-dark">
      <PageHero
        overlap
        image="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920"
        eyebrow="Hệ thống chuỗi nhà hàng"
        eyebrowIcon={Building2}
        title={
          <>
            Chi nhánh <span className="gradient-text">FoodHub</span>
          </>
        }
        subtitle="Tìm nhà hàng gần bạn nhất, xem giờ mở cửa và đặt bàn chỉ với vài thao tác."
      />

      <section className="relative -mt-16 sm:-mt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Bộ lọc */}
          <div className="bg-white dark:bg-dark-surface rounded-2xl p-4 sm:p-6 shadow-card-hover border border-light-border dark:border-dark-border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-3">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" />
                <input
                  type="text"
                  placeholder="Tìm theo tên chi nhánh, số điện thoại, tên đường..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-light-border dark:border-dark-border bg-light dark:bg-dark text-sm text-text-primary dark:text-white placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>

              <Select
                value={selectedProvince}
                onChange={(code) => {
                  setSelectedProvince(code);
                  setSelectedWard('');
                }}
                icon={MapIcon}
                aria-label="Tỉnh / Thành phố"
                placeholder="Tất cả Tỉnh / Thành phố"
                options={[
                  { value: '', label: 'Tất cả Tỉnh / Thành phố' },
                  ...provinces.map((p) => ({ value: p.code, label: p.name })),
                ]}
              />

              <Select
                value={selectedWard}
                onChange={setSelectedWard}
                disabled={!selectedProvince}
                icon={MapPinned}
                aria-label="Phường / Xã"
                placeholder={selectedProvince ? 'Tất cả Phường / Xã' : 'Chọn Tỉnh / Thành trước'}
                options={[
                  { value: '', label: 'Tất cả Phường / Xã' },
                  ...wards.map((w) => ({ value: w.code, label: w.fullName || w.name })),
                ]}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button type="button" onClick={handleGetLocation} disabled={isLocating} className={toggleClass(!!userCoords)}>
                <Navigation size={15} className={isLocating ? 'animate-pulse' : ''} />
                {isLocating ? 'Đang định vị...' : 'Gần tôi nhất'}
              </button>
              <button type="button" onClick={() => setIsOpenNow((v) => !v)} className={toggleClass(isOpenNow)}>
                <span className={`w-2 h-2 rounded-full ${isOpenNow ? 'bg-white' : 'bg-success'}`} />
                Đang mở cửa
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary dark:text-text-light hover:text-primary transition-colors"
                >
                  <RotateCcw size={14} />
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {locationError && (
              <div className="px-4 py-3 rounded-xl bg-error/10 text-error text-sm flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{locationError}</span>
              </div>
            )}
          </div>

          {/* Danh sách chi nhánh */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-light-border dark:border-dark-border animate-pulse"
                >
                  <div className="h-52 bg-light-card dark:bg-dark-card" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-2/3 rounded bg-light-card dark:bg-dark-card" />
                    <div className="h-4 w-full rounded bg-light-card dark:bg-dark-card" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-12 rounded-xl bg-light-card dark:bg-dark-card" />
                      <div className="h-12 rounded-xl bg-light-card dark:bg-dark-card" />
                    </div>
                    <div className="h-11 rounded-xl bg-light-card dark:bg-dark-card" />
                  </div>
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div className="text-center py-16 px-6 bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border">
              <AlertCircle size={44} className="mx-auto text-error mb-3" />
              <h3 className="text-lg font-bold text-text-primary dark:text-white">Không tải được danh sách chi nhánh</h3>
              <p className="mt-1 text-sm text-text-secondary dark:text-text-light">Vui lòng kiểm tra kết nối mạng và thử lại.</p>
              <button
                type="button"
                onClick={fetchBranches}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors"
              >
                <RotateCcw size={15} />
                Thử lại
              </button>
            </div>
          ) : branches.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white dark:bg-dark-surface rounded-2xl border border-dashed border-light-border dark:border-dark-border">
              <Store size={44} className="mx-auto text-text-light mb-3" />
              <h3 className="text-lg font-bold text-text-primary dark:text-white">Không tìm thấy chi nhánh phù hợp</h3>
              <p className="mt-1 text-sm text-text-secondary dark:text-text-light max-w-md mx-auto">
                Thử đổi từ khóa, khu vực hoặc tắt bộ lọc &quot;Đang mở cửa&quot;.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white text-sm font-semibold transition-colors"
                >
                  Xem tất cả chi nhánh
                </button>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-end justify-between gap-4 mb-5">
                <h2 className="text-2xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)]">
                  {userCoords ? 'Chi nhánh gần bạn' : 'Tất cả chi nhánh'}
                </h2>
                <span className="text-sm text-text-secondary dark:text-text-light whitespace-nowrap">
                  <strong className="text-text-primary dark:text-white">{branches.length}</strong> chi nhánh
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map((branch) => (
                  <BranchCard key={branch.id} branch={branch} onSelectDetail={handleOpenDetail} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <BranchDetailModal
        branch={selectedBranch}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedBranch(null);
        }}
      />
    </PageWrapper>
  );
};

export default BranchesPage;
