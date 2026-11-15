import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CreditCard,
  Banknote,
  CheckCircle2,
  Printer,
  RefreshCw,
  QrCode,
  ExternalLink,
  UtensilsCrossed,
  Clock,
  MapPin,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../../components/ui/Modal';
import { IReservation, IReservationBill } from '../../../types/reservation.type';
import { PaymentProvider } from '../../../types/payment.type';
import { reservationService } from '../../../services/reservationService';
import { socketService } from '../../../services/socketService';
import { formatPrice } from '../../../utils/helpers';

interface ReservationSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: IReservation | null;
  onSettledSuccess?: () => void;
}

export const ReservationSettlementModal: React.FC<ReservationSettlementModalProps> = ({
  isOpen,
  onClose,
  reservation,
  onSettledSuccess,
}) => {
  const [bill, setBill] = useState<IReservationBill | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentProvider>('CASH');
  const [cashNote, setCashNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onlinePayUrl, setOnlinePayUrl] = useState<string | null>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);

  const loadBill = useCallback(async () => {
    if (!reservation?.id) return;
    setIsLoading(true);
    try {
      const res: any = await reservationService.getBill(reservation.id);
      const data = res?.data?.data || res?.data || res;
      setBill(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể tải bảng kê hóa đơn.');
    } finally {
      setIsLoading(false);
    }
  }, [reservation?.id]);

  useEffect(() => {
    if (isOpen && reservation?.id) {
      loadBill();
      setOnlinePayUrl(null);
      setCashNote('');
      setPaymentMethod('CASH');
    }
  }, [isOpen, reservation?.id, loadBill]);

  // Lắng nghe sự kiện socket realtime khi thanh toán online thành công hoặc món tại bàn thay đổi
  useEffect(() => {
    if (!isOpen || !reservation?.id) return;

    const handleStatusChanged = (data: { id: string; status: string }) => {
      if (data.id === reservation.id && data.status === 'COMPLETED') {
        toast.success('Hóa đơn đã được thanh toán trực tuyến thành công!');
        setOnlinePayUrl(null);
        loadBill();
        if (onSettledSuccess) onSettledSuccess();
      }
    };

    const handleTableItemsUpdated = () => {
      loadBill();
    };

    socketService.on('reservation:statusChanged', handleStatusChanged);
    socketService.on('table:batch_created', handleTableItemsUpdated);
    socketService.on('table:bill_updated', handleTableItemsUpdated);
    socketService.on('kitchen:item_updated', handleTableItemsUpdated);

    return () => {
      socketService.off('reservation:statusChanged', handleStatusChanged);
      socketService.off('table:batch_created', handleTableItemsUpdated);
      socketService.off('table:bill_updated', handleTableItemsUpdated);
      socketService.off('kitchen:item_updated', handleTableItemsUpdated);
    };
  }, [isOpen, reservation?.id, loadBill, onSettledSuccess]);

  const handleSettle = async () => {
    if (!reservation?.id || !bill) return;

    setIsSubmitting(true);
    try {
      const res: any = await reservationService.settleBill(reservation.id, {
        paymentMethod,
        note: cashNote.trim() || undefined,
      });

      const resData = res?.data?.data || res?.data || res;

      if (paymentMethod === 'MOMO' || paymentMethod === 'VNPAY') {
        if (resData?.payUrl) {
          setOnlinePayUrl(resData.payUrl);
          toast.success('Đã tạo liên kết thanh toán. Quét mã QR hoặc nhấn vào link.');
        } else {
          toast.error('Không nhận được liên kết thanh toán từ cổng.');
        }
      } else {
        toast.success(`Đã thu tiền mặt & Hoàn tất quyết toán bàn #${reservation.reservationCode}.`);
        await loadBill();
        if (onSettledSuccess) onSettledSuccess();
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Quyết toán hóa đơn thất bại.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!reservation) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Quyết toán hóa đơn #${reservation.reservationCode}`} maxWidth="max-w-2xl">
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2 text-gray-400">
          <RefreshCw size={26} className="animate-spin text-primary" />
          <p className="text-xs">Đang tải bảng kê hóa đơn và tiền cọc...</p>
        </div>
      ) : !bill ? (
        <div className="py-10 text-center text-xs text-gray-500">
          Không tìm thấy thông tin hóa đơn.
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          {/* Printable Invoice Container */}
          <div ref={printAreaRef} className="space-y-3">
            {/* Header Information Box */}
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-100 text-sm">
                  <User size={15} className="text-primary" />
                  <span>{bill.customerName}</span>
                  <span className="font-mono text-xs font-normal text-gray-400">({bill.customerPhone})</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {bill.reservationTime} · {bill.reservationDate.split('T')[0]}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-primary font-semibold">
                    <MapPin size={12} />
                    {bill.table ? `Bàn ${bill.table.tableNumber} (Tầng ${bill.table.floor})` : 'Chưa xếp bàn'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-[11px] text-gray-400 block">Mã hóa đơn</span>
                <span className="font-mono font-bold text-sm text-primary">#{bill.reservationCode}</span>
              </div>
            </div>

            {/* Food items table */}
            <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="px-3.5 py-2 bg-gray-100 dark:bg-slate-700/60 font-bold text-gray-700 dark:text-gray-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UtensilsCrossed size={14} className="text-primary" />
                  Bảng kê món ăn phục vụ ({bill.items.length} món)
                </span>
                <span className="text-[11px] font-normal text-gray-400">Đơn giá × SL</span>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-slate-700/60 max-h-48 overflow-y-auto custom-scrollbar">
                {bill.items.length === 0 ? (
                  <p className="p-3 text-center text-gray-400 italic">Không có món ăn trong đơn này.</p>
                ) : (
                  bill.items.map((item) => (
                    <div key={item.id} className="p-2.5 flex items-center justify-between gap-2 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{item.name}</p>
                        {item.note && <p className="text-[10px] text-amber-600 italic truncate">"{item.note}"</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-gray-400 font-mono">
                          {formatPrice(item.unitPrice)} × {item.quantity} ={' '}
                        </span>
                        <span className="font-bold font-mono text-gray-800 dark:text-gray-200">
                          {formatPrice(item.subtotal)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-3.5 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700 space-y-1.5">
              <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                <span>Tổng tiền món ăn:</span>
                <span className="font-bold font-mono text-gray-800 dark:text-gray-100">
                  {formatPrice(bill.totalFoodAmount)}
                </span>
              </div>

              {bill.depositAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                  <span>Tiền cọc món đã cấn trừ:</span>
                  <span className="font-bold font-mono">- {formatPrice(bill.depositAmount)}</span>
                </div>
              )}

              {bill.settlementAmount > 0 && (
                <div className="flex justify-between items-center text-blue-600 dark:text-blue-400">
                  <span>Đã thanh toán quyết toán:</span>
                  <span className="font-bold font-mono">- {formatPrice(bill.settlementAmount)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center text-sm">
                <span className="font-extrabold text-gray-800 dark:text-white">Cần thanh toán còn lại:</span>
                <span className="text-base font-black font-mono text-primary">
                  {formatPrice(bill.remainingAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Status or Selection */}
          {bill.isSettled ? (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3 text-emerald-700 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="shrink-0" />
                <div>
                  <p className="font-bold text-xs">Hóa đơn đã được quyết toán hoàn tất</p>
                  <p className="text-[11px] opacity-80">Bàn đã chuyển sang hàng đợi dọn dẹp.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer size={13} />
                <span>In hóa đơn</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <h4 className="font-bold text-gray-700 dark:text-gray-200 text-xs">Phương thức quyết toán:</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('CASH');
                    setOnlinePayUrl(null);
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    paymentMethod === 'CASH'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Banknote size={17} className="text-amber-500" />
                    <span className="font-bold text-xs text-gray-800 dark:text-gray-100">Tiền mặt tại quầy</span>
                  </div>
                  <p className="text-[10px] text-gray-500">Thu tiền mặt trực tiếp tại bàn hoặc quầy thu ngân.</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('MOMO');
                    setOnlinePayUrl(null);
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    paymentMethod === 'MOMO'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-4 h-4 rounded bg-[#A50064] text-white flex items-center justify-center font-bold text-[9px]">
                      M
                    </span>
                    <span className="font-bold text-xs text-gray-800 dark:text-gray-100">Ví MoMo QR</span>
                  </div>
                  <p className="text-[10px] text-gray-500">Sinh mã QR MoMo cho khách quét thanh toán tức thì.</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('VNPAY');
                    setOnlinePayUrl(null);
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    paymentMethod === 'VNPAY'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard size={16} className="text-[#005BAA]" />
                    <span className="font-bold text-xs text-gray-800 dark:text-gray-100">Cổng VNPay</span>
                  </div>
                  <p className="text-[10px] text-gray-500">Thanh toán qua mã VNPAY-QR hoặc thẻ ngân hàng.</p>
                </button>
              </div>

              {paymentMethod === 'CASH' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500">Ghi chú quyết toán (tùy chọn):</label>
                  <input
                    type="text"
                    value={cashNote}
                    onChange={(e) => setCashNote(e.target.value)}
                    placeholder="VD: Khách đưa 500k, thối 150k..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary"
                  />
                </div>
              )}

              {onlinePayUrl && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary">
                    <QrCode size={16} />
                    <span>Mã thanh toán trực tuyến đã sẵn sàng</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Bấm liên kết bên dưới để mở trang thanh toán hoặc cho khách quét mã:
                  </p>
                  <div className="pt-1 flex items-center justify-center gap-2">
                    <a
                      href={onlinePayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <span>Mở cổng thanh toán</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                  <p className="text-[10px] text-gray-400 italic">
                    Hệ thống sẽ tự động cập nhật khi khách hoàn tất giao dịch.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={14} />
              <span>In phiếu tạm</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Đóng
              </button>

              {!bill.isSettled && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSettle}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : paymentMethod === 'CASH' ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Xác nhận thu {formatPrice(bill.remainingAmount)}</span>
                    </>
                  ) : (
                    <>
                      <QrCode size={14} />
                      <span>Tạo mã thanh toán {paymentMethod === 'MOMO' ? 'MoMo' : 'VNPay'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ReservationSettlementModal;
