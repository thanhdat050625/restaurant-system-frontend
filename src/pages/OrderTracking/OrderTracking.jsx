import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  Clock,
  ChefHat,
  CheckCircle2,
  Building2,
  Phone,
  ArrowLeft,
  PackageCheck,
  QrCode,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Banknote,
  RotateCcw,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../../layouts/PageWrapper';
import { formatPrice } from '../../utils/helpers';
import { pickupOrderService } from '../../services/pickupOrderService';
import { paymentService } from '../../services/paymentService';
import { socketService } from '../../services/socketService';

const statusStepIndex = {
  PENDING: 0,
  CONFIRMED: 1,
  PREPARING: 2,
  READY: 3,
  COMPLETED: 4,
  CANCELLED: -1,
};

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [payingProvider, setPayingProvider] = useState(null);

  const handleRefresh = useCallback(async () => {
    if (!id) return;
    try {
      const res = await pickupOrderService.getPickupOrderById(id);
      const data = res?.data || res;
      setOrder(data);
    } catch {
      setError(true);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const loadOrder = async () => {
      if (!id) return;
      try {
        const res = await pickupOrderService.getPickupOrderById(id);
        if (!isMounted) return;
        const data = res?.data || res;
        setOrder(data);
      } catch {
        if (!isMounted) return;
        setError(true);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    void loadOrder();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Realtime update via socket
  useEffect(() => {
    if (!order?.branchId) return;

    socketService.connect();
    socketService.joinBranch(order.branchId);

    const handleStatusChanged = (updated) => {
      if (updated?.id === order.id || updated?.orderCode === order.orderCode) {
        setOrder((prev) => ({ ...prev, ...updated }));
      }
    };

    const handlePaymentUpdated = (payload) => {
      if (payload?.pickupOrderId === order.id || payload?.transactionCode) {
        void handleRefresh();
      }
    };

    socketService.on('pickupOrder:statusChanged', handleStatusChanged);
    socketService.on('payment:updated', handlePaymentUpdated);

    return () => {
      socketService.off('pickupOrder:statusChanged', handleStatusChanged);
      socketService.off('payment:updated', handlePaymentUpdated);
      socketService.leaveBranch(order.branchId);
    };
  }, [order?.branchId, order?.id, order?.orderCode, handleRefresh]);

  const handleOnlinePay = async (provider) => {
    if (!order?.id) return;
    setPayingProvider(provider);
    try {
      const res = await paymentService.createPayment({
        provider,
        purpose: 'PICKUP_ORDER',
        pickupOrderId: order.id,
      });
      const data = res?.data || res;
      if (data?.payUrl) {
        toast.success('Đang chuyển hướng sang cổng thanh toán...');
        window.location.href = data.payUrl;
      } else {
        toast.error('Không nhận được liên kết thanh toán từ cổng.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra khi tạo giao dịch thanh toán.';
      toast.error(msg);
    } finally {
      setPayingProvider(null);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <section className="pt-32 pb-20 bg-light dark:bg-dark min-h-screen text-center">
          <p className="text-xs text-text-secondary dark:text-text-light">Đang tải thông tin đơn hàng...</p>
        </section>
      </PageWrapper>
    );
  }

  if (error || !order) {
    return (
      <PageWrapper>
        <section className="pt-32 pb-20 bg-light dark:bg-dark min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-white dark:bg-dark-surface rounded-3xl border border-light-border dark:border-dark-border max-w-md">
            <AlertCircle size={44} className="mx-auto text-amber-500 mb-3" />
            <h2 className="text-xl font-bold text-text-primary dark:text-white mb-2">Không tìm thấy đơn hàng</h2>
            <p className="text-xs text-text-secondary dark:text-text-light mb-6">
              Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold transition-all shadow-glow"
            >
              <ArrowLeft size={16} /> Quay về Trang chủ
            </Link>
          </div>
        </section>
      </PageWrapper>
    );
  }

  const currentStep = statusStepIndex[order.status] ?? 0;
  const isCancelled = order.status === 'CANCELLED';

  const successfulPayment = Array.isArray(order.payments)
    ? order.payments.find((p) => p.status === 'SUCCESS')
    : null;
  const refundedPayment = Array.isArray(order.payments)
    ? order.payments.find((p) => p.status === 'REFUNDED')
    : null;
  const isPaid = !!successfulPayment;
  const isRefunded = !!refundedPayment;

  const orderSteps = [
    { label: 'Chờ duyệt', desc: 'Quán đang tiếp nhận', icon: Clock },
    { label: 'Đã nhận đơn', desc: 'Đã vào hàng chờ', icon: CheckCircle2 },
    { label: 'Bếp đang làm', desc: 'Đang nấu món', icon: ChefHat },
    { label: 'Sẵn sàng lấy', desc: 'Mời bạn ghé quầy', icon: PackageCheck },
    { label: 'Hoàn tất', desc: 'Đã giao thành công', icon: CheckCircle2 },
  ];

  return (
    <PageWrapper>
      <section className="pt-28 pb-20 bg-light dark:bg-dark min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors text-xs"
            >
              <ArrowLeft size={16} /> Trang chủ
            </Link>

            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-xs font-semibold text-text-secondary dark:text-text-light hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={13} />
              <span>Cập nhật</span>
            </button>
          </div>

          <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Order Header */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-light-border dark:border-dark-border shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    Đơn Mang Về
                  </span>
                  <h1 className="text-2xl font-extrabold text-text-primary dark:text-white font-mono mt-1">
                    #{order.orderCode}
                  </h1>
                  <p className="text-xs text-text-secondary dark:text-text-light mt-0.5">
                    Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Payment status badge */}
                  {isPaid && successfulPayment ? (
                    <span className="px-3 py-1.5 rounded-full font-bold text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 size={13} />
                      <span>Đã thanh toán (MoMo)</span>
                    </span>
                  ) : isRefunded ? (
                    <span className="px-3 py-1.5 rounded-full font-bold text-xs bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-300 flex items-center gap-1.5">
                      <RotateCcw size={13} />
                      <span>Đã hoàn tiền</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-full font-bold text-xs bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 flex items-center gap-1.5">
                      <Banknote size={13} />
                      <span>Thanh toán tại quầy</span>
                    </span>
                  )}

                  {/* Order status badge */}
                  <span
                    className={`px-3 py-1.5 rounded-full font-bold text-xs ${
                      isCancelled
                        ? 'bg-red-100 text-red-800'
                        : order.status === 'READY'
                          ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300 animate-pulse'
                          : order.status === 'COMPLETED'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {isCancelled
                      ? 'Đã hủy đơn'
                      : order.status === 'READY'
                        ? 'Món đã sẵn sàng ghé lấy!'
                        : order.status === 'COMPLETED'
                          ? 'Đã lấy món'
                          : order.status === 'PREPARING'
                            ? 'Bếp đang nấu món'
                            : 'Đang chuẩn bị'}
                  </span>
                </div>
              </div>

              {/* ETA Banner */}
              {!isCancelled && (
                <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 p-4 rounded-2xl flex items-center gap-4 border border-primary/20">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center shrink-0">
                    <Clock size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary dark:text-text-light">Khung giờ hẹn ghé lấy món:</p>
                    <p className="text-lg font-extrabold text-primary">
                      {order.pickupTime} — {new Date(order.pickupDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Stepper */}
            {!isCancelled && (
              <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-light-border dark:border-dark-border shadow-sm">
                <h2 className="text-sm font-bold text-text-primary dark:text-white mb-6">Tiến Trình Chế Biến</h2>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {orderSteps.map((step, idx) => {
                    const isDone = currentStep >= idx;
                    const isCurrent = currentStep === idx;
                    const IconComp = step.icon;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isCurrent
                            ? 'bg-primary/10 border-primary shadow-sm ring-2 ring-primary/20'
                            : isDone
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800'
                              : 'bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border opacity-50'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold ${
                            isDone ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          <IconComp size={15} />
                        </div>
                        <p className="text-xs font-bold text-text-primary dark:text-white">{step.label}</p>
                        <p className="text-[10px] text-text-secondary dark:text-text-light mt-0.5">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QR Code Section */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-light-border dark:border-dark-border shadow-sm text-center space-y-3">
              <h2 className="text-sm font-bold text-text-primary dark:text-white flex items-center justify-center gap-1.5">
                <QrCode size={18} className="text-primary" />
                <span>Mã Nhận Món Tại Quầy Thu Ngân</span>
              </h2>
              <p className="text-xs text-text-secondary dark:text-text-light max-w-md mx-auto">
                Khi đến chi nhánh <strong>{order.branch?.name}</strong>, vui lòng xuất trình mã QR này hoặc đọc mã nhận hàng <strong>{order.orderCode}</strong> cho nhân viên.
              </p>

              <div className="p-4 bg-white border border-gray-200 rounded-2xl inline-block shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    order.qrPayload || order.orderCode,
                  )}`}
                  alt="Pickup QR Code"
                  className="w-40 h-40 mx-auto"
                />
              </div>

              <p className="font-mono font-extrabold text-xl text-primary">{order.orderCode}</p>
            </div>

            {/* Chi nhánh & Danh sách món */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-light-border dark:border-dark-border shadow-sm space-y-4">
              <div className="flex items-start gap-3 p-3.5 bg-light-card dark:bg-dark-card rounded-2xl">
                <Building2 size={20} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-text-primary dark:text-white">{order.branch?.name}</h3>
                  <p className="text-xs text-text-secondary dark:text-text-light">{order.branch?.streetAddress || order.branch?.address}</p>
                  <p className="text-xs text-primary font-mono mt-0.5 flex items-center gap-1">
                    <Phone size={12} /> {order.branch?.phone}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-text-primary dark:text-white mb-2">Chi Tiết Món Ăn</h3>
                <div className="divide-y divide-gray-100 dark:divide-dark-border border border-light-border dark:border-dark-border rounded-2xl overflow-hidden text-xs">
                  {(order.items || []).map((item) => (
                    <div key={item.id} className="p-3 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-text-primary dark:text-white">
                          {item.quantity}x {item.menuItem?.name}
                        </p>
                        {item.note && <p className="text-[11px] text-text-secondary italic">"{item.note}"</p>}
                      </div>
                      <span className="font-bold text-text-primary dark:text-white">
                        {formatPrice(Number(item.subtotal))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-sm font-bold border-t border-light-border dark:border-dark-border">
                <span className="text-text-primary dark:text-white">Tổng tiền đơn hàng:</span>
                <span className="text-xl font-extrabold text-primary">{formatPrice(Number(order.totalAmount))}</span>
              </div>
            </div>

            {/* Thông tin thanh toán */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-light-border dark:border-dark-border shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-text-primary dark:text-white flex items-center gap-2">
                <CreditCard size={16} className="text-primary" />
                <span>Trạng Thái Thanh Toán</span>
              </h3>

              {isPaid && successfulPayment && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                    <CheckCircle2 size={16} />
                    <span>Đơn hàng đã được thanh toán thành công trực tuyến</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-text-secondary dark:text-text-light pt-1">
                    <div>
                      Cổng thanh toán:{' '}
                      <strong className="text-text-primary dark:text-white">
                        {successfulPayment.provider === 'MOMO' ? 'Ví điện tử MoMo' : successfulPayment.provider}
                      </strong>
                    </div>
                    <div>
                      Mã giao dịch:{' '}
                      <strong className="font-mono text-text-primary dark:text-white">
                        {successfulPayment.transactionCode}
                      </strong>
                    </div>
                    {successfulPayment.paidAt && (
                      <div>
                        Thời gian:{' '}
                        <strong className="text-text-primary dark:text-white">
                          {new Date(successfulPayment.paidAt).toLocaleTimeString('vi-VN')}{' '}
                          {new Date(successfulPayment.paidAt).toLocaleDateString('vi-VN')}
                        </strong>
                      </div>
                    )}
                    <div>
                      Số tiền:{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {formatPrice(Number(successfulPayment.amount))}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {isRefunded && refundedPayment && (
                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800/40 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold">
                    <RotateCcw size={16} />
                    <span>Đã hoàn tiền cho giao dịch {refundedPayment.transactionCode}</span>
                  </div>
                  <p className="text-text-secondary dark:text-text-light">
                    Lý do hoàn tiền: <em>{refundedPayment.refundReason || 'Hủy đơn hàng mang về'}</em>
                  </p>
                  {refundedPayment.refundedAt && (
                    <p className="text-text-secondary dark:text-text-light">
                      Thời gian hoàn: {new Date(refundedPayment.refundedAt).toLocaleString('vi-VN')}
                    </p>
                  )}
                </div>
              )}

              {!isPaid && !isRefunded && (
                <div className="space-y-3">
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                    <Banknote size={18} className="shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-bold">Đơn hàng chưa thanh toán trực tuyến</p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                        Bạn có thể thanh toán trực tiếp khi ghé lấy món tại quầy thu ngân, hoặc thanh toán trực tuyến ngay bên dưới để nhà hàng ưu tiên chuẩn bị món ngay.
                      </p>
                    </div>
                  </div>

                  {!isCancelled && order.status !== 'COMPLETED' && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => handleOnlinePay('MOMO')}
                        disabled={payingProvider !== null}
                        className="w-full py-3 px-4 bg-[#A50064] hover:bg-[#8F0057] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {payingProvider === 'MOMO' ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <ExternalLink size={15} />
                        )}
                        <span>Thanh toán trực tuyến bằng MoMo</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Motion.div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default OrderTracking;
