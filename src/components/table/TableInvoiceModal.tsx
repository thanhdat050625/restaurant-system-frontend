import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  UtensilsCrossed,
  ExternalLink,
  RefreshCw,
  CreditCard,
  Clock,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import ConfirmModal from '../ui/ConfirmModal';
import { dineInService } from '../../services/dineInService';
import { ITable } from '../../types/admin/table.type';
import { IInvoice, KitchenItemStatus, PaymentMethodType } from '../../types/dine-in.type';
import { formatPrice } from '../../utils/helpers';

interface TableInvoiceModalProps {
  table: ITable | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckoutSuccess?: () => void;
}

const kitchenStatusBadge: Record<KitchenItemStatus, { label: string; cls: string }> = {
  QUEUED: { label: 'Chờ bếp làm', cls: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300' },
  PREPARING: { label: 'Đang chế biến', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  READY: { label: 'Đã xong món', cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  SERVED: { label: 'Đã phục vụ', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  CANCELLED: { label: 'Đã hủy', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
};

const paymentOptions: { value: PaymentMethodType; label: string }[] = [
  { value: 'CASH', label: 'Tiền mặt (CASH)' },
  { value: 'BANKING', label: 'Chuyển khoản (BANKING)' },
  { value: 'VNPAY', label: 'VNPay QR' },
  { value: 'MOMO', label: 'Ví MoMo' },
  { value: 'CARD', label: 'Quẹt thẻ (CARD)' },
];

export const TableInvoiceModal: React.FC<TableInvoiceModalProps> = ({
  table,
  isOpen,
  onClose,
  onCheckoutSuccess,
}) => {
  const [invoice, setInvoice] = useState<IInvoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mở phiên ăn mới (khi bàn chưa có hóa đơn)
  const [customerName, setCustomerName] = useState('Khách tại bàn');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [openingSession, setOpeningSession] = useState(false);

  // Checkout state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CASH');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [showConfirmCheckout, setShowConfirmCheckout] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchSession = useCallback(async () => {
    if (!table?.id) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res: any = await dineInService.getTableSession(table.id);
      const data = res?.data ?? res;
      setInvoice(data?.activeInvoice || null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể tải thông tin hóa đơn bàn.';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  }, [table?.id]);

  useEffect(() => {
    if (isOpen && table?.id) {
      setDiscountAmount(0);
      setNotes('');
      setPaymentMethod('CASH');
      setCustomerName('Khách tại bàn');
      setGuestCount(table.tableType?.capacity || 2);
      fetchSession();
    }
  }, [isOpen, table?.id, table?.tableType?.capacity, fetchSession]);

  if (!table) return null;

  const handleOpenSession = async () => {
    setOpeningSession(true);
    try {
      await dineInService.openTableSession(table.id, {
        customerName: customerName.trim() || 'Khách tại bàn',
        guestCount: Math.max(1, guestCount),
      });
      toast.success(`Đã mở phiên ăn cho ${table.tableNumber}!`);
      await fetchSession();
      onCheckoutSuccess?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể mở phiên bàn ăn.';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setOpeningSession(false);
    }
  };

  const handleConfirmCheckout = async () => {
    if (!invoice) return;
    setCheckingOut(true);
    try {
      await dineInService.checkoutInvoice(invoice.id, {
        paymentMethod,
        discountAmount: Math.max(0, Number(discountAmount) || 0),
        notes: notes.trim() || undefined,
      });
      toast.success(`Thanh toán hóa đơn ${invoice.invoiceCode} thành công! Bàn đã chuyển sang chờ dọn.`);
      setShowConfirmCheckout(false);
      onCheckoutSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Thanh toán hóa đơn thất bại.';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setCheckingOut(false);
    }
  };

  const subtotalNum = Number(invoice?.subtotal || 0);
  const payableNum = Math.max(0, subtotalNum - (Number(discountAmount) || 0));

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Phiên Ăn & Hóa Đơn — ${table.tableNumber}`}
        subtitle={`Tầng ${table.floor} • ${table.branch?.name || ''}`}
        size="lg"
      >
        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Đang tải thông tin phiên bàn ăn...</p>
          </div>
        ) : errorMsg ? (
          <div className="p-6 text-center space-y-3 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">{errorMsg}</p>
            <button
              type="button"
              onClick={fetchSession}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Thử lại</span>
            </button>
          </div>
        ) : !invoice ? (
          <div className="space-y-4">
            <div className="p-6 text-center bg-gray-50 dark:bg-slate-800/80 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 space-y-2">
              <Receipt className="w-10 h-10 text-gray-400 mx-auto" />
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                Bàn hiện chưa có hóa đơn nào đang mở
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Bạn có thể mở phiên phục vụ cho khách vãng lai ngay tại đây hoặc mở trang gọi món của bàn để gửi món trực tiếp xuống bếp.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tên khách hàng
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Số lượng khách
                </label>
                <input
                  type="number"
                  min={1}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5">
              <Link
                to={`/table-order/${table.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-100 text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
              >
                <ExternalLink size={14} />
                <span>Mở trang gọi món</span>
              </Link>
              <button
                type="button"
                disabled={openingSession}
                onClick={handleOpenSession}
                className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <PlusCircle size={14} />
                <span>{openingSession ? 'Đang mở...' : 'Mở phiên bàn mới'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Invoice Info Header */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-sm text-primary">
                    {invoice.invoiceCode}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      invoice.status === 'PAYMENT_PENDING'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 animate-pulse'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                    }`}
                  >
                    {invoice.status === 'PAYMENT_PENDING' ? 'Khách đang yêu cầu thanh toán' : 'Đang phục vụ'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Khách: <strong>{invoice.customerName}</strong> ({invoice.guestCount} khách)
                  {invoice.customerPhone ? ` • ${invoice.customerPhone}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchSession}
                  className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-200 hover:bg-gray-100 cursor-pointer"
                  title="Tải lại hóa đơn"
                >
                  <RefreshCw size={14} />
                </button>
                <Link
                  to={`/table-order/${table.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-sm"
                >
                  <UtensilsCrossed size={14} />
                  <span>Gọi thêm món</span>
                </Link>
              </div>
            </div>

            {/* Danh sách các đợt đã gọi */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {!invoice.batches || invoice.batches.length === 0 ? (
                <div className="p-5 text-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
                  Chưa có đợt gọi món nào được gửi xuống bếp. Bấm "Gọi thêm món" để lên đơn cho bàn.
                </div>
              ) : (
                invoice.batches.map((batch) => (
                  <div
                    key={batch.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs border-b border-gray-100 dark:border-slate-700 pb-1.5">
                      <span className="font-bold text-gray-800 dark:text-gray-100">
                        Đợt #{batch.batchNumber}{' '}
                        <span className="font-normal text-gray-400">
                          ({batch.orderedByRole === 'USER' ? 'Khách gọi QR' : 'Nhân viên'})
                        </span>
                      </span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(batch.createdAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {batch.items.map((item) => {
                        const badge = kitchenStatusBadge[item.status] || kitchenStatusBadge.QUEUED;
                        return (
                          <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {item.quantity}x {item.menuItem?.name}
                              </span>
                              {item.note && (
                                <span className="text-[11px] text-gray-500 dark:text-gray-400 ml-1.5 italic">
                                  ({item.note})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.cls}`}>
                                {badge.label}
                              </span>
                              <span className="font-mono font-semibold text-gray-700 dark:text-gray-200 w-20 text-right">
                                {formatPrice(Number(item.subtotal))}
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

            {/* Form Thanh Toán Hóa Đơn */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Phương thức thanh toán
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white outline-none focus:border-primary"
                  >
                    {paymentOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Giảm giá (VND)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={subtotalNum}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Ghi chú thanh toán
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Khách thanh toán tiền mặt đủ..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Tạm tính: <strong>{formatPrice(subtotalNum)}</strong>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Thành tiền:</span>
                  <span className="text-lg font-extrabold text-primary">{formatPrice(payableNum)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmCheckout(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <CreditCard size={15} />
                <span>Xác nhận Thanh toán</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={showConfirmCheckout}
        onClose={() => setShowConfirmCheckout(false)}
        onConfirm={handleConfirmCheckout}
        title={`Thanh toán hóa đơn ${invoice?.invoiceCode || ''}`}
        message={`Xác nhận thu ${formatPrice(payableNum)} bằng phương thức ${paymentMethod} cho ${table.tableNumber}?\n\nHóa đơn sẽ đóng lại và bàn tự động chuyển sang hàng đợi "Cần dọn dẹp".`}
        confirmText="Hoàn tất thanh toán"
        cancelText="Quay lại"
        type="info"
        isLoading={checkingOut}
      />
    </>
  );
};

export default TableInvoiceModal;
