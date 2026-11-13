import React, { useState } from 'react';
import {
  Receipt,
  Clock,
  UtensilsCrossed,
  CreditCard,
  CheckCircle2,
  ChefHat,
  Users,
  XCircle,
  Sparkles,
  BellRing,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { dineInService } from '../../services/dineInService';
import { IInvoice, InvoiceStatus, KitchenItemStatus } from '../../types/dine-in.type';
import { formatPrice } from '../../utils/helpers';

interface DineInInvoiceTabProps {
  tableId: string;
  tableNumber: string;
  activeInvoice: IInvoice | null;
  onSwitchToMenu: () => void;
  onPaymentRequested: (updatedInvoice: IInvoice) => void;
}

const invoiceStatusBadge: Record<InvoiceStatus, { label: string; cls: string }> = {
  OPEN: {
    label: 'Đang phục vụ',
    cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  PAYMENT_PENDING: {
    label: 'Chờ nhân viên thu tiền',
    cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  },
  PAID: {
    label: 'Đã thanh toán',
    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  CANCELLED: {
    label: 'Đã hủy',
    cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
};

const kitchenStatusConfig: Record<
  KitchenItemStatus,
  { label: string; cls: string; icon: React.ReactNode }
> = {
  QUEUED: {
    label: 'Chờ bếp làm',
    cls: 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300',
    icon: <Clock size={12} />,
  },
  PREPARING: {
    label: 'Đang chế biến',
    cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    icon: <ChefHat size={12} />,
  },
  READY: {
    label: 'Đã ra món',
    cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    icon: <Sparkles size={12} />,
  },
  SERVED: {
    label: 'Đã phục vụ',
    cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    icon: <CheckCircle2 size={12} />,
  },
  CANCELLED: {
    label: 'Bếp đã hủy',
    cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    icon: <XCircle size={12} />,
  },
};

export const DineInInvoiceTab: React.FC<DineInInvoiceTabProps> = ({
  tableId,
  tableNumber,
  activeInvoice,
  onSwitchToMenu,
  onPaymentRequested,
}) => {
  const [showConfirmPay, setShowConfirmPay] = useState(false);
  const [requestingPay, setRequestingPay] = useState(false);

  const handleConfirmPaymentRequest = async () => {
    setRequestingPay(true);
    try {
      const res = await dineInService.requestPayment(tableId);
      toast.success('Đã gửi yêu cầu thanh toán tới quầy phục vụ!');
      setShowConfirmPay(false);
      onPaymentRequested(res.data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string | string[] } }; message?: string };
      const rawMsg = axiosErr?.response?.data?.message;
      const msg = Array.isArray(rawMsg)
        ? rawMsg.join(', ')
        : rawMsg || axiosErr?.message || 'Không thể gửi yêu cầu thanh toán.';
      toast.error(msg);
    } finally {
      setRequestingPay(false);
    }
  };

  if (!activeInvoice) {
    return (
      <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Receipt size={28} />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Chưa có hóa đơn đang mở tại {tableNumber}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Hãy chọn món từ thực đơn và gửi xuống bếp. Hóa đơn tạm tính và tiến độ chế biến từng món sẽ tự động hiển thị tại đây.
          </p>
        </div>
        <button
          type="button"
          onClick={onSwitchToMenu}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <UtensilsCrossed size={15} />
          <span>Xem Thực Đơn &amp; Gọi Món</span>
        </button>
      </div>
    );
  }

  const batches = activeInvoice.batches || [];
  const invStatus = invoiceStatusBadge[activeInvoice.status] || invoiceStatusBadge.OPEN;
  const subtotalNum = Number(activeInvoice.subtotal || 0);
  const discountNum = Number(activeInvoice.discountAmount || 0);
  const finalNum = Number(activeInvoice.finalAmount || 0);

  return (
    <div className="space-y-4 pb-8">
      {/* Invoice Overview Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                {activeInvoice.invoiceCode}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${invStatus.cls}`}>
                {invStatus.label}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-2">
              {activeInvoice.customerName || 'Khách tại bàn'}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span className="inline-flex items-center gap-1">
                <Users size={13} />
                {activeInvoice.guestCount || 1} khách
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={13} />
                Mở lúc{' '}
                {new Date(activeInvoice.openedAt).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {activeInvoice.reservation?.reservationCode && (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Mã đặt bàn: {activeInvoice.reservation.reservationCode}
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">Tổng tạm tính</div>
            <div className="text-xl font-extrabold text-primary">{formatPrice(finalNum)}</div>
          </div>
        </div>

        {activeInvoice.status === 'PAYMENT_PENDING' && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300 font-medium">
            <BellRing size={16} className="shrink-0 animate-bounce" />
            <span>
              Bạn đã gửi yêu cầu thanh toán. Nhân viên đang tới bàn để hỗ trợ thanh toán cho bạn!
            </span>
          </div>
        )}
      </div>

      {/* Batches & Kitchen Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">
            Chi tiết các đợt gọi món ({batches.length})
          </h4>
          {activeInvoice.status === 'OPEN' && (
            <button
              type="button"
              onClick={onSwitchToMenu}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              + Gọi thêm món
            </button>
          )}
        </div>

        {batches.length === 0 ? (
          <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 text-xs text-gray-500 dark:text-gray-400">
            Hóa đơn đã mở nhưng chưa có món nào được gửi xuống bếp.
          </div>
        ) : (
          batches.map((batch) => (
            <div
              key={batch.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 text-xs font-bold">
                    Đợt #{batch.batchNumber}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">
                    {batch.orderedByRole === 'STAFF' ? 'Nhân viên gọi' : 'Khách gọi tại bàn'}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(batch.createdAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {batch.note && (
                <div className="text-xs px-3 py-1.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-100 dark:border-amber-900/50">
                  Ghi chú đợt: {batch.note}
                </div>
              )}

              <div className="space-y-2.5">
                {batch.items.map((item) => {
                  const statusInfo =
                    kitchenStatusConfig[item.status] || kitchenStatusConfig.QUEUED;
                  const isCancelled = item.status === 'CANCELLED';

                  return (
                    <div
                      key={item.id}
                      className={`flex items-start justify-between gap-3 ${
                        isCancelled ? 'opacity-65' : ''
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-extrabold text-primary">
                            {item.quantity}x
                          </span>
                          <span
                            className={`text-sm font-semibold text-gray-900 dark:text-white ${
                              isCancelled ? 'line-through' : ''
                            }`}
                          >
                            {item.menuItem?.name || 'Món ăn'}
                          </span>
                        </div>
                        {item.note && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                            Ghi chú: {item.note}
                          </p>
                        )}
                        {isCancelled && item.cancelledReason && (
                          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                            Lý do hủy: {item.cancelledReason}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${statusInfo.cls}`}
                        >
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                        <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-200">
                          {isCancelled ? '0 ₫' : formatPrice(Number(item.subtotal))}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals & Request Payment CTA */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>Tạm tính</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatPrice(subtotalNum)}
          </span>
        </div>
        {discountNum > 0 && (
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
            <span>Giảm giá</span>
            <span className="font-semibold">-{formatPrice(discountNum)}</span>
          </div>
        )}
        <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900 dark:text-white">Tổng thanh toán</span>
          <span className="text-lg font-extrabold text-primary">{formatPrice(finalNum)}</span>
        </div>

        {activeInvoice.status === 'OPEN' && (
          <button
            type="button"
            onClick={() => setShowConfirmPay(true)}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            <CreditCard size={16} />
            <span>Yêu Cầu Thanh Toán</span>
          </button>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirmPay}
        onClose={() => !requestingPay && setShowConfirmPay(false)}
        onConfirm={handleConfirmPaymentRequest}
        title="Yêu cầu thanh toán tại bàn?"
        message={`Hóa đơn ${activeInvoice.invoiceCode} tại ${tableNumber} có tổng cộng ${formatPrice(finalNum)}. Nhân viên phục vụ sẽ nhận thông báo ngay và đến bàn hỗ trợ bạn thanh toán.`}
        confirmText="Gửi yêu cầu thanh toán"
        cancelText="Gọi thêm món"
        type="info"
        isLoading={requestingPay}
      />
    </div>
  );
};
export default DineInInvoiceTab;
