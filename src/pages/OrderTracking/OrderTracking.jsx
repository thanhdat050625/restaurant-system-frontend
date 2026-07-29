import { motion } from 'framer-motion';
import { Package, Clock, ChefHat, Truck, CheckCircle2, MapPin, Phone, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../layouts/PageWrapper';
import { formatPrice } from '../../utils/helpers';

const orderSteps = [
  { icon: CheckCircle2, label: 'Đã xác nhận', time: '18:00', done: true },
  { icon: ChefHat, label: 'Đang chuẩn bị', time: '18:05', done: true },
  { icon: Package, label: 'Đã đóng gói', time: '18:20', done: true },
  { icon: Truck, label: 'Đang giao hàng', time: '18:25', done: false, active: true },
  { icon: MapPin, label: 'Đã giao', time: '~18:40', done: false },
];

const OrderTracking = () => {
  return (
    <PageWrapper>
      <section className="pt-28 pb-20 bg-light dark:bg-dark min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium mb-6 transition-colors">
            <ArrowLeft size={18} /> Trang chủ
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Order Header */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)]">Đơn hàng #FH20260001</h1>
                  <p className="text-text-secondary dark:text-text-light text-sm mt-1">Đặt lúc 18:00, 19/04/2026</p>
                </div>
                <span className="px-4 py-2 bg-primary/10 text-primary font-semibold text-sm rounded-full">Đang giao</span>
              </div>

              {/* ETA */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Clock size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary dark:text-text-light">Dự kiến nhận hàng</p>
                  <p className="text-lg font-bold text-text-primary dark:text-white">18:35 - 18:45</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border mb-6">
              <h3 className="font-bold text-text-primary dark:text-white mb-6">Trạng thái đơn hàng</h3>
              <div className="space-y-1">
                {orderSteps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.done ? 'bg-success text-white' : step.active ? 'bg-primary text-white animate-pulse' : 'bg-light-card dark:bg-dark-card text-text-light'}`}>
                        <step.icon size={18} />
                      </div>
                      {i < orderSteps.length - 1 && (
                        <div className={`w-0.5 h-12 ${step.done ? 'bg-success' : 'bg-light-border dark:bg-dark-border'}`} />
                      )}
                    </div>
                    <div className="pb-8">
                      <p className={`font-medium ${step.done || step.active ? 'text-text-primary dark:text-white' : 'text-text-light'}`}>{step.label}</p>
                      <p className="text-sm text-text-light">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border mb-6">
              <h3 className="font-bold text-text-primary dark:text-white mb-4">Vị trí giao hàng</h3>
              <div className="w-full h-48 bg-light-card dark:bg-dark-card rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={32} className="text-primary mx-auto mb-2" />
                  <p className="text-text-secondary dark:text-text-light text-sm">Bản đồ sẽ hiển thị ở đây</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border">
              <h3 className="font-bold text-text-primary dark:text-white mb-4">Chi tiết đơn hàng</h3>
              <div className="space-y-3 mb-4">
                {[
                  { name: 'Bò Wagyu Nướng Tiêu Đen', qty: 1, price: 450000 },
                  { name: 'Trà Đào Cam Sả', qty: 2, price: 45000 },
                  { name: 'Lava Cake Chocolate', qty: 1, price: 75000 },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-text-secondary dark:text-text-light">{item.name} x{item.qty}</span>
                    <span className="text-text-primary dark:text-white font-medium">{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <hr className="border-light-border dark:border-dark-border mb-3" />
              <div className="flex justify-between text-sm mb-1"><span className="text-text-secondary dark:text-text-light">Tạm tính</span><span>{formatPrice(615000)}</span></div>
              <div className="flex justify-between text-sm mb-3"><span className="text-text-secondary dark:text-text-light">Phí giao hàng</span><span className="text-success">Miễn phí</span></div>
              <div className="flex justify-between"><span className="font-bold text-text-primary dark:text-white">Tổng cộng</span><span className="text-xl font-bold text-primary">{formatPrice(615000)}</span></div>
            </div>

            {/* Contact */}
            <div className="mt-6 text-center">
              <p className="text-text-secondary dark:text-text-light text-sm mb-2">Cần hỗ trợ?</p>
              <a href="tel:0123456789" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors">
                <Phone size={16} /> Gọi hotline: 0359 537 981
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default OrderTracking;
