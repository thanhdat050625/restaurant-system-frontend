import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Home,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import PageWrapper from '../../layouts/PageWrapper';
import { formatPrice } from '../../utils/helpers';
import { paymentService } from '../../services/paymentService';
import { IPaymentTransaction } from '../../types/payment.type';

type VerifyState = 'LOADING' | 'SUCCESS' | 'FAILED';

export const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [state, setState] = useState<VerifyState>('LOADING');
  const [transaction, setTransaction] = useState<IPaymentTransaction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verifyPayment = async () => {
      const paramsObj: Record<string, string> = {};
      searchParams.forEach((val, key) => {
        paramsObj[key] = val;
      });

      const isMomo = searchParams.has('orderId') || searchParams.has('partnerCode');
      const isSepay = searchParams.get('provider') === 'SEPAY' || searchParams.has('order_invoice_number');

      if (!isMomo && !isSepay) {
        setState('FAILED');
        setErrorMessage('Không tìm thấy thông tin xác thực từ cổng thanh toán.');
        return;
      }

      try {
        if (isMomo) {
          const res = await paymentService.verifyMomoReturn(paramsObj);
          const data: IPaymentTransaction =
            (res as { data?: IPaymentTransaction })?.data ?? (res as unknown as IPaymentTransaction);

          if (data.status === 'SUCCESS') {
            setTransaction(data);
            setState('SUCCESS');
          } else {
            setTransaction(data);
            setState('FAILED');
            setErrorMessage('Giao dịch chưa được thanh toán thành công hoặc đã bị hủy.');
          }
        } else if (isSepay) {
          const transactionCode =
            searchParams.get('order_invoice_number') || searchParams.get('transactionCode') || '';

          if (!transactionCode) {
            setState('FAILED');
            setErrorMessage('Không tìm thấy mã giao dịch SePay.');
            return;
          }

          let data: IPaymentTransaction | null = null;
          for (let attempt = 0; attempt < 3; attempt++) {
            const res = await paymentService.getTransactionByCode(transactionCode);
            const currentTx =
              (res as { data?: IPaymentTransaction })?.data ?? (res as unknown as IPaymentTransaction);
            if (currentTx) {
              data = currentTx;
              if (data.status === 'SUCCESS' || data.status === 'FAILED') {
                break;
              }
            }
            if (attempt < 2) {
              await new Promise((resolve) => setTimeout(resolve, 1500));
            }
          }

          if (data && data.status === 'SUCCESS') {
            setTransaction(data);
            setState('SUCCESS');
          } else {
            setTransaction(data);
            setState('FAILED');
            setErrorMessage('Giao dịch chưa được thanh toán thành công hoặc đang chờ xác nhận từ ngân hàng.');
          }
        }
      } catch (err: unknown) {
        setState('FAILED');
        const errResp = err as { response?: { data?: { message?: string } } };
        const msg =
          errResp?.response?.data?.message ||
          'Không thể xác thực giao dịch hoặc chữ ký phản hồi không hợp lệ.';
        setErrorMessage(msg);
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <PageWrapper>
      <section className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-light dark:bg-dark">
        <div className="max-w-lg w-full mx-4">
          {state === 'LOADING' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface p-8 sm:p-10 rounded-3xl shadow-card border border-light-border dark:border-dark-border text-center space-y-4"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary animate-spin">
                <Loader2 size={36} />
              </div>
              <h2 className="text-xl font-bold text-text-primary dark:text-white">
                Đang xác thực giao dịch...
              </h2>
              <p className="text-xs text-text-secondary dark:text-text-light max-w-sm mx-auto">
                Hệ thống đang đối chiếu chữ ký bảo mật và cập nhật trạng thái thanh toán từ cổng. Vui lòng chờ trong giây lát.
              </p>
            </motion.div>
          )}

          {state === 'SUCCESS' && transaction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-dark-surface p-8 sm:p-10 rounded-3xl shadow-card border border-light-border dark:border-dark-border text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                <CheckCircle2 size={48} />
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
                Thanh toán thành công
              </span>

              <h1 className="text-2xl font-extrabold text-text-primary dark:text-white mt-3 mb-1">
                Giao Dịch Đã Hoàn Tất!
              </h1>
              <p className="text-xs text-text-secondary dark:text-text-light mb-6">
                Cảm ơn bạn. Đơn hàng của bạn đã được xác nhận thanh toán trực tuyến.
              </p>

              <div className="p-5 bg-light-card dark:bg-dark-card rounded-2xl border border-light-border dark:border-dark-border text-xs space-y-3 text-left mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary dark:text-text-light">Số tiền thanh toán</span>
                  <span className="text-base font-extrabold text-primary">
                    {formatPrice(Number(transaction.amount))}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-light-border dark:border-dark-border">
                  <span className="text-text-secondary dark:text-text-light">Cổng thanh toán</span>
                  <span className="font-bold text-text-primary dark:text-white">
                    {transaction.provider === 'MOMO'
                      ? 'Ví MoMo'
                      : transaction.provider === 'SEPAY'
                        ? 'Cổng SePay'
                        : transaction.provider}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-light-border dark:border-dark-border">
                  <span className="text-text-secondary dark:text-text-light">Mã giao dịch</span>
                  <span className="font-mono font-semibold text-text-primary dark:text-white">
                    {transaction.transactionCode}
                  </span>
                </div>

                {transaction.paidAt && (
                  <div className="flex justify-between items-center pt-2 border-t border-light-border dark:border-dark-border">
                    <span className="text-text-secondary dark:text-text-light">Thời gian ghi nhận</span>
                    <span className="text-text-primary dark:text-white">
                      {new Date(transaction.paidAt).toLocaleTimeString('vi-VN')} {new Date(transaction.paidAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {transaction.pickupOrderId ? (
                  <button
                    onClick={() => navigate(`/order/${transaction.pickupOrderId}`)}
                    className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Theo dõi đơn hàng & Xem mã QR</span>
                    <ArrowRight size={16} />
                  </button>
                ) : transaction.reservationId ? (
                  <button
                    onClick={() => navigate('/profile?tab=reservations')}
                    className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Xem thông tin đặt bàn</span>
                    <ArrowRight size={16} />
                  </button>
                ) : null}

                <Link
                  to="/"
                  className="w-full py-3 bg-light-card hover:bg-gray-100 dark:bg-dark-card dark:hover:bg-dark-border/40 text-text-primary dark:text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Home size={15} />
                  <span>Quay về trang chủ</span>
                </Link>
              </div>
            </motion.div>
          )}

          {state === 'FAILED' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-dark-surface p-8 sm:p-10 rounded-3xl shadow-card border border-light-border dark:border-dark-border text-center"
            >
              <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                <XCircle size={48} />
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-full">
                Thanh toán thất bại
              </span>

              <h1 className="text-2xl font-extrabold text-text-primary dark:text-white mt-3 mb-1">
                Giao Dịch Chưa Thành Công
              </h1>
              <p className="text-xs text-text-secondary dark:text-text-light mb-6">
                {errorMessage}
              </p>

              {transaction && (
                <div className="p-4 bg-light-card dark:bg-dark-card rounded-2xl border border-light-border dark:border-dark-border text-xs space-y-2 text-left mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary dark:text-text-light">Mã giao dịch</span>
                    <span className="font-mono text-text-primary dark:text-white font-medium">
                      {transaction.transactionCode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary dark:text-text-light">Số tiền</span>
                    <span className="font-bold text-text-primary dark:text-white">
                      {formatPrice(Number(transaction.amount))}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {transaction?.pickupOrderId && (
                  <button
                    onClick={() => navigate(`/order/${transaction.pickupOrderId}`)}
                    className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw size={15} />
                    <span>Xem đơn hàng & Thanh toán lại</span>
                  </button>
                )}

                <Link
                  to="/cart"
                  className="w-full py-3 bg-light-card hover:bg-gray-100 dark:bg-dark-card dark:hover:bg-dark-border/40 text-text-primary dark:text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={15} />
                  <span>Quay lại giỏ hàng</span>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </PageWrapper>
  );
};

export default PaymentResult;
