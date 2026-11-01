import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import PageWrapper from '../../layouts/PageWrapper';
import { formatPrice } from '../../utils/helpers';
import { pickupOrderService } from '../../services/pickupOrderService';
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

  const fetchOrder = async () => {
    if (!id) return;
    try {
      const res = await pickupOrderService.getPickupOrderById(id);
      const data = res?.data || res;
      setOrder(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
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

    socketService.on('pickupOrder:statusChanged', handleStatusChanged);

    return () => {
      socketService.off('pickupOrder:statusChanged', handleStatusChanged);
      socketService.leaveBranch(order.branchId);
    };
  }, [order?.branchId, order?.id, order?.orderCode]);

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
              onClick={fetchOrder}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-xs font-semibold text-text-secondary dark:text-text-light hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={13} />
              <span>Cập nhật</span>
            </button>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Order Header */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-light-border dark:border-dark-border shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    Đơn Mang Về (Pick-up)
                  </span>
                  <h1 className="text-2xl font-extrabold text-text-primary dark:text-white font-mono mt-1">
                    #{order.orderCode}
                  </h1>
                  <p className="text-xs text-text-secondary dark:text-text-light mt-0.5">
                    Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>

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
                <span className="text-text-primary dark:text-white">Tổng tiền thanh toán:</span>
                <span className="text-xl font-extrabold text-primary">{formatPrice(Number(order.totalAmount))}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default OrderTracking;
