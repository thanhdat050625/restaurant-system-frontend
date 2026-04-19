import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Package, CalendarDays, LogOut, Edit3 } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/helpers';

const mockOrders = [
  { id: 'FH20260001', date: '19/04/2026', status: 'Đang giao', total: 615000, items: 3, statusColor: 'bg-primary/10 text-primary' },
  { id: 'FH20260002', date: '17/04/2026', status: 'Hoàn thành', total: 325000, items: 2, statusColor: 'bg-success/10 text-success' },
  { id: 'FH20260003', date: '15/04/2026', status: 'Hoàn thành', total: 480000, items: 4, statusColor: 'bg-success/10 text-success' },
];

const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <PageWrapper>
      <section className="pt-28 pb-20 bg-light dark:bg-dark min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-primary to-accent p-8 rounded-2xl mb-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative flex items-center gap-6">
                <img src={user?.avatar || 'https://i.pravatar.cc/100?img=11'} alt="" className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/30" />
                <div>
                  <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">{user?.name || 'Khách'}</h1>
                  <p className="text-white/80 text-sm">{user?.email || 'Chưa đăng nhập'}</p>
                </div>
                <button className="ml-auto p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"><Edit3 size={18} /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left - Info */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border">
                  <h3 className="font-bold text-text-primary dark:text-white mb-4">Thông tin cá nhân</h3>
                  <div className="space-y-4">
                    {[
                      { icon: User, label: 'Họ tên', value: user?.name || 'N/A' },
                      { icon: Mail, label: 'Email', value: user?.email || 'N/A' },
                      { icon: Phone, label: 'SĐT', value: user?.phone || 'N/A' },
                      { icon: MapPin, label: 'Địa chỉ', value: '123 Nguyễn Huệ, Q.1' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-light-card dark:bg-dark-card rounded-xl flex items-center justify-center"><item.icon size={18} className="text-primary" /></div>
                        <div>
                          <p className="text-xs text-text-light">{item.label}</p>
                          <p className="text-sm font-medium text-text-primary dark:text-white">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-error/30 text-error rounded-xl font-medium hover:bg-error/5 transition-colors">
                  <LogOut size={18} /> Đăng xuất
                </button>
              </div>

              {/* Right - Orders */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border">
                  <h3 className="font-bold text-text-primary dark:text-white mb-4 flex items-center gap-2"><Package size={20} className="text-primary" /> Lịch sử đơn hàng</h3>
                  <div className="space-y-4">
                    {mockOrders.map(order => (
                      <div key={order.id} className="flex items-center gap-4 p-4 bg-light-card dark:bg-dark-card rounded-xl hover:bg-light-border dark:hover:bg-dark-border transition-colors cursor-pointer">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"><Package size={20} className="text-primary" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-text-primary dark:text-white text-sm">#{order.id}</p>
                          <p className="text-xs text-text-light">{order.date} · {order.items} món</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-text-primary dark:text-white text-sm">{formatPrice(order.total)}</p>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${order.statusColor}`}>{order.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Profile;
