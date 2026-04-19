import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, User, Clock, CreditCard, Wallet, Banknote, CheckCircle2 } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, deliveryFee, total, deliveryType, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [form, setForm] = useState({ name: '', phone: '', address: '', note: '', time: 'now' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => { clearCart(); navigate('/order/1'); }, 2000);
  };

  if (isSuccess) {
    return (
      <PageWrapper>
        <section className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-light dark:bg-dark">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} className="text-success" />
            </motion.div>
            <h2 className="text-3xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] mb-3">Đặt Hàng Thành Công!</h2>
            <p className="text-text-secondary dark:text-text-light mb-2">Đơn hàng #FH20260001 đã được xác nhận</p>
            <p className="text-text-light text-sm">Đang chuyển hướng...</p>
          </motion.div>
        </section>
      </PageWrapper>
    );
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const payments = [
    { id: 'cod', label: 'Tiền mặt (COD)', icon: Banknote, desc: 'Thanh toán khi nhận hàng' },
    { id: 'card', label: 'Thẻ ngân hàng', icon: CreditCard, desc: 'Visa, Mastercard, JCB' },
    { id: 'ewallet', label: 'Ví điện tử', icon: Wallet, desc: 'MoMo, ZaloPay, VNPay' },
  ];

  return (
    <PageWrapper>
      <section className="pt-28 pb-20 bg-light dark:bg-dark min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] mb-8">Thanh Toán</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Info */}
              <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border">
                <h3 className="text-lg font-bold text-text-primary dark:text-white mb-4">Thông tin liên hệ</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Họ và tên *</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                      <input name="name" value={form.name} onChange={handleChange} required placeholder="Nguyễn Văn A" className="w-full pl-10 pr-4 py-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white placeholder-text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Số điện thoại *</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                      <input name="phone" value={form.phone} onChange={handleChange} required placeholder="0123 456 789" className="w-full pl-10 pr-4 py-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white placeholder-text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                  </div>
                </div>
                {deliveryType === 'delivery' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Địa chỉ giao hàng *</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-3 top-3 text-text-light" />
                      <textarea name="address" value={form.address} onChange={handleChange} required rows={2} placeholder="Số nhà, đường, phường, quận..." className="w-full pl-10 pr-4 py-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white placeholder-text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Time */}
              <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border">
                <h3 className="text-lg font-bold text-text-primary dark:text-white mb-4 flex items-center gap-2"><Clock size={20} /> Thời gian nhận</h3>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setForm({ ...form, time: 'now' })} className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${form.time === 'now' ? 'border-primary bg-primary/5 text-primary' : 'border-light-border dark:border-dark-border text-text-secondary dark:text-text-light hover:border-primary/50'}`}>
                    Giao ngay
                  </button>
                  <button type="button" onClick={() => setForm({ ...form, time: 'later' })} className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${form.time === 'later' ? 'border-primary bg-primary/5 text-primary' : 'border-light-border dark:border-dark-border text-text-secondary dark:text-text-light hover:border-primary/50'}`}>
                    Hẹn giờ
                  </button>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border">
                <h3 className="text-lg font-bold text-text-primary dark:text-white mb-4">Phương thức thanh toán</h3>
                <div className="space-y-3">
                  {payments.map(pm => (
                    <button key={pm.id} type="button" onClick={() => setPaymentMethod(pm.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === pm.id ? 'border-primary bg-primary/5' : 'border-light-border dark:border-dark-border hover:border-primary/50'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === pm.id ? 'bg-primary text-white' : 'bg-light-card dark:bg-dark-card text-text-secondary'}`}>
                        <pm.icon size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-text-primary dark:text-white text-sm">{pm.label}</p>
                        <p className="text-text-light text-xs">{pm.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border">
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Ghi chú</label>
                <textarea name="note" value={form.note} onChange={handleChange} rows={2} placeholder="Ghi chú cho đơn hàng (tuỳ chọn)" className="w-full px-4 py-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white placeholder-text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
              </div>
            </div>

            {/* Right - Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-card border border-light-border dark:border-dark-border">
                <h3 className="text-lg font-bold text-text-primary dark:text-white mb-4">Đơn hàng của bạn</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary dark:text-white line-clamp-1">{item.name}</p>
                        <p className="text-xs text-text-light">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-text-primary dark:text-white shrink-0">{formatPrice((item.price + (item.selectedOptionPrice || 0)) * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <hr className="border-light-border dark:border-dark-border mb-4" />
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm"><span className="text-text-secondary dark:text-text-light">Tạm tính</span><span className="text-text-primary dark:text-white">{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-text-secondary dark:text-text-light">Phí ship</span><span className={deliveryFee === 0 ? 'text-success' : 'text-text-primary dark:text-white'}>{deliveryFee === 0 ? 'Miễn phí' : formatPrice(deliveryFee)}</span></div>
                  <hr className="border-light-border dark:border-dark-border" />
                  <div className="flex justify-between"><span className="font-semibold text-text-primary dark:text-white">Tổng</span><span className="text-xl font-bold text-primary">{formatPrice(total)}</span></div>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-primary hover:bg-primary-dark disabled:opacity-70 text-white font-semibold rounded-full transition-all hover:shadow-glow flex items-center justify-center gap-2">
                  {isSubmitting ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang xử lý...</>) : 'Xác nhận đặt hàng'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Checkout;
