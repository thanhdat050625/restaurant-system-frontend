import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Clock, Building2, QrCode, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { pickupOrderService } from '../../services/pickupOrderService';
import { IPickupOrder } from '../../types/pickup-order.type';
import { formatPrice } from '../../utils/helpers';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Modal from '../../components/ui/Modal';

export const ProfilePickupOrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<IPickupOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // QR Modal
  const [selectedQrOrder, setSelectedQrOrder] = useState<IPickupOrder | null>(null);

  // Cancel Modal
  const [cancelTarget, setCancelTarget] = useState<IPickupOrder | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchMyOrders = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const res: any = await pickupOrderService.getMyPickupOrders({ limit: 50 });
      const data = res?.data?.items || res?.items || res?.data || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyOrders(true);
  }, [fetchMyOrders]);

  const handleCancelOrder = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await pickupOrderService.cancelPickupOrder(cancelTarget.id, cancelReason);
      toast.success('Hủy đơn hàng mang về thành công.');
      setCancelTarget(null);
      setCancelReason('');
      fetchMyOrders(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể hủy đơn.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <ShoppingBag className="text-primary" size={22} />
            <span>Đơn Đặt Món Mang Về</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Danh sách các đơn đặt món mang về hẹn giờ ghé lấy tại chi nhánh
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchMyOrders(true)}
          disabled={loading}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-dark-border dark:hover:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 text-xs">Đang tải danh sách đơn mang về...</div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border">
          <ShoppingBag size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Chưa có đơn đặt mang về nào</h3>
          <p className="text-xs text-gray-400 mt-1">
            Bạn có thể chọn món tại Thực đơn và chọn giờ đến lấy để tiết kiệm thời gian chờ đợi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                  {order.orderCode}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    order.status === 'COMPLETED'
                      ? 'bg-gray-100 text-gray-700'
                      : order.status === 'READY'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'PREPARING'
                          ? 'bg-purple-100 text-purple-800'
                          : order.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {order.status === 'COMPLETED'
                    ? 'Đã lấy món'
                    : order.status === 'READY'
                      ? 'Sẵn sàng lấy'
                      : order.status === 'PREPARING'
                        ? 'Bếp đang làm'
                        : order.status === 'CONFIRMED'
                          ? 'Đã tiếp nhận'
                          : order.status === 'CANCELLED'
                            ? 'Đã hủy'
                            : 'Chờ duyệt'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                  <Building2 size={14} className="text-primary" />
                  <span>{order.branch?.name}</span>
                </h3>
                <p className="text-xs text-gray-400">{order.branch?.streetAddress || order.branch?.address}</p>
              </div>

              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-xl text-xs flex items-center justify-between text-amber-900 dark:text-amber-300">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Clock size={14} className="text-amber-600" />
                  <span>Hẹn lấy:</span>
                </div>
                <span className="font-bold">
                  {order.pickupTime} — {new Date(order.pickupDate).toLocaleDateString('vi-VN')}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.menuItem?.name}
                    </span>
                    <span className="font-semibold">{formatPrice(Number(item.subtotal))}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-dark-border flex justify-between items-center text-xs">
                <span className="text-gray-500">Tổng tiền:</span>
                <span className="font-extrabold text-sm text-primary">
                  {formatPrice(Number(order.totalAmount))}
                </span>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedQrOrder(order)}
                  className="flex-1 py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <QrCode size={14} />
                  <span>Mã nhận hàng</span>
                </button>

                {order.canCancel && (
                  <button
                    type="button"
                    onClick={() => setCancelTarget(order)}
                    className="py-2 px-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Hủy đơn
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal QR Code nhận món */}
      <Modal
        isOpen={!!selectedQrOrder}
        onClose={() => setSelectedQrOrder(null)}
        title="Mã Nhận Món Tại Quầy"
      >
        {selectedQrOrder && (
          <div className="text-center space-y-4 p-2">
            <p className="text-xs text-gray-500">
              Vui lòng xuất trình mã này cho nhân viên chi nhánh <strong>{selectedQrOrder.branch?.name}</strong> để nhận món nhanh chóng.
            </p>

            <div className="p-6 bg-white border border-gray-200 rounded-2xl inline-block shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  selectedQrOrder.qrPayload || selectedQrOrder.orderCode,
                )}`}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-medium">Mã Đơn Hàng</span>
              <p className="text-2xl font-mono font-extrabold text-primary tracking-wider">
                {selectedQrOrder.orderCode}
              </p>
              <p className="text-xs text-gray-500">
                Khung giờ hẹn lấy: <strong>{selectedQrOrder.pickupTime}</strong>
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Confirm Cancel */}
      <ConfirmModal
        isOpen={!!cancelTarget}
        title="Xác nhận hủy đơn đặt món mang về"
        message={`Bạn có chắc muốn hủy đơn #${cancelTarget?.orderCode}?`}
        confirmText="Hủy đơn"
        cancelText="Đóng"
        type="danger"
        isLoading={isCancelling}
        onConfirm={handleCancelOrder}
        onClose={() => {
          setCancelTarget(null);
          setCancelReason('');
        }}
      />
    </div>
  );
};
