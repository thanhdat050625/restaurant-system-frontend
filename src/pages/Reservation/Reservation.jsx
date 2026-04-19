import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Clock, Users, MapPin, UtensilsCrossed, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import MenuCard from '../../components/common/MenuCard';
import { menuItems } from '../../data/menuData';
import { timeSlots } from '../../data/restaurantData';
import { SEATING_AREAS } from '../../constants';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';

const Reservation = () => {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [wantPreOrder, setWantPreOrder] = useState(false);
  const [preOrderItems, setPreOrderItems] = useState([]);
  const { addItem } = useCart();

  const [form, setForm] = useState({
    date: '',
    time: '',
    guests: 2,
    area: 'indoor',
    name: '',
    phone: '',
    note: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    await new Promise(r => setTimeout(r, 1500));
    setIsSuccess(true);
  };

  const togglePreOrderItem = (item) => {
    setPreOrderItems(prev =>
      prev.find(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, { ...item, quantity: 1 }]
    );
  };

  // Generate dates for next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { value: d.toISOString().split('T')[0], label: d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' }) };
  });

  if (isSuccess) {
    return (
      <PageWrapper>
        <section className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-light dark:bg-dark">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md mx-auto">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} className="text-success" />
            </motion.div>
            <h2 className="text-3xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] mb-3">Đặt Bàn Thành Công!</h2>
            <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border text-left mt-6 space-y-2">
              <p className="text-sm text-text-secondary dark:text-text-light"><strong className="text-text-primary dark:text-white">Ngày:</strong> {form.date}</p>
              <p className="text-sm text-text-secondary dark:text-text-light"><strong className="text-text-primary dark:text-white">Giờ:</strong> {form.time}</p>
              <p className="text-sm text-text-secondary dark:text-text-light"><strong className="text-text-primary dark:text-white">Số khách:</strong> {form.guests}</p>
              <p className="text-sm text-text-secondary dark:text-text-light"><strong className="text-text-primary dark:text-white">Khu vực:</strong> {SEATING_AREAS.find(a => a.id === form.area)?.name}</p>
              {preOrderItems.length > 0 && <p className="text-sm text-primary font-medium">🍽️ {preOrderItems.length} món đã được đặt trước</p>}
            </div>
          </motion.div>
        </section>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative pt-28 pb-16 bg-gradient-to-br from-dark via-dark-surface to-dark overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
            Đặt Bàn <span className="gradient-text">Nhà Hàng</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-white/70 max-w-lg mx-auto">
            Đặt bàn trước, có thể order món sẵn hoặc tới nơi rồi order
          </motion.p>
        </div>
      </section>

      {/* Steps indicator */}
      <section className="bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {['Thời gian & Khách', 'Thông tin', 'Xác nhận'].map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > i + 1 ? 'bg-success text-white' : step === i + 1 ? 'bg-primary text-white' : 'bg-light-card dark:bg-dark-card text-text-light'}`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step === i + 1 ? 'text-primary' : 'text-text-light'}`}>{label}</span>
                {i < 2 && <div className={`w-12 sm:w-24 h-0.5 mx-2 ${step > i + 1 ? 'bg-success' : 'bg-light-border dark:bg-dark-border'}`} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 bg-light dark:bg-dark min-h-[60vh]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {/* Step 1 */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                {/* Date */}
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border">
                  <h3 className="font-bold text-text-primary dark:text-white mb-4 flex items-center gap-2"><CalendarDays size={20} className="text-primary" /> Chọn ngày</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {dates.map(d => (
                      <button key={d.value} onClick={() => setForm({ ...form, date: d.value })} className={`min-w-[80px] py-3 px-3 rounded-xl border-2 text-center text-sm transition-all ${form.date === d.value ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-light-border dark:border-dark-border text-text-secondary dark:text-text-light hover:border-primary/50'}`}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border">
                  <h3 className="font-bold text-text-primary dark:text-white mb-4 flex items-center gap-2"><Clock size={20} className="text-primary" /> Chọn giờ</h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {timeSlots.map(t => (
                      <button key={t} onClick={() => setForm({ ...form, time: t })} className={`py-2.5 rounded-xl border-2 text-sm transition-all ${form.time === t ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-light-border dark:border-dark-border text-text-secondary dark:text-text-light hover:border-primary/50'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guests */}
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border">
                  <h3 className="font-bold text-text-primary dark:text-white mb-4 flex items-center gap-2"><Users size={20} className="text-primary" /> Số khách</h3>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setForm({ ...form, guests: Math.max(1, form.guests - 1) })} className="w-10 h-10 rounded-full bg-light-card dark:bg-dark-card hover:bg-primary/10 text-text-primary dark:text-white flex items-center justify-center transition-colors text-xl">-</button>
                    <span className="text-2xl font-bold text-text-primary dark:text-white w-12 text-center">{form.guests}</span>
                    <button onClick={() => setForm({ ...form, guests: Math.min(20, form.guests + 1) })} className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors text-xl">+</button>
                  </div>
                </div>

                {/* Seating Area */}
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border">
                  <h3 className="font-bold text-text-primary dark:text-white mb-4 flex items-center gap-2"><MapPin size={20} className="text-primary" /> Khu vực</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {SEATING_AREAS.map(area => (
                      <button key={area.id} onClick={() => setForm({ ...form, area: area.id })} className={`py-4 rounded-xl border-2 text-center transition-all ${form.area === area.id ? 'border-primary bg-primary/5' : 'border-light-border dark:border-dark-border hover:border-primary/50'}`}>
                        <div className="text-2xl mb-1">{area.icon}</div>
                        <span className={`text-sm font-medium ${form.area === area.id ? 'text-primary' : 'text-text-primary dark:text-white'}`}>{area.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => setStep(2)} disabled={!form.date || !form.time} className="w-full py-4 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold rounded-full transition-all hover:shadow-glow flex items-center justify-center gap-2">
                  Tiếp theo <ChevronRight size={18} />
                </button>
              </motion.div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border">
                  <h3 className="font-bold text-text-primary dark:text-white mb-4">Thông tin liên hệ</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Họ tên *</label>
                      <input name="name" value={form.name} onChange={handleChange} required placeholder="Nguyễn Văn A" className="w-full px-4 py-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white placeholder-text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Số điện thoại *</label>
                      <input name="phone" value={form.phone} onChange={handleChange} required placeholder="0123 456 789" className="w-full px-4 py-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white placeholder-text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Yêu cầu đặc biệt</label>
                    <textarea name="note" value={form.note} onChange={handleChange} rows={3} placeholder="VD: Bàn gần cửa sổ, sinh nhật..." className="w-full px-4 py-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white placeholder-text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
                  </div>
                </div>

                {/* Pre-order option */}
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-text-primary dark:text-white flex items-center gap-2"><UtensilsCrossed size={20} className="text-primary" /> Đặt món trước?</h3>
                    <button onClick={() => setWantPreOrder(!wantPreOrder)} className={`relative w-12 h-6 rounded-full transition-colors ${wantPreOrder ? 'bg-primary' : 'bg-light-card dark:bg-dark-card'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${wantPreOrder ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <p className="text-text-secondary dark:text-text-light text-sm mb-4">
                    Bạn có thể đặt trước món ăn để chúng tôi chuẩn bị sẵn khi bạn đến.
                  </p>

                  {wantPreOrder && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                        {menuItems.slice(0, 12).map(item => (
                          <button key={item.id} onClick={() => togglePreOrderItem(item)} className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${preOrderItems.find(i => i.id === item.id) ? 'border-primary bg-primary/5' : 'border-light-border dark:border-dark-border hover:border-primary/50'}`}>
                            <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-text-primary dark:text-white line-clamp-1">{item.name}</p>
                              <p className="text-xs text-primary font-medium">{formatPrice(item.price)}</p>
                            </div>
                            {preOrderItems.find(i => i.id === item.id) && <CheckCircle2 size={18} className="text-primary shrink-0 ml-auto" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 border-2 border-light-border dark:border-dark-border text-text-primary dark:text-white font-semibold rounded-full transition-all hover:bg-light-card dark:hover:bg-dark-card flex items-center justify-center gap-2">
                    <ChevronLeft size={18} /> Quay lại
                  </button>
                  <button onClick={() => setStep(3)} disabled={!form.name || !form.phone} className="flex-1 py-4 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold rounded-full transition-all hover:shadow-glow flex items-center justify-center gap-2">
                    Tiếp theo <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3 - Confirm */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border">
                  <h3 className="font-bold text-text-primary dark:text-white mb-6 text-lg">Xác nhận đặt bàn</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: CalendarDays, label: 'Ngày', value: form.date },
                      { icon: Clock, label: 'Giờ', value: form.time },
                      { icon: Users, label: 'Số khách', value: `${form.guests} người` },
                      { icon: MapPin, label: 'Khu vực', value: SEATING_AREAS.find(a => a.id === form.area)?.name },
                    ].map((info, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-light-card dark:bg-dark-card rounded-xl">
                        <info.icon size={20} className="text-primary shrink-0" />
                        <div>
                          <p className="text-xs text-text-light">{info.label}</p>
                          <p className="text-sm font-semibold text-text-primary dark:text-white">{info.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {preOrderItems.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-light-border dark:border-dark-border">
                      <p className="font-semibold text-text-primary dark:text-white mb-3">🍽️ Món đặt trước ({preOrderItems.length}):</p>
                      <div className="space-y-2">
                        {preOrderItems.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="text-text-secondary dark:text-text-light">{item.name}</span>
                            <span className="text-primary font-medium">{formatPrice(item.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="flex-1 py-4 border-2 border-light-border dark:border-dark-border text-text-primary dark:text-white font-semibold rounded-full transition-all hover:bg-light-card dark:hover:bg-dark-card flex items-center justify-center gap-2">
                    <ChevronLeft size={18} /> Quay lại
                  </button>
                  <button onClick={handleSubmit} className="flex-1 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition-all hover:shadow-glow">
                    Xác nhận đặt bàn
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Reservation;
