import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChefHat,
  RefreshCw,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  LogOut,
  Shield,
  Utensils,
  ShoppingBag,
  Clock,
  Flame,
  Sparkles,
  AlertCircle,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../features/auth/AuthContext';
import { useTheme } from '../../hooks/ThemeContext';
import { kitchenService } from '../../services/kitchenService';
import { branchService } from '../../services/admin/branchService';
import { socketService } from '../../services/socketService';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { IBranch } from '../../types/admin/branch.type';
import { IDineInOrderItem, KitchenItemStatus } from '../../types/dine-in.type';
import {
  IKitchenDineInBatch,
  IKitchenPickupOrder,
  IKitchenQueueSummary,
  KitchenPickupTransitionStatus,
  KitchenSourceFilter,
  KitchenStatusFilter,
} from '../../types/kitchen.type';
import { KitchenDineInBatchCard } from './KitchenDineInBatchCard';
import { KitchenPickupOrderCard } from './KitchenPickupOrderCard';

interface CancelTargetState {
  item: IDineInOrderItem;
  batchLabel: string;
}

const CANCEL_PRESETS = [
  'Hết nguyên liệu trong ngày',
  'Ngưng phục vụ món này hôm nay',
  'Khách yêu cầu hủy trước khi chế biến',
];

const playChimeSound = () => {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playNote = (freq: number, startOffset: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + startOffset);
      gain.gain.setValueAtTime(0.001, now + startOffset);
      gain.gain.exponentialRampToValueAtTime(0.18, now + startOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + startOffset);
      osc.stop(now + startOffset + duration);
    };

    playNote(659.25, 0, 0.18);
    playNote(880, 0.14, 0.28);
  } catch {
    // Ignore browser autoplay restrictions silently
  }
};

const getErrorMsg = (err: unknown, fallback: string): string => {
  const e = err as { response?: { data?: { message?: string | string[] } }; message?: string };
  const raw = e?.response?.data?.message;
  if (Array.isArray(raw)) return raw.join(', ');
  return raw || e?.message || fallback;
};

export const KitchenDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const userTyped = user as {
    id?: string;
    fullName?: string;
    role?: string;
    branchId?: string | null;
    branch?: { id?: string; name?: string } | null;
  } | null;

  const userBranchId = userTyped?.branchId || userTyped?.branch?.id || '';
  const needsBranchSelector = userTyped?.role === 'ADMIN' || !userBranchId;

  const [branches, setBranches] = useState<IBranch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(userBranchId);
  const [branchesLoading, setBranchesLoading] = useState<boolean>(needsBranchSelector);

  const [sourceFilter, setSourceFilter] = useState<KitchenSourceFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<KitchenStatusFilter>('ALL');

  const [summary, setSummary] = useState<IKitchenQueueSummary>({
    queuedCount: 0,
    preparingCount: 0,
    readyCount: 0,
    totalActive: 0,
  });
  const [dineInBatches, setDineInBatches] = useState<IKitchenDineInBatch[]>([]);
  const [pickupOrders, setPickupOrders] = useState<IKitchenPickupOrder[]>([]);
  const [resolvedBranchId, setResolvedBranchId] = useState<string>(userBranchId);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [updatingBatchId, setUpdatingBatchId] = useState<string | null>(null);
  const [updatingPickupId, setUpdatingPickupId] = useState<string | null>(null);

  const [cancelTarget, setCancelTarget] = useState<CancelTargetState | null>(null);
  const [cancelReason, setCancelReason] = useState<string>(CANCEL_PRESETS[0]);
  const [cancellingItem, setCancellingItem] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  // Live timer tick every 30s for wait-time badges
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  // Load branches if ADMIN or KITCHEN/STAFF without assigned branchId
  useEffect(() => {
    if (!needsBranchSelector) return;
    let active = true;

    const loadBranches = async () => {
      setBranchesLoading(true);
      try {
        const res = await branchService.getBranches();
        const list = Array.isArray(res?.data) ? res.data : [];
        if (!active) return;
        setBranches(list);
        if (list.length > 0) {
          setSelectedBranchId((prev) => prev || userBranchId || list[0].id);
        }
      } catch {
        // Queue fetch handles empty branch error state if needed
      } finally {
        if (active) setBranchesLoading(false);
      }
    };

    loadBranches();
    return () => {
      active = false;
    };
  }, [needsBranchSelector, userBranchId]);

  const activeBranchId = selectedBranchId || resolvedBranchId || userBranchId;

  const fetchQueue = useCallback(
    async (showLoader = true) => {
      if (needsBranchSelector && branchesLoading && !selectedBranchId) {
        return;
      }

      if (showLoader) setLoading(true);
      else setRefreshing(true);

      setErrorMsg(null);
      try {
        const res = await kitchenService.getKitchenQueue({
          branchId: selectedBranchId || undefined,
          source: sourceFilter,
          status: statusFilter,
        });
        setSummary(res.data.summary);
        setDineInBatches(res.data.dineInBatches || []);
        setPickupOrders(res.data.pickupOrders || []);
        if (res.data.branchId) {
          setResolvedBranchId(res.data.branchId);
        }
      } catch (err: unknown) {
        setErrorMsg(getErrorMsg(err, 'Không thể tải hàng đợi chế biến của bếp.'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedBranchId, sourceFilter, statusFilter, needsBranchSelector, branchesLoading],
  );

  useEffect(() => {
    fetchQueue(true);
  }, [fetchQueue]);

  // Real-time Socket subscriptions for both Kitchen room & Branch pickup events
  useEffect(() => {
    if (!activeBranchId) return;

    const socket = socketService.connect(userTyped?.id || null);
    setSocketConnected(Boolean(socket.connected));

    socketService.joinKitchen(activeBranchId);
    socketService.joinBranch(activeBranchId);

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    const handleNewBatch = (payload?: {
      table?: { tableNumber?: string };
      batch?: { batchNumber?: number };
      tableNumber?: string;
      batchNumber?: number;
    }) => {
      const tableNum = payload?.table?.tableNumber || payload?.tableNumber || 'bàn ăn';
      const batchNum = payload?.batch?.batchNumber || payload?.batchNumber;
      if (soundEnabledRef.current) playChimeSound();
      toast.success(
        `Đơn mới tại ${tableNum}${batchNum ? ` (Đợt #${batchNum})` : ''}!`,
        { duration: 4500 },
      );
      fetchQueue(false);
    };

    const handleItemUpdated = () => {
      fetchQueue(false);
    };

    const handlePickupCreated = (payload?: { orderCode?: string }) => {
      if (soundEnabledRef.current) playChimeSound();
      toast.success(
        `Có đơn mang về mới${payload?.orderCode ? ` #${payload.orderCode}` : ''}!`,
        { duration: 4500 },
      );
      fetchQueue(false);
    };

    const handlePickupStatusChanged = () => {
      fetchQueue(false);
    };

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('kitchen:new_batch', handleNewBatch);
    socketService.on('kitchen:item_updated', handleItemUpdated);
    socketService.on('pickupOrder:created', handlePickupCreated);
    socketService.on('pickupOrder:statusChanged', handlePickupStatusChanged);

    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('kitchen:new_batch', handleNewBatch);
      socketService.off('kitchen:item_updated', handleItemUpdated);
      socketService.off('pickupOrder:created', handlePickupCreated);
      socketService.off('pickupOrder:statusChanged', handlePickupStatusChanged);
      socketService.leaveKitchen(activeBranchId);
      socketService.leaveBranch(activeBranchId);
    };
  }, [activeBranchId, userTyped?.id, fetchQueue]);

  // Sync pickupOrders client-side against statusFilter & sourceFilter
  const filteredPickupOrders = useMemo(() => {
    if (sourceFilter === 'DINE_IN') return [];
    if (statusFilter === 'ALL') return pickupOrders;
    if (statusFilter === 'QUEUED') {
      return pickupOrders.filter((o) => o.status === 'CONFIRMED');
    }
    if (statusFilter === 'PREPARING') {
      return pickupOrders.filter((o) => o.status === 'PREPARING');
    }
    if (statusFilter === 'READY') {
      return pickupOrders.filter((o) => o.status === 'READY');
    }
    return [];
  }, [pickupOrders, sourceFilter, statusFilter]);

  const displayedBatches = useMemo(() => {
    if (sourceFilter === 'PICKUP') return [];
    return dineInBatches;
  }, [dineInBatches, sourceFilter]);

  const handleUpdateItemStatus = async (itemId: string, status: KitchenItemStatus) => {
    setUpdatingItemId(itemId);
    try {
      await kitchenService.updateOrderItemStatus(itemId, { status });
      toast.success('Đã cập nhật trạng thái món!');
      await fetchQueue(false);
    } catch (err: unknown) {
      toast.error(getErrorMsg(err, 'Không thể cập nhật trạng thái món.'));
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleConfirmCancelItem = async () => {
    if (!cancelTarget) return;
    const reason = cancelReason.trim() || 'Hết món trong ngày';
    setCancellingItem(true);
    try {
      await kitchenService.updateOrderItemStatus(cancelTarget.item.id, {
        status: 'CANCELLED',
        cancelledReason: reason,
      });
      toast.success(`Đã báo hết/hủy món "${cancelTarget.item.menuItem?.name}".`);
      setCancelTarget(null);
      await fetchQueue(false);
    } catch (err: unknown) {
      toast.error(getErrorMsg(err, 'Không thể hủy món.'));
    } finally {
      setCancellingItem(false);
    }
  };

  const handleUpdateBatchStatus = async (batchId: string, status: KitchenItemStatus) => {
    setUpdatingBatchId(batchId);
    try {
      await kitchenService.updateOrderBatchStatus(batchId, { status });
      toast.success('Đã cập nhật trạng thái cả đợt gọi món!');
      await fetchQueue(false);
    } catch (err: unknown) {
      toast.error(getErrorMsg(err, 'Không thể cập nhật trạng thái đợt gọi món.'));
    } finally {
      setUpdatingBatchId(null);
    }
  };

  const handleUpdatePickupStatus = async (
    pickupOrderId: string,
    nextStatus: KitchenPickupTransitionStatus,
  ) => {
    setUpdatingPickupId(pickupOrderId);
    try {
      await kitchenService.updatePickupOrderStatus(pickupOrderId, nextStatus);
      toast.success('Đã cập nhật tiến độ đơn mang về!');
      await fetchQueue(false);
    } catch (err: unknown) {
      toast.error(getErrorMsg(err, 'Không thể cập nhật đơn mang về.'));
    } finally {
      setUpdatingPickupId(null);
    }
  };

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    navigate('/login');
  };

  const activeBranchName =
    branches.find((b) => b.id === activeBranchId)?.name ||
    userTyped?.branch?.name ||
    'Chi nhánh mặc định';

  const totalQueueCards = displayedBatches.length + filteredPickupOrders.length;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 text-gray-900 dark:text-white transition-colors">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
              <ChefHat size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Màn Hình Bếp (KDS)
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    socketConnected
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                      : 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                  }`}
                >
                  {socketConnected ? <Wifi size={11} /> : <WifiOff size={11} />}
                  {socketConnected ? 'Realtime Live' : 'Mất kết nối'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1.5">
                <Building2 size={12} className="text-primary shrink-0" />
                <span>{activeBranchName}</span>
                {userTyped?.fullName && <span>• {userTyped.fullName}</span>}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {needsBranchSelector && branches.length > 0 && (
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                aria-label="Chọn chi nhánh cho bếp"
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 outline-none focus:border-primary cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            )}

            {userTyped?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-xs font-semibold text-gray-700 dark:text-gray-200 inline-flex items-center gap-1.5"
              >
                <Shield size={14} />
                <span className="hidden sm:inline">Quản trị</span>
              </Link>
            )}

            {userTyped?.role === 'STAFF' && (
              <Link
                to="/staff"
                className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-xs font-semibold text-gray-700 dark:text-gray-200 inline-flex items-center gap-1.5"
              >
                <Shield size={14} />
                <span className="hidden sm:inline">Cổng phục vụ</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setSoundEnabled((v) => !v)}
              title={soundEnabled ? 'Tắt chuông báo đơn mới' : 'Bật chuông báo đơn mới'}
              className={`p-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1 cursor-pointer ${
                soundEnabled
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                  : 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Đổi giao diện Sáng/Tối"
              className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 cursor-pointer"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              type="button"
              onClick={() => fetchQueue(false)}
              disabled={refreshing || loading}
              className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-xs font-bold text-gray-700 dark:text-gray-200 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              aria-label="Đăng xuất"
              className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Tổng món/đơn đang xử lý
            </span>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {summary.totalActive}
            </p>
            <span className="text-[11px] text-gray-400">Tại bàn &amp; Mang về</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1">
              <Clock size={13} /> Chờ làm (QUEUED)
            </span>
            <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-300">
              {summary.queuedCount}
            </p>
            <span className="text-[11px] text-blue-600/80 dark:text-blue-400/80">Món mới gửi xuống</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <Flame size={13} /> Đang nấu (PREPARING)
            </span>
            <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-300">
              {summary.preparingCount}
            </p>
            <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80">Đầu bếp đang chế biến</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <Sparkles size={13} /> Đã xong (READY)
            </span>
            <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {summary.readyCount}
            </p>
            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">Chờ phục vụ / khách nhận</span>
          </div>
        </div>

        {/* Source & Status Filter Toolbar */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          {/* Source Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { value: 'ALL', label: 'Tất cả nguồn', icon: null },
                { value: 'DINE_IN', label: `Tại bàn (${dineInBatches.length})`, icon: <Utensils size={13} /> },
                { value: 'PICKUP', label: `Mang về (${filteredPickupOrders.length})`, icon: <ShoppingBag size={13} /> },
              ] as { value: KitchenSourceFilter; label: string; icon: React.ReactNode }[]
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSourceFilter(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  sourceFilter === opt.value
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { value: 'ALL', label: 'Mọi tiến độ' },
                { value: 'QUEUED', label: 'Chờ làm' },
                { value: 'PREPARING', label: 'Đang nấu' },
                { value: 'READY', label: 'Đã xong' },
              ] as { value: KitchenStatusFilter; label: string }[]
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === opt.value
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Queue Content */}
        {loading ? (
          <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Đang tải danh sách đơn chế biến...
            </p>
          </div>
        ) : errorMsg ? (
          <div className="p-8 text-center bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900 space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <p className="text-sm font-bold text-red-700 dark:text-red-300">{errorMsg}</p>
            <button
              type="button"
              onClick={() => fetchQueue(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Thử lại</span>
            </button>
          </div>
        ) : totalQueueCards === 0 ? (
          <div className="p-14 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 size={30} />
            </div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              Nhà bếp hiện đang trống đơn!
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Khi khách hàng tại bàn quét QR gọi món hoặc có đơn mang về được duyệt, phiếu bếp sẽ tự động xuất hiện ngay tại đây theo thời gian thực.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
            {displayedBatches.map((batch) => (
              <KitchenDineInBatchCard
                key={`batch-${batch.id}`}
                batch={batch}
                nowMs={nowMs}
                updatingItemId={updatingItemId}
                updatingBatchId={updatingBatchId}
                onUpdateItemStatus={handleUpdateItemStatus}
                onRequestCancelItem={(item, batchLabel) => {
                  setCancelTarget({ item, batchLabel });
                  setCancelReason(CANCEL_PRESETS[0]);
                }}
                onUpdateBatchStatus={handleUpdateBatchStatus}
              />
            ))}

            {filteredPickupOrders.map((order) => (
              <KitchenPickupOrderCard
                key={`pickup-${order.id}`}
                order={order}
                updatingOrderId={updatingPickupId}
                onUpdateStatus={handleUpdatePickupStatus}
              />
            ))}
          </div>
        )}
      </main>

      {/* Cancel Item Reason Modal */}
      <Modal
        isOpen={Boolean(cancelTarget)}
        onClose={() => !cancellingItem && setCancelTarget(null)}
        title="Báo hết / Hủy món"
        subtitle={
          cancelTarget
            ? `${cancelTarget.batchLabel} • ${cancelTarget.item.quantity}x ${cancelTarget.item.menuItem?.name}`
            : ''
        }
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Chọn nhanh lý do:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CANCEL_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCancelReason(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer ${
                    cancelReason === preset
                      ? 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300'
                      : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Lý do cụ thể (hiển thị cho bàn &amp; thu ngân):
            </label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do hủy món..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={cancellingItem}
              onClick={() => setCancelTarget(null)}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 text-xs font-semibold cursor-pointer"
            >
              Quay lại
            </button>
            <button
              type="button"
              disabled={cancellingItem}
              onClick={handleConfirmCancelItem}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
            >
              {cancellingItem ? 'Đang xử lý...' : 'Xác nhận hủy món'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title="Đăng xuất khỏi màn hình Bếp?"
        message="Bạn có chắc chắn muốn đăng xuất tài khoản khỏi thiết bị bếp này?"
        confirmText="Đăng xuất"
        cancelText="Ở lại"
        type="warning"
      />
    </div>
  );
};
export default KitchenDashboard;

