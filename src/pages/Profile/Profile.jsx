import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Package, LogOut,
  AtSign, Calendar, Venus, Mars, CircleDot,
  ShieldCheck, Clock, ChevronRight, Edit3,
  CheckCircle2, XCircle, Truck, ReceiptText,
} from 'lucide-react';
import PageWrapper from '../../layouts/PageWrapper';
import { useAuth } from '../../features/auth/AuthContext';
import { formatPrice } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

/* ─── Mock orders ─────────────────────────────────────────────────────────── */
const mockOrders = [
  { id: 'FH20260001', date: '19/04/2026', status: 'Đang giao', total: 615000, items: 3, color: 'text-primary', bg: 'bg-primary/10', Icon: Truck },
  { id: 'FH20260002', date: '17/04/2026', status: 'Hoàn thành', total: 325000, items: 2, color: 'text-success', bg: 'bg-success/10', Icon: CheckCircle2 },
  { id: 'FH20260003', date: '15/04/2026', status: 'Hoàn thành', total: 480000, items: 4, color: 'text-success', bg: 'bg-success/10', Icon: CheckCircle2 },
  { id: 'FH20260004', date: '10/04/2026', status: 'Đã huỷ', total: 210000, items: 2, color: 'text-error', bg: 'bg-error/10', Icon: XCircle },
];

/* ─── Gender display helper ───────────────────────────────────────────────── */
const GenderIcon = ({ gender }) => {
  if (gender === 'MALE') return <span className="inline-flex items-center gap-1 text-blue-500"><Mars size={14} /> Nam</span>;
  if (gender === 'FEMALE') return <span className="inline-flex items-center gap-1 text-pink-500"><Venus size={14} /> Nữ</span>;
  return <span className="inline-flex items-center gap-1 text-text-light"><CircleDot size={14} /> Khác</span>;
};

/* ─── Sidebar tabs ────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'info', label: 'Thông tin cá nhân', Icon: User },
  { id: 'orders', label: 'Lịch sử đơn hàng', Icon: Package },
];

/* ════════════════════════════════════════════════════════════════════════════ */
const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');

  const avatarSrc = user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'User')}&background=FF6B35&color=fff&bold=true&size=128`;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  /* ── Shared field row ─────────────────────────────────────────────────── */
  const Field = ({ IconComp, label, value, mono = false }) => (
    <div className="flex items-start gap-4 py-4 border-b border-light-border dark:border-dark-border last:border-0">
      <div className="mt-0.5 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <IconComp size={17} className="text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-text-light uppercase tracking-wide mb-0.5">{label}</p>
        <p className={`text-sm font-semibold text-text-primary dark:text-white break-words ${mono ? 'font-mono' : ''}`}>
          {value || <span className="text-text-light font-normal italic">Chưa cập nhật</span>}
        </p>
      </div>
    </div>
  );

  /* ── Personal info tab ────────────────────────────────────────────────── */
  const InfoTab = () => (
    <motion.div key="info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary dark:text-white">Thông tin cá nhân</h2>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium">
          <Edit3 size={15} /> Chỉnh sửa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        {/* Cột trái */}
        <div>
          <Field IconComp={User} label="Họ và tên" value={user?.fullName} />
          <Field IconComp={AtSign} label="Tên đăng nhập" value={user?.username} mono />
          <Field IconComp={Mail} label="Email" value={user?.email} mono />
          <Field IconComp={Phone} label="Số điện thoại" value={user?.phone} />
        </div>
        {/* Cột phải */}
        <div>
          <Field
            IconComp={CircleDot}
            label="Giới tính"
            value={user?.gender ? <GenderIcon gender={user.gender} /> : null}
          />
          <Field IconComp={Calendar} label="Ngày sinh" value={user?.dateOfBirth} />
          <Field IconComp={MapPin} label="Địa chỉ" value={user?.address} />
          <Field
            IconComp={ShieldCheck}
            label="Vai trò"
            value={
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                {user?.role || 'USER'}
              </span>
            }
          />
        </div>
      </div>

      {/* Joined date */}
      {user?.createdAt && (
        <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border flex items-center gap-2 text-xs text-text-light">
          <Clock size={13} />
          Thành viên từ: <span className="font-medium">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
        </div>
      )}
    </motion.div>
  );

  /* ── Orders tab ───────────────────────────────────────────────────────── */
  const OrdersTab = () => (
    <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary dark:text-white">Lịch sử đơn hàng</h2>
        <span className="text-sm text-text-light">{mockOrders.length} đơn</span>
      </div>

      <div className="space-y-3">
        {mockOrders.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="group flex items-center gap-4 p-4 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
          >
            <div className={`w-12 h-12 ${order.bg} rounded-xl flex items-center justify-center shrink-0`}>
              <order.Icon size={22} className={order.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-text-primary dark:text-white text-sm">#{order.id}</p>
              <p className="text-xs text-text-light mt-0.5">{order.date} · {order.items} món</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-text-primary dark:text-white text-sm">{formatPrice(order.total)}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${order.bg} ${order.color}`}>
                {order.status}
              </span>
            </div>
            <ChevronRight size={16} className="text-text-light group-hover:text-primary transition-colors shrink-0" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  /* ══════════════════════════════════════════════════════════════════════════ */
  return (
    <PageWrapper>
      <section className="pt-28 pb-20 bg-light dark:bg-dark min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Top banner ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-r from-primary via-primary-dark to-accent rounded-3xl p-8 mb-8 overflow-hidden"
          >
            {/* decorative circles */}
            <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/10 rounded-full" />
            <div className="absolute -bottom-6 right-32 w-28 h-28 bg-white/5 rounded-full" />

            <div className="relative flex items-center gap-6">
              <div className="relative">
                <img
                  src={avatarSrc}
                  alt={user?.fullName}
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white/30 shadow-xl"
                />
                {/* online dot */}
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)] truncate">
                  {user?.fullName || 'Khách'}
                </h1>
                <p className="text-white/70 text-sm mt-0.5">@{user?.username || '---'}</p>
                <p className="text-white/60 text-xs mt-1">{user?.email}</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white text-sm font-medium">
                <ReceiptText size={16} />
                {mockOrders.length} đơn hàng
              </div>
            </div>
          </motion.div>

          {/* ── Main layout: Sidebar + Content ─────────────────────────── */}
          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── Sidebar ──────────────────────────────────────────────── */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="lg:w-64 shrink-0"
            >
              <div className="bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border p-3 sticky top-28 space-y-1">
                {TABS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${activeTab === id
                        ? 'bg-primary text-white shadow-glow'
                        : 'text-text-secondary dark:text-text-light hover:bg-light-card dark:hover:bg-dark-card'
                      }`}
                  >
                    <Icon size={18} />
                    {label}
                    {activeTab === id && <ChevronRight size={16} className="ml-auto" />}
                  </button>
                ))}

                {/* Divider */}
                <div className="pt-2 mt-2 border-t border-light-border dark:border-dark-border">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-all"
                  >
                    <LogOut size={18} />
                    Đăng xuất
                  </button>
                </div>
              </div>
            </motion.aside>

            {/* ── Content panel ────────────────────────────────────────── */}
            <motion.main
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              className="flex-1 bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border p-6 lg:p-8"
            >
              <AnimatePresence mode="wait">
                {activeTab === 'info' && <InfoTab key="info" />}
                {activeTab === 'orders' && <OrdersTab key="orders" />}
              </AnimatePresence>
            </motion.main>

          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Profile;
