import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Phone,
  User,
  Clock,
  Banknote,
  CheckCircle2,
  Building2,
  Calendar,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../../layouts/PageWrapper';
import { useCart } from '../../features/menu/CartContext';
import { useAuth } from '../../features/auth/AuthContext';
import { formatPrice } from '../../utils/helpers';
import { branchService } from '../../services/admin/branchService';
import { pickupOrderService } from '../../services/pickupOrderService';

const toLocalDateString = (d) => {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, total, clearCart } = useCart();
  const { user } = useAuth();

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [pickupDate, setPickupDate] = useState(toLocalDateString(new Date()));
  const [pickupTime, setPickupTime] = useState('');

  const [form, setForm] = useState({
    name: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.fullName || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // Load branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await branchService.getBranches({ limit: 100 });
        const list = Array.isArray(res) ? res : res?.data || [];
        const activeBranches = list.filter((b) => b.status === 'ACTIVE');
        setBranches(activeBranches);
        if (activeBranches.length > 0 && !selectedBranchId) {
          setSelectedBranchId(activeBranches[0].id);
        }
      } catch {
        setBranches([]);
      }
    };
    fetchBranches();
  }, []);

  const selectedBranch = useMemo(() => {
    return branches.find((b) => b.id === selectedBranchId) || null;
  }, [branches, selectedBranchId]);

  // Sinh danh sách khung giờ hẹn lấy hợp lệ theo chi nhánh và ngày đã chọn
  const timeSlots = useMemo(() => {
    if (!selectedBranch) return [];
    const openTime = selectedBranch.openingTime || '08:00';
    const closeTime = selectedBranch.closingTime || '22:00';

    const [openH, openM] = openTime.split(':').map(Number);
    const [closeH, closeM] = closeTime.split(':').map(Number);

    const openMinutes = openH * 60 + (openM || 0);
    const closeMinutes = closeH * 60 + (closeM || 0);

    const now = new Date();
    const isToday = pickupDate === toLocalDateString(now);
    const currentMinutes = now.getHours() * 60 + now.getMinutes() + 20; // Đặt trước 20p

    const slots = [];
    for (let m = openMinutes; m <= closeMinutes; m += 30) {
      if (isToday && m < currentMinutes) continue;
      const hStr = String(Math.floor(m / 60)).padStart(2, '0');
      const mStr = String(m % 60).padStart(2, '0');
      slots.push(`${hStr}:${mStr}`);
    }
    return slots;
  }, [selectedBranch, pickupDate]);

  // Tự động chọn slot đầu tiên nếu chưa chọn hoặc slot cũ không hợp lệ
  useEffect(() => {
    if (timeSlots.length > 0 && (!pickupTime || !timeSlots.includes(pickupTime))) {
      setPickupTime(timeSlots[0]);
    }
  }, [timeSlots, pickupTime]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBranchId) {
      toast.error('Vui lòng chọn chi nhánh ghé lấy món');
      return;
    }
    if (!pickupDate || !pickupTime) {
      toast.error('Vui lòng chọn ngày và giờ hẹn ghé lấy món');
      return;
    }
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Vui lòng nhập họ tên và số điện thoại người nhận');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        branchId: selectedBranchId,
        pickupDate,
        pickupTime,
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        customerEmail: form.email?.trim() || undefined,
        specialNotes: form.notes?.trim() || undefined,
        items: items.map((i) => ({
          menuItemId: i.id,
          quantity: i.quantity || 1,
          note: i.selectedOption ? `Lựa chọn: ${i.selectedOption}` : undefined,
        })),
      };

      const res = await pickupOrderService.createPickupOrder(payload);
      const order = res?.data || res;
      setCreatedOrder(order);
      clearCart();
      toast.success('Đặt món mang về thành công!');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra khi đặt món mang về.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdOrder) {
    return (
      <PageWrapper>
        <section className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-light dark:bg-dark">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full mx-4 bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-card border border-light-border dark:border-dark-border text-center">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={44} className="text-success" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary dark:text-white mb-2">Đặt Món Thành Công!</h2>
            <p className="text-xs text-text-secondary dark:text-text-light mb-4">
              Mã nhận hàng của bạn là <strong className="font-mono text-primary text-base">{createdOrder.orderCode}</strong>
            </p>

            <div className="p-4 bg-light-card dark:bg-dark-card rounded-2xl text-xs space-y-2 text-left mb-6 border border-light-border dark:border-dark-border">
              <p className="text-text-secondary dark:text-text-light">
                Chi nhánh nhận: <strong className="text-text-primary dark:text-white">{selectedBranch?.name}</strong>
              </p>
              <p className="text-text-secondary dark:text-text-light">
                Giờ hẹn lấy: <strong className="text-primary">{createdOrder.pickupTime} ({new Date(createdOrder.pickupDate).toLocaleDateString('vi-VN')})</strong>
              </p>
              <p className="text-text-secondary dark:text-text-light">
                Tổng tiền thanh toán tại quầy: <strong className="text-text-primary dark:text-white">{formatPrice(Number(createdOrder.totalAmount))}</strong>
              </p>
            </div>

            <button
              onClick={() => navigate(`/order/${createdOrder.id || createdOrder.orderCode}`)}
              className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl transition-all shadow-glow cursor-pointer"
            >
              Theo dõi tiến trình chế biến & Xem mã QR
            </button>
          </motion.div>
        </section>
      </PageWrapper>
    );
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <PageWrapper>
      <section className="pt-28 pb-20 bg-light dark:bg-dark min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)]">
              Xác Nhận Đặt Món Mang Về (Pick-up)
            </h1>
            <p className="text-xs text-text-secondary dark:text-text-light mt-1">
              Chọn chi nhánh và khung giờ hẹn ghé lấy món để nhà hàng chuẩn bị sẵn sàng (RRMS-32)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form inputs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Chọn chi nhánh & giờ hẹn */}
              <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border shadow-sm space-y-4">
                <h2 className="text-base font-bold text-text-primary dark:text-white flex items-center gap-2">
                  <Building2 size={18} className="text-primary" />
                  <span>Địa Điểm & Khung Giờ Hẹn Lấy</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Chi nhánh */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-text-secondary dark:text-text-light mb-1.5">
                      Chi nhánh ghé lấy món *
                    </label>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} — {b.streetAddress || b.address}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ngày hẹn lấy */}
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary dark:text-text-light mb-1.5">
                      Ngày hẹn lấy *
                    </label>
                    <input
                      type="date"
                      min={toLocalDateString(new Date())}
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white outline-none"
                      required
                    />
                  </div>

                  {/* Khung giờ hẹn lấy */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-text-secondary dark:text-text-light mb-1.5">
                      Khung giờ hẹn ghé lấy *
                    </label>
                    {timeSlots.length === 0 ? (
                      <div className="p-2.5 bg-amber-50 rounded-xl text-amber-800 text-xs flex items-center gap-1.5">
                        <AlertCircle size={14} />
                        <span>Đã hết khung giờ phục vụ trong ngày đã chọn.</span>
                      </div>
                    ) : (
                      <select
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white font-bold outline-none"
                        required
                      >
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Thông tin người nhận */}
              <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border shadow-sm space-y-4">
                <h2 className="text-base font-bold text-text-primary dark:text-white flex items-center gap-2">
                  <User size={18} className="text-primary" />
                  <span>Thông Tin Người Nhận Món</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary dark:text-text-light mb-1.5">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-2.5 text-xs bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary dark:text-text-light mb-1.5">
                      Số điện thoại nhận hàng *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="0912345678"
                      className="w-full px-4 py-2.5 text-xs bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-text-secondary dark:text-text-light mb-1.5">
                      Email (không bắt buộc)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      className="w-full px-4 py-2.5 text-xs bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-text-secondary dark:text-text-light mb-1.5">
                      Ghi chú đặc biệt cho nhà hàng
                    </label>
                    <textarea
                      name="notes"
                      rows={2}
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Ví dụ: Đóng gói hộp riêng, không cay..."
                      className="w-full px-4 py-2 text-xs bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Phương thức thanh toán */}
              <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border shadow-sm space-y-3">
                <h2 className="text-base font-bold text-text-primary dark:text-white flex items-center gap-2">
                  <Banknote size={18} className="text-primary" />
                  <span>Phương Thức Thanh Toán</span>
                </h2>
                <div className="p-4 bg-light-card dark:bg-dark-card rounded-xl border border-primary/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Banknote size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary dark:text-white">Thanh toán trực tiếp tại quầy khi nhận món</p>
                    <p className="text-[11px] text-text-secondary dark:text-text-light">Tiền mặt, thẻ ngân hàng hoặc ví điện tử tại quầy thu ngân</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-card border border-light-border dark:border-dark-border space-y-4">
                <h3 className="text-base font-bold text-text-primary dark:text-white flex items-center gap-2">
                  <ShoppingBag size={18} className="text-primary" />
                  <span>Tóm Tắt Đơn Hàng ({items.length} món)</span>
                </h3>

                <div className="divide-y divide-gray-100 dark:divide-dark-border max-h-60 overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-text-primary dark:text-white">
                          {item.quantity}x {item.name}
                        </p>
                        {item.selectedOption && (
                          <p className="text-[11px] text-text-secondary dark:text-text-light italic">
                            {item.selectedOption}
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-text-primary dark:text-white">
                        {formatPrice((item.price + (item.selectedOptionPrice || 0)) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-light-border dark:border-dark-border space-y-2 text-xs">
                  <div className="flex justify-between text-text-secondary dark:text-text-light">
                    <span>Tạm tính</span>
                    <span className="font-medium text-text-primary dark:text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary dark:text-text-light">
                    <span>Phí đóng gói mang về</span>
                    <span className="font-bold text-success">Miễn phí</span>
                  </div>
                  <div className="pt-2 border-t border-light-border dark:border-dark-border flex justify-between items-baseline">
                    <span className="font-bold text-sm text-text-primary dark:text-white">Tổng cộng</span>
                    <span className="text-xl font-extrabold text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || timeSlots.length === 0}
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-full transition-all hover:scale-[1.02] shadow-glow cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang gửi đơn...' : `Đặt món (${formatPrice(total)})`}
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
