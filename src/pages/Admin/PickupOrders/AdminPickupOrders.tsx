import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Clock,
  Eye,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  XCircle,
  AlertCircle,
  Camera,
  QrCode,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { pickupOrderService } from '../../../services/pickupOrderService';
import { branchService } from '../../../services/admin/branchService';
import { IPickupOrder, PickupOrderStatus } from '../../../types/pickup-order.type';
import { IBranch } from '../../../types/admin/branch.type';
import { PaginationMeta } from '../../../types/api-response.type';
import Pagination from '../../../components/common/Pagination';
import Modal from '../../../components/ui/Modal';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import QrScannerModal from '../../../components/common/QrScannerModal';
import { formatPrice } from '../../../utils/helpers';
import { socketService } from '../../../services/socketService';
import { useAuth } from '../../../features/auth/AuthContext';

const statusConfig: Record<
  PickupOrderStatus,
  { label: string; bg: string; text: string; badge: string }
> = {
  PENDING: {
    label: 'Chờ duyệt',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  CONFIRMED: {
    label: 'Đã nhận đơn',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  PREPARING: {
    label: 'Bếp đang làm',
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  READY: {
    label: 'Sẵn sàng lấy',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  COMPLETED: {
    label: 'Đã giao',
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    badge: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  CANCELLED: {
    label: 'Đã hủy',
    bg: 'bg-red-100',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-800 border-red-200',
  },
};

export const AdminPickupOrders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<IPickupOrder[]>([]);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<IPickupOrder | null>(null);

  // Cancel Modal
  const [cancelOrderTarget, setCancelOrderTarget] = useState<IPickupOrder | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Scanner Modal
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [verifyCodeInput, setVerifyCodeInput] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Load branches for filter
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res: any = await branchService.getBranches({ limit: 100 });
        const list = Array.isArray(res) ? res : res?.data || [];
        setBranches(list);
      } catch {
        setBranches([]);
      }
    };
    fetchBranches();
  }, []);

  const fetchOrders = useCallback(
    async (showSpinner = true) => {
      try {
        if (showSpinner) setLoading(true);
        const params: any = { page, limit };
        if (search.trim()) params.search = search.trim();
        if (selectedBranchId !== 'ALL') params.branchId = selectedBranchId;
        if (statusFilter !== 'ALL') params.status = statusFilter;

        const res: any = await pickupOrderService.getPickupOrders(params);
        const data = res?.data?.items || res?.items || res?.data || [];
        const resMeta = res?.data?.meta || res?.meta || null;

        setOrders(Array.isArray(data) ? data : []);
        setMeta(resMeta);
      } catch {
        setOrders([]);
        setMeta(null);
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [page, limit, search, selectedBranchId, statusFilter]
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // WebSocket realtime update
  useEffect(() => {
    socketService.connect(user?.id);

    const handleRefresh = () => {
      fetchOrders(false);
    };

    socketService.on('pickupOrder:created', handleRefresh);
    socketService.on('pickupOrder:statusChanged', handleRefresh);

    return () => {
      socketService.off('pickupOrder:created', handleRefresh);
      socketService.off('pickupOrder:statusChanged', handleRefresh);
    };
  }, [user, fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: PickupOrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await pickupOrderService.updatePickupOrderStatus(orderId, newStatus);
      toast.success(`Cập nhật đơn sang "${statusConfig[newStatus]?.label || newStatus}" thành công!`);
      await fetchOrders(false);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật trạng thái đơn.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelOrderTarget) return;
    setIsCancelling(true);
    try {
      await pickupOrderService.cancelPickupOrder(
        cancelOrderTarget.id,
        cancelReason.trim() || 'Quản trị viên hủy đơn'
      );
      toast.success(`Đã hủy đơn hàng #${cancelOrderTarget.orderCode}`);
      setCancelOrderTarget(null);
      setCancelReason('');
      await fetchOrders(false);
      if (selectedOrder?.id === cancelOrderTarget.id) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                status: 'CANCELLED',
                cancelledReason: cancelReason.trim() || 'Quản trị viên hủy đơn',
              }
            : null
        );
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể hủy đơn hàng.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleVerifyCode = async (codeOverride?: string) => {
    let code = (codeOverride || verifyCodeInput).trim();
    try {
      const parsed = JSON.parse(code);
      if (parsed && typeof parsed === 'object' && parsed.code) {
        code = String(parsed.code).trim();
      }
    } catch {
      // Chuỗi bình thường
    }
    code = code.replace(/^["']|["']$/g, '').toUpperCase();

    if (!code) {
      toast.error('Vui lòng nhập hoặc quét mã nhận hàng');
      return;
    }
    setIsVerifying(true);
    try {
      const res: any = await pickupOrderService.verifyPickupCode(code);
      const updated = res?.data || res;
      toast.success(`Xác minh mã ${code} thành công! Đã hoàn tất giao món cho khách.`);
      setVerifyCodeInput('');
      await fetchOrders(false);
      if (updated) setSelectedOrder(updated);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không tìm thấy đơn hàng với mã này.');
    } finally {
      setIsVerifying(false);
    }
  };

  const totalRevenue = orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="text-primary" size={24} />
            <span>Quản Lý Đơn Mang Về Toàn Chuỗi</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Theo dõi, tra cứu và kiểm soát tình hình đặt món mang về ghé lấy tại các chi nhánh (RRMS-32)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Camera Scanner Button */}
          <button
            type="button"
            onClick={() => setIsScanModalOpen(true)}
            className="px-3.5 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title="Bật Camera để quét mã QR trên điện thoại của khách hàng"
          >
            <Camera size={14} />
            <span>Quét QR Camera</span>
          </button>

          {/* Quick verification input / Barcode gun */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <QrCode size={15} className="text-primary ml-1" />
            <input
              type="text"
              placeholder="Nhập hoặc bắn mã (PU-...)"
              value={verifyCodeInput}
              onChange={(e) => setVerifyCodeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
              className="text-xs px-2 py-1 outline-none w-44"
            />
            <button
              type="button"
              onClick={() => handleVerifyCode()}
              disabled={isVerifying}
              className="px-3 py-1 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? 'Đang kiểm tra...' : 'Đối chiếu'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => fetchOrders(true)}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-xs text-gray-500 font-medium">Tổng số đơn (trang hiện tại)</span>
          <p className="text-2xl font-extrabold text-gray-800">{orders.length}</p>
          <span className="text-[11px] text-gray-400">Tổng toàn hệ thống: {meta?.totalItems || 0}</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-blue-200 bg-blue-50/50 shadow-sm space-y-1">
          <span className="text-xs text-blue-700 font-medium">Đang xử lý</span>
          <p className="text-2xl font-extrabold text-blue-700">
            {orders.filter((o) => ['PENDING', 'CONFIRMED', 'PREPARING'].includes(o.status)).length}
          </p>
          <span className="text-[11px] text-blue-600">Chờ nhận & đang làm</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 bg-emerald-50/50 shadow-sm space-y-1">
          <span className="text-xs text-emerald-700 font-medium">Đã giao thành công</span>
          <p className="text-2xl font-extrabold text-emerald-700">
            {orders.filter((o) => o.status === 'COMPLETED').length}
          </p>
          <span className="text-[11px] text-emerald-600">Khách đã nhận món</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-primary/20 bg-primary/5 shadow-sm space-y-1">
          <span className="text-xs text-primary font-medium">Doanh thu hoàn tất</span>
          <p className="text-2xl font-extrabold text-primary">{formatPrice(totalRevenue)}</p>
          <span className="text-[11px] text-gray-400">Từ các đơn COMPLETED</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn (PU-...), tên khách hoặc số điện thoại..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedBranchId}
            onChange={(e) => {
              setSelectedBranchId(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none"
          >
            <option value="ALL">Tất cả chi nhánh</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="CONFIRMED">Đã nhận đơn</option>
            <option value="PREPARING">Bếp đang làm</option>
            <option value="READY">Sẵn sàng lấy</option>
            <option value="COMPLETED">Đã giao</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="p-3.5">MÃ ĐƠN</th>
                <th className="p-3.5">KHÁCH HÀNG</th>
                <th className="p-3.5">CHI NHÁNH</th>
                <th className="p-3.5">GIỜ HẸN LẤY</th>
                <th className="p-3.5">TỔNG TIỀN</th>
                <th className="p-3.5">TRẠNG THÁI</th>
                <th className="p-3.5 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    <RefreshCw size={20} className="animate-spin inline mr-2 text-primary" />
                    Đang tải danh sách đơn mang về...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    Không tìm thấy đơn hàng mang về nào.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isUpdating = updatingOrderId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-3.5 font-bold font-mono text-primary text-[11px]">
                        {order.orderCode}
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-gray-800">{order.customerName}</p>
                        <p className="text-[11px] text-gray-400 font-mono">{order.customerPhone}</p>
                      </td>
                      <td className="p-3.5 text-gray-600 font-medium">
                        {order.branch?.name || 'Chi nhánh'}
                      </td>
                      <td className="p-3.5 text-gray-600">
                        <div className="flex items-center gap-1 font-semibold text-gray-800">
                          <Clock size={12} className="text-gray-400" />
                          <span>{order.pickupTime}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {new Date(order.pickupDate).toLocaleDateString('vi-VN')}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-gray-800">
                        {formatPrice(Number(order.totalAmount))}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block border ${
                            statusConfig[order.status]?.badge || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {statusConfig[order.status]?.label || order.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Quick Status Action Buttons */}
                          {order.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                              disabled={isUpdating}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg inline-flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                              title="Xác nhận nhận đơn"
                            >
                              <CheckCircle2 size={13} />
                              <span>Duyệt đơn</span>
                            </button>
                          )}

                          {order.status === 'CONFIRMED' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                              disabled={isUpdating}
                              className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg inline-flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                              title="Chuyển bếp làm món"
                            >
                              <ChefHat size={13} />
                              <span>Bếp làm</span>
                            </button>
                          )}

                          {order.status === 'PREPARING' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'READY')}
                              disabled={isUpdating}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg inline-flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                              title="Món đã sẵn sàng lấy"
                            >
                              <PackageCheck size={13} />
                              <span>Sẵn sàng</span>
                            </button>
                          )}

                          {order.status === 'READY' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                              disabled={isUpdating}
                              className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg inline-flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                              title="Khách đã nhận món"
                            >
                              <CheckCircle2 size={13} />
                              <span>Hoàn thành</span>
                            </button>
                          )}

                          {/* Detail Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Eye size={13} />
                            <span>Xem</span>
                          </button>

                          {/* Quick Cancel Button */}
                          {['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status) && (
                            <button
                              type="button"
                              onClick={() => {
                                setCancelOrderTarget(order);
                                setCancelReason('');
                              }}
                              className="px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-lg font-medium inline-flex items-center gap-0.5 cursor-pointer transition-colors"
                              title="Hủy đơn hàng"
                            >
                              <XCircle size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination
              meta={meta}
              onPageChange={(p) => setPage(p)}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Modal Detail & Full Status Management */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Chi tiết đơn mang về #${selectedOrder?.orderCode}`}
      >
        {selectedOrder && (
          <div className="space-y-4 text-xs">
            {/* Header / Customer Info */}
            <div className="flex justify-between items-start p-3.5 bg-gray-50 rounded-xl">
              <div>
                <p className="font-bold text-sm text-gray-800">{selectedOrder.customerName}</p>
                <p className="text-gray-500 font-mono text-xs">{selectedOrder.customerPhone}</p>
                {selectedOrder.customerEmail && (
                  <p className="text-gray-400 text-[11px]">{selectedOrder.customerEmail}</p>
                )}
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-800 text-xs">{selectedOrder.branch?.name}</span>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Giờ hẹn: <strong>{selectedOrder.pickupTime}</strong> —{' '}
                  {new Date(selectedOrder.pickupDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>

            {/* Special Notes */}
            {selectedOrder.specialNotes && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <span className="font-bold">Ghi chú của khách:</span> "{selectedOrder.specialNotes}"
              </div>
            )}

            {/* Cancelled Reason */}
            {selectedOrder.status === 'CANCELLED' && selectedOrder.cancelledReason && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-900 flex items-start gap-2">
                <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Lý do hủy đơn:</span> {selectedOrder.cancelledReason}
                </div>
              </div>
            )}

            {/* Status Management Box for Admin */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-amber-50/30 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800">Cập nhật trạng thái đơn hàng:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    statusConfig[selectedOrder.status]?.badge || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                </span>
              </div>

              {/* Step Flow Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {selectedOrder.status === 'PENDING' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'CONFIRMED')}
                    disabled={updatingOrderId === selectedOrder.id}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} />
                    <span>Xác nhận nhận đơn (CONFIRMED)</span>
                  </button>
                )}

                {selectedOrder.status === 'CONFIRMED' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'PREPARING')}
                    disabled={updatingOrderId === selectedOrder.id}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <ChefHat size={14} />
                    <span>Chuyển bếp nấu món (PREPARING)</span>
                  </button>
                )}

                {selectedOrder.status === 'PREPARING' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'READY')}
                    disabled={updatingOrderId === selectedOrder.id}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <PackageCheck size={14} />
                    <span>Món đã xong - Sẵn sàng lấy (READY)</span>
                  </button>
                )}

                {selectedOrder.status === 'READY' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'COMPLETED')}
                    disabled={updatingOrderId === selectedOrder.id}
                    className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} />
                    <span>Khách đã nhận món - Hoàn tất (COMPLETED)</span>
                  </button>
                )}

                {['PENDING', 'CONFIRMED', 'PREPARING'].includes(selectedOrder.status) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCancelOrderTarget(selectedOrder);
                      setCancelReason('');
                    }}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <XCircle size={14} />
                    <span>Hủy đơn</span>
                  </button>
                )}
              </div>

              {/* Direct Status Selector for Administrator Override */}
              <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-500 font-medium">Chuyển trực tiếp trạng thái:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleUpdateStatus(selectedOrder.id, e.target.value as PickupOrderStatus)
                  }
                  disabled={updatingOrderId === selectedOrder.id}
                  className="px-2.5 py-1 text-xs bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-50"
                >
                  <option value="PENDING">Chờ duyệt (PENDING)</option>
                  <option value="CONFIRMED">Đã nhận đơn (CONFIRMED)</option>
                  <option value="PREPARING">Bếp đang làm (PREPARING)</option>
                  <option value="READY">Sẵn sàng lấy (READY)</option>
                  <option value="COMPLETED">Đã giao thành công (COMPLETED)</option>
                  <option value="CANCELLED">Đã hủy (CANCELLED)</option>
                </select>
              </div>
            </div>

            {/* Items List */}
            <div>
              <h4 className="font-bold text-gray-700 mb-2">Món đã đặt ({selectedOrder.items?.length || 0}):</h4>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {(selectedOrder.items || []).map((item) => (
                  <div key={item.id} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {item.quantity}x {item.menuItem?.name}
                      </p>
                      {item.note && <p className="text-[11px] text-gray-400 italic">"{item.note}"</p>}
                    </div>
                    <span className="font-bold text-gray-700">{formatPrice(Number(item.subtotal))}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-2 flex justify-between items-center text-sm font-bold border-t border-gray-100">
              <span>Tổng cộng:</span>
              <span className="text-primary text-base">{formatPrice(Number(selectedOrder.totalAmount))}</span>
            </div>

            {/* Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Order Modal */}
      <ConfirmModal
        isOpen={!!cancelOrderTarget}
        title="Xác nhận hủy đơn hàng mang về"
        message={`Bạn có chắc chắn muốn hủy đơn #${cancelOrderTarget?.orderCode} của khách ${cancelOrderTarget?.customerName}?`}
        confirmText="Hủy đơn"
        cancelText="Đóng"
        type="danger"
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onClose={() => {
          setCancelOrderTarget(null);
          setCancelReason('');
        }}
      />

      {/* Camera QR Scanner Modal */}
      <QrScannerModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onScanSuccess={(code) => handleVerifyCode(code)}
        title="Quét mã QR nhận món của khách hàng"
      />
    </div>
  );
};

export default AdminPickupOrders;
