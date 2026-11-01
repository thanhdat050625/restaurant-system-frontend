import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  ChefHat,
  PackageCheck,
  Building2,
  Check,
  QrCode,
  XCircle,
  Camera,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../features/auth/AuthContext';
import { pickupOrderService } from '../../services/pickupOrderService';
import { socketService } from '../../services/socketService';
import { IPickupOrder, PickupOrderStatus } from '../../types/pickup-order.type';
import { formatPrice } from '../../utils/helpers';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import QrScannerModal from '../../components/common/QrScannerModal';

const statusConfig: Record<
  PickupOrderStatus,
  { label: string; bg: string; text: string; icon: React.ComponentType<any> }
> = {
  PENDING: {
    label: 'Chờ duyệt',
    bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    text: 'text-amber-800',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Đã nhận đơn',
    bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
    text: 'text-blue-800',
    icon: CheckCircle2,
  },
  PREPARING: {
    label: 'Bếp đang làm',
    bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
    text: 'text-purple-800',
    icon: ChefHat,
  },
  READY: {
    label: 'Sẵn sàng lấy',
    bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    text: 'text-emerald-800',
    icon: PackageCheck,
  },
  COMPLETED: {
    label: 'Đã giao món',
    bg: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    text: 'text-gray-700',
    icon: Check,
  },
  CANCELLED: {
    label: 'Đã hủy',
    bg: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
    text: 'text-red-800',
    icon: XCircle,
  },
};

export const StaffPickupOrders: React.FC = () => {
  const { user } = useAuth();
  const branchId = user?.branchId || user?.branch?.id;

  const [orders, setOrders] = useState<IPickupOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal chi tiết & xác minh
  const [selectedOrder, setSelectedOrder] = useState<IPickupOrder | null>(null);
  const [verifyCodeInput, setVerifyCodeInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Modal hủy đơn
  const [cancelOrderTarget, setCancelOrderTarget] = useState<IPickupOrder | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchOrders = useCallback(async (showSpinner = false) => {
    if (!branchId) return;
    if (showSpinner) setLoading(true);
    try {
      const res: any = await pickupOrderService.getPickupOrders({
        branchId,
        limit: 100,
      });
      const data = res?.data?.items || res?.items || res?.data || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchOrders(true);
  }, [fetchOrders]);

  // WebSocket realtime
  useEffect(() => {
    if (!branchId) return;

    socketService.connect(user?.id);
    socketService.joinBranch(branchId);

    const handleNewOrder = () => {
      toast.success('Có đơn đặt món mang về mới!');
      fetchOrders(false);
    };

    const handleStatusChanged = () => {
      fetchOrders(false);
    };

    socketService.on('pickupOrder:created', handleNewOrder);
    socketService.on('pickupOrder:statusChanged', handleStatusChanged);

    return () => {
      socketService.off('pickupOrder:created', handleNewOrder);
      socketService.off('pickupOrder:statusChanged', handleStatusChanged);
      socketService.leaveBranch(branchId);
    };
  }, [branchId, user, fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: PickupOrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await pickupOrderService.updatePickupOrderStatus(orderId, newStatus);
      toast.success(`Đã chuyển trạng thái sang "${statusConfig[newStatus]?.label}".`);
      fetchOrders(false);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật trạng thái đơn.');
    } finally {
      setUpdatingOrderId(null);
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
      // Chuỗi bình thường, không phải JSON
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
      fetchOrders(false);
      if (updated) setSelectedOrder(updated);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Mã nhận hàng không đúng hoặc không thuộc chi nhánh.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelOrderTarget) return;
    try {
      await pickupOrderService.cancelPickupOrder(cancelOrderTarget.id, cancelReason);
      toast.success('Đã hủy đơn hàng mang về.');
      setCancelOrderTarget(null);
      setCancelReason('');
      fetchOrders(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể hủy đơn.');
    }
  };

  if (!branchId) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-200">
        <Building2 size={48} className="mx-auto text-gray-400 mb-3" />
        <h3 className="text-base font-bold text-gray-800">Tài khoản chưa được gán chi nhánh</h3>
        <p className="text-xs text-gray-500 mt-1">
          Vui lòng liên hệ Quản trị viên để phân quyền chi nhánh làm việc cho bạn.
        </p>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matchCode = o.orderCode?.toLowerCase().includes(term);
      const matchName = o.customerName?.toLowerCase().includes(term);
      const matchPhone = o.customerPhone?.includes(term);
      if (!matchCode && !matchName && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="min-h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="text-primary" size={24} />
            <span>Quản Lý Đơn Mang Về (Pick-up)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Theo dõi danh sách khách đặt món trước và hẹn giờ ghé lấy tại chi nhánh (RRMS-32)
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Camera QR Scanner Button */}
          <button
            type="button"
            onClick={() => setIsScanModalOpen(true)}
            className="px-3.5 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title="Bật Camera để quét mã QR trên điện thoại của khách hàng"
          >
            <Camera size={15} />
            <span>Quét QR Camera</span>
          </button>

          {/* Quick verification input / Barcode gun */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <QrCode size={16} className="text-primary ml-1" />
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
            className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn (PU-...), tên khách hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'PENDING', label: 'Chờ duyệt' },
            { id: 'CONFIRMED', label: 'Đã nhận' },
            { id: 'PREPARING', label: 'Đang nấu' },
            { id: 'READY', label: 'Sẵn sàng lấy' },
            { id: 'COMPLETED', label: 'Đã giao' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 text-xs">Đang tải danh sách đơn mang về...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-sm font-bold text-gray-700">Chưa có đơn hàng nào</h3>
          <p className="text-xs text-gray-400 mt-1">Các đơn đặt món mang về của khách sẽ xuất hiện tại đây.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const conf = statusConfig[order.status] || statusConfig.PENDING;
            const StatusIcon = conf.icon;
            const isUpdating = updatingOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between gap-4 hover:border-primary/40 transition-all"
              >
                <div>
                  {/* Top line */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono font-bold text-sm text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                      {order.orderCode}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${conf.bg}`}>
                      <StatusIcon size={12} />
                      <span>{conf.label}</span>
                    </span>
                  </div>

                  {/* Customer & Time */}
                  <div className="space-y-1 mb-3">
                    <h3 className="text-sm font-bold text-gray-800">{order.customerName}</h3>
                    <p className="text-xs text-gray-500 font-mono">{order.customerPhone}</p>
                    <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200/80">
                      <Clock size={13} className="text-amber-600" />
                      <span>Hẹn lấy: {order.pickupTime} ({new Date(order.pickupDate).toLocaleDateString('vi-VN')})</span>
                    </div>
                  </div>

                  {/* Items list preview */}
                  <div className="space-y-1 pt-2 border-t border-gray-100 text-xs">
                    {(order.items || []).slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between text-gray-600">
                        <span>
                          {item.quantity}x {item.menuItem?.name || 'Món ăn'}
                        </span>
                        <span className="font-medium text-gray-800">{formatPrice(Number(item.subtotal))}</span>
                      </div>
                    ))}
                    {(order.items?.length || 0) > 3 && (
                      <p className="text-[11px] text-gray-400 italic">
                        + {(order.items?.length || 0) - 3} món khác...
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-medium">Tổng tiền:</span>
                    <span className="font-extrabold text-sm text-primary">
                      {formatPrice(Number(order.totalAmount))}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Chi tiết
                  </button>

                  {order.status === 'PENDING' && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                      className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Tiếp nhận
                    </button>
                  )}

                  {order.status === 'CONFIRMED' && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                      className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Báo bếp nấu
                    </button>
                  )}

                  {order.status === 'PREPARING' && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(order.id, 'READY')}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Đã nấu xong
                    </button>
                  )}

                  {order.status === 'READY' && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                      className="flex-1 py-2 px-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Đã giao món
                    </button>
                  )}

                  {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                    <button
                      type="button"
                      onClick={() => setCancelOrderTarget(order)}
                      className="py-2 px-2.5 text-red-500 hover:bg-red-50 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                      title="Hủy đơn"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Chi tiết đơn hàng */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Chi tiết đơn mang về #${selectedOrder?.orderCode}`}
      >
        {selectedOrder && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-bold text-sm text-gray-800">{selectedOrder.customerName}</p>
                <p className="text-gray-500 font-mono">{selectedOrder.customerPhone}</p>
                {selectedOrder.customerEmail && <p className="text-gray-400">{selectedOrder.customerEmail}</p>}
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig[selectedOrder.status]?.bg}`}>
                  {statusConfig[selectedOrder.status]?.label}
                </span>
                <p className="text-[11px] text-gray-500 mt-1">
                  Giờ hẹn: <strong>{selectedOrder.pickupTime}</strong>
                </p>
              </div>
            </div>

            {selectedOrder.specialNotes && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <span className="font-bold">Ghi chú của khách:</span> "{selectedOrder.specialNotes}"
              </div>
            )}

            <div>
              <h4 className="font-bold text-gray-700 mb-2">Danh sách món ăn ({selectedOrder.items?.length || 0}):</h4>
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

            <div className="pt-2 flex justify-between items-center text-sm font-bold border-t border-gray-100">
              <span>Tổng tiền thanh toán:</span>
              <span className="text-primary text-base">{formatPrice(Number(selectedOrder.totalAmount))}</span>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Cancel Modal */}
      <ConfirmModal
        isOpen={!!cancelOrderTarget}
        title="Xác nhận hủy đơn mang về"
        message={`Bạn có chắc muốn hủy đơn #${cancelOrderTarget?.orderCode} của khách ${cancelOrderTarget?.customerName}?`}
        confirmText="Hủy đơn"
        cancelText="Đóng"
        type="danger"
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

export default StaffPickupOrders;
