import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  UtensilsCrossed,
  Building2,
  Check,
  XCircle,
  Camera,
  MapPin,
  Users,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../features/auth/AuthContext';
import { reservationService } from '../../services/reservationService';
import { socketService } from '../../services/socketService';
import { IReservation, ReservationStatus } from '../../types/reservation.type';
import { ReservationDetailModal } from './StaffReservations/ReservationDetailModal';
import { AssignTableModal } from './StaffReservations/AssignTableModal';
import { OrderFoodModal } from '../Reservation/OrderFoodModal';
import QrScannerModal from '../../components/common/QrScannerModal';
import ConfirmModal from '../../components/ui/ConfirmModal';

const statusConfig: Record<
  ReservationStatus,
  { label: string; badge: string; text: string; icon: React.ComponentType<any> }
> = {
  PENDING: {
    label: 'Chờ duyệt',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300',
    text: 'text-amber-800',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Đã nhận chỗ',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300',
    text: 'text-blue-800',
    icon: CheckCircle2,
  },
  SEATED: {
    label: 'Đang dùng bữa',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
    text: 'text-emerald-800',
    icon: UtensilsCrossed,
  },
  COMPLETED: {
    label: 'Hoàn thành',
    badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300',
    text: 'text-gray-700',
    icon: Check,
  },
  CANCELLED: {
    label: 'Đã hủy',
    badge: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300',
    text: 'text-red-800',
    icon: XCircle,
  },
  NO_SHOW: {
    label: 'Khách vắng mặt',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300',
    text: 'text-purple-800',
    icon: AlertTriangle,
  },
};

export const StaffReservations: React.FC = () => {
  const { user } = useAuth();
  const branchId = (user as any)?.branchId || (user as any)?.branch?.id;

  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [detailTarget, setDetailTarget] = useState<IReservation | null>(null);
  const [assignTableTarget, setAssignTableTarget] = useState<IReservation | null>(null);
  const [orderFoodTarget, setOrderFoodTarget] = useState<IReservation | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Cancel modal
  const [cancelTarget, setCancelTarget] = useState<IReservation | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchReservations = useCallback(
    async (showLoading = false) => {
      if (!branchId) return;
      if (showLoading) setLoading(true);
      try {
        const res: any = await reservationService.getReservations({
          branchId,
          fromDate: dateFilter,
          toDate: dateFilter,
          limit: 100,
        });
        const items = res?.data?.items || res?.items || res?.data || [];
        setReservations(Array.isArray(items) ? items : []);
      } catch {
        setReservations([]);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [branchId, dateFilter],
  );

  useEffect(() => {
    fetchReservations(true);
  }, [fetchReservations]);

  // Real-time WebSocket sync
  useEffect(() => {
    if (!branchId) return;

    socketService.connect((user as any)?.id);
    socketService.joinBranch(branchId);

    const handleRefresh = () => fetchReservations(false);
    const handleNewReservation = () => {
      toast('Có đơn đặt bàn mới!', { icon: '🔔' });
      fetchReservations(false);
    };

    socketService.on('reservation:created', handleNewReservation);
    socketService.on('reservation:updated', handleRefresh);
    socketService.on('table:status_changed', handleRefresh);
    socketService.on('table:reserved', handleRefresh);

    return () => {
      socketService.off('reservation:created', handleNewReservation);
      socketService.off('reservation:updated', handleRefresh);
      socketService.off('table:status_changed', handleRefresh);
      socketService.off('table:reserved', handleRefresh);
      socketService.leaveBranch(branchId);
    };
  }, [branchId, user, fetchReservations]);

  // Tiếp nhận / Xác nhận đơn
  const handleConfirmReservation = async (reservation: IReservation) => {
    setUpdatingId(reservation.id);
    try {
      await reservationService.updateStatus(reservation.id, 'CONFIRMED');
      toast.success(`Đã tiếp nhận đơn đặt bàn #${reservation.reservationCode}.`);
      fetchReservations(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể xác nhận đơn đặt bàn.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Khách đến ăn / Check-in vào bàn
  const handleSeatCustomer = async (reservation: IReservation) => {
    // Nếu chưa có bàn cụ thể -> mở modal xếp bàn
    if (!reservation.tableId) {
      setAssignTableTarget(reservation);
      return;
    }

    setUpdatingId(reservation.id);
    try {
      await reservationService.updateStatus(reservation.id, 'SEATED');
      toast.success(
        `Khách đã vào bàn ${reservation.table?.tableNumber || ''}. Bàn đã chuyển sang trạng thái Có khách.`,
      );
      fetchReservations(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể check-in khách vào bàn.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Hoàn thành bữa ăn -> tự động đưa bàn vào hàng chờ dọn
  const handleCompleteReservation = async (reservation: IReservation) => {
    setUpdatingId(reservation.id);
    try {
      await reservationService.updateStatus(reservation.id, 'COMPLETED');
      toast.success(
        `Đã hoàn thành bữa ăn #${reservation.reservationCode}. Bàn đã chuyển sang hàng đợi Cần dọn dẹp.`,
      );
      fetchReservations(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể hoàn thành đơn.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Khách không đến
  const handleNoShow = async (reservation: IReservation) => {
    setUpdatingId(reservation.id);
    try {
      await reservationService.updateStatus(reservation.id, 'NO_SHOW', 'Khách không đến theo lịch');
      toast.success(`Đã ghi nhận khách vắng mặt cho đơn #${reservation.reservationCode}.`);
      fetchReservations(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật trạng thái.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Hủy đơn
  const handleCancelSubmit = async () => {
    if (!cancelTarget) return;
    setUpdatingId(cancelTarget.id);
    try {
      await reservationService.cancelReservation(cancelTarget.id, cancelReason || 'Nhà hàng hủy đơn');
      toast.success(`Đã hủy đơn đặt bàn #${cancelTarget.reservationCode}.`);
      setCancelTarget(null);
      setCancelReason('');
      fetchReservations(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể hủy đơn đặt bàn.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Xếp bàn và check-in vào bàn cùng lúc từ AssignTableModal
  const handleAssignTableConfirm = async (tableId: string) => {
    if (!assignTableTarget) return;
    try {
      await reservationService.updateStatus(
        assignTableTarget.id,
        'SEATED',
        'Xếp bàn và check-in phục vụ',
        tableId,
      );
      toast.success('Đã xếp bàn thành công và đưa khách vào bàn.');
      setAssignTableTarget(null);
      fetchReservations(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể xếp bàn.');
      throw err;
    }
  };

  // Xử lý quét mã QR Check-in
  const handleScanSuccess = async (decodedText: string) => {
    let code = decodedText.trim();
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed.code) code = parsed.code;
    } catch {}

    try {
      const res: any = await reservationService.checkInQr(code);
      const data = res?.data?.data || res?.data || res;
      toast.success(`Check-in thành công cho khách ${data?.customerName || code}!`);
      fetchReservations(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || `Mã QR không hợp lệ hoặc không tìm thấy đơn: ${code}`);
    }
  };

  if (!branchId) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700">
        <Building2 size={48} className="mx-auto text-gray-400 mb-3" />
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
          Tài khoản chưa được gán chi nhánh
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Vui lòng liên hệ Quản trị viên để phân quyền chi nhánh làm việc cho bạn.
        </p>
      </div>
    );
  }

  // KPI counts
  const summary = {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === 'PENDING').length,
    confirmed: reservations.filter((r) => r.status === 'CONFIRMED').length,
    seated: reservations.filter((r) => r.status === 'SEATED').length,
    completed: reservations.filter((r) => r.status === 'COMPLETED').length,
  };

  // Filtered list
  const filteredReservations = reservations.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const codeMatch = r.reservationCode.toLowerCase().includes(term);
      const nameMatch = r.customerName.toLowerCase().includes(term);
      const phoneMatch = r.customerPhone.includes(term);
      const tableMatch = r.table?.tableNumber?.toLowerCase().includes(term);
      if (!codeMatch && !nameMatch && !phoneMatch && !tableMatch) return false;
    }
    return true;
  });

  return (
    <div className="min-h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <CalendarCheck className="text-primary" size={24} />
            Quản lý đặt bàn
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Tiếp nhận, xếp bàn và theo dõi trạng thái dùng bữa của khách theo thời gian thực.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsScanModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 bg-primary hover:bg-primary-hover active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Camera size={16} />
            <span>Quét QR Check-in</span>
          </button>
          <button
            type="button"
            onClick={() => fetchReservations(true)}
            disabled={loading}
            className="p-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-primary' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Tổng lượt hẹn</span>
          <p className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mt-1">{summary.total}</p>
        </div>
        <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/40">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Chờ tiếp nhận
          </span>
          <p className="text-2xl font-extrabold text-amber-800 dark:text-amber-300 mt-1">{summary.pending}</p>
        </div>
        <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/40">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            Đã nhận chỗ
          </span>
          <p className="text-2xl font-extrabold text-blue-800 dark:text-blue-300 mt-1">{summary.confirmed}</p>
        </div>
        <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/40">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Đang dùng bữa
          </span>
          <p className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300 mt-1">{summary.seated}</p>
        </div>
        <div className="p-3.5 bg-gray-50 dark:bg-slate-800/80 rounded-2xl border border-gray-200 dark:border-slate-700 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Hoàn thành</span>
          <p className="text-2xl font-extrabold text-gray-700 dark:text-gray-300 mt-1">{summary.completed}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đặt bàn, tên khách, số điện thoại, số bàn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-primary text-gray-800 dark:text-gray-100 placeholder-gray-400"
          />
        </div>

        {/* Date filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary cursor-pointer"
            />
          </div>
          <button
            type="button"
            onClick={() => setDateFilter(new Date().toISOString().split('T')[0])}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 cursor-pointer"
          >
            Hôm nay
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { key: 'ALL', label: 'Tất cả' },
          { key: 'PENDING', label: `Chờ duyệt (${summary.pending})` },
          { key: 'CONFIRMED', label: `Đã nhận chỗ (${summary.confirmed})` },
          { key: 'SEATED', label: `Đang ăn (${summary.seated})` },
          { key: 'COMPLETED', label: `Hoàn thành (${summary.completed})` },
          { key: 'CANCELLED', label: 'Đã hủy' },
          { key: 'NO_SHOW', label: 'Vắng mặt' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === tab.key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reservation List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-gray-400">
          <RefreshCw size={28} className="animate-spin text-primary" />
          <p className="text-xs">Đang tải danh sách đặt bàn...</p>
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-2">
          <CalendarCheck size={40} className="mx-auto text-gray-300 dark:text-gray-600" />
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Không có đơn đặt bàn nào</h3>
          <p className="text-xs text-gray-400">Không tìm thấy lượt hẹn phù hợp với bộ lọc hiện tại.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReservations.map((res) => {
            const statusCfg = statusConfig[res.status] || {
              label: res.status,
              badge: 'bg-gray-100 text-gray-700',
              text: 'text-gray-700',
              icon: Clock,
            };
            const StatusIcon = statusCfg.icon;
            const isUpdating = updatingId === res.id;
            const preOrdersCount = res.orders?.length || 0;

            return (
              <div
                key={res.id}
                className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-3 hover:border-primary/40 transition-all"
              >
                <div>
                  {/* Top Bar: Code, Time, Status */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div>
                      <span className="font-mono font-bold text-xs text-primary">#{res.reservationCode}</span>
                      <div className="flex items-center gap-1.5 text-sm font-extrabold text-gray-800 dark:text-gray-100 mt-0.5">
                        <Clock size={15} className="text-amber-500 shrink-0" />
                        <span>{res.reservationTime}</span>
                        <span className="text-[11px] font-normal text-gray-400">
                          ({res.reservationDate.split('T')[0]})
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusCfg.badge}`}
                    >
                      <StatusIcon size={12} />
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="p-2.5 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1 text-xs">
                    <p className="font-bold text-gray-800 dark:text-gray-100 truncate">{res.customerName}</p>
                    <p className="text-[11px] text-gray-500 font-mono">{res.customerPhone}</p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300">
                        <Users size={13} className="text-primary" />
                        {res.guestCount} người
                      </span>
                      {preOrdersCount > 0 && (
                        <span className="flex items-center gap-1 text-primary font-bold">
                          <UtensilsCrossed size={13} />
                          {preOrdersCount} món đặt trước
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Table Assignment Info */}
                  <div className="mt-2.5 flex items-center justify-between text-xs px-1">
                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                      <MapPin size={14} className="text-primary shrink-0" />
                      {res.table ? (
                        <span>
                          Bàn <strong className="text-primary font-bold">{res.table.tableNumber}</strong> (Tầng{' '}
                          {res.table.floor})
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          Chưa xếp bàn cụ thể
                        </span>
                      )}
                    </div>

                    {res.status === 'CONFIRMED' && (
                      <button
                        type="button"
                        onClick={() => setAssignTableTarget(res)}
                        className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                      >
                        {res.table ? 'Đổi bàn' : 'Xếp bàn'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-gray-100 dark:border-slate-700/60 flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDetailTarget(res)}
                    className="p-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors cursor-pointer"
                    title="Xem chi tiết"
                  >
                    <Eye size={15} />
                  </button>

                  <div className="flex items-center gap-1.5 flex-1 justify-end">
                    {/* Status PENDING: Tiếp nhận hoặc Hủy */}
                    {res.status === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => setCancelTarget(res)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleConfirmReservation(res)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          <Check size={14} />
                          <span>Tiếp nhận</span>
                        </button>
                      </>
                    )}

                    {/* Status CONFIRMED: Vào bàn hoặc Vắng mặt */}
                    {res.status === 'CONFIRMED' && (
                      <>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleNoShow(res)}
                          className="px-2.5 py-1.5 text-[11px] font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                          title="Báo khách vắng mặt"
                        >
                          Vắng mặt
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleSeatCustomer(res)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          <UtensilsCrossed size={14} />
                          <span>{res.tableId ? 'Vào bàn' : 'Xếp bàn & Vào'}</span>
                        </button>
                      </>
                    )}

                    {/* Status SEATED: Gọi thêm món hoặc Hoàn thành bữa ăn */}
                    {res.status === 'SEATED' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setOrderFoodTarget(res)}
                          className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                          title="Gọi thêm món tại bàn"
                        >
                          <UtensilsCrossed size={14} />
                          <span>Gọi món</span>
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleCompleteReservation(res)}
                          className="px-3 py-1.5 bg-primary hover:bg-primary-hover active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          <CheckCircle2 size={14} />
                          <span>Hoàn thành</span>
                        </button>
                      </>
                    )}

                    {/* Status CANCELLED / NO_SHOW / COMPLETED: Done badges */}
                    {['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(res.status) && (
                      <span className="text-[11px] text-gray-400 italic">Đã kết thúc</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ReservationDetailModal
        isOpen={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        reservation={detailTarget}
        onAssignTable={(r) => {
          setDetailTarget(null);
          setAssignTableTarget(r);
        }}
        onOrderFood={(r) => {
          setDetailTarget(null);
          setOrderFoodTarget(r);
        }}
      />

      <OrderFoodModal
        isOpen={Boolean(orderFoodTarget)}
        onClose={() => setOrderFoodTarget(null)}
        reservation={orderFoodTarget}
        onSuccess={() => fetchReservations(false)}
      />

      <AssignTableModal
        isOpen={Boolean(assignTableTarget)}
        onClose={() => setAssignTableTarget(null)}
        reservation={assignTableTarget}
        branchId={branchId}
        onConfirmAssign={handleAssignTableConfirm}
      />

      <QrScannerModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onScanSuccess={handleScanSuccess}
        title="Quét mã QR Check-in đặt bàn"
      />

      {/* Modal Hủy đặt bàn */}
      <ConfirmModal
        isOpen={Boolean(cancelTarget)}
        onClose={() => {
          setCancelTarget(null);
          setCancelReason('');
        }}
        onConfirm={handleCancelSubmit}
        title={`Hủy đơn đặt bàn #${cancelTarget?.reservationCode}`}
        message="Bạn có chắc chắn muốn hủy đơn đặt bàn này không? Nếu bàn đang được gán, hệ thống sẽ tự động giải phóng bàn về trạng thái Trống."
        confirmText="Xác nhận hủy"
        type="danger"
      >
        <div className="mt-3">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Lý do hủy đơn:
          </label>
          <input
            type="text"
            placeholder="Nhập lý do hủy (khách báo hủy, hết chỗ...)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary"
          />
        </div>
      </ConfirmModal>
    </div>
  );
};
