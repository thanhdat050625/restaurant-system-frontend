import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Clock,
  Users,
  MapPin,
  UtensilsCrossed,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Building2,
  Lock,
} from 'lucide-react';
import PageWrapper from '../../layouts/PageWrapper';
import { timeSlots } from '../../assets/data/restaurantData';
import { useCart } from '../../features/menu/CartContext';
import { useAuth } from '../../features/auth/AuthContext';
import { formatPrice } from '../../utils/helpers';
import { branchService } from '../../services/admin/branchService';
import { tableService } from '../../services/admin/tableService';
import { socketService } from '../../services/socketService';
import { publicMenuService } from '../../services/publicMenuService';
import TableMap from '../../components/table/TableMap';
import toast from 'react-hot-toast';

const Reservation = () => {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [wantPreOrder, setWantPreOrder] = useState(false);
  const [preOrderItems, setPreOrderItems] = useState([]);
  const { addItem } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Chi nhánh & Bàn
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loadingTables, setLoadingTables] = useState(false);
  const [menuList, setMenuList] = useState([]);

  // Generate dates for next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      value: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' }),
    };
  });

  const [form, setForm] = useState({
    date: dates[0]?.value || '',
    time: '18:00',
    guests: 2,
    name: user?.name || user?.fullName || '',
    phone: user?.phone || '',
    note: '',
  });

  // 1. Tải danh sách chi nhánh và thực đơn ban đầu
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [branchesRes, menuItemsRes] = await Promise.all([
          branchService.getBranches({ limit: 50 }),
          publicMenuService.getMenuItems({ limit: 50 }),
        ]);

        let bList = [];
        if (Array.isArray(branchesRes)) bList = branchesRes;
        else if (Array.isArray(branchesRes?.data)) bList = branchesRes.data;
        else if (Array.isArray(branchesRes?.data?.items)) bList = branchesRes.data.items;

        setBranches(bList);
        if (bList.length > 0) {
          setSelectedBranchId(bList[0].id);
        }

        if (menuItemsRes && menuItemsRes.length > 0) {
          setMenuList(menuItemsRes);
        }
      } catch (err) {
        console.error('Error fetching branches/menu for reservation:', err);
      }
    };

    fetchInitial();
  }, []);

  // Cập nhật thông tin user nếu đăng nhập sau đó
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || user.fullName || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  // 2. Tra cứu bàn khả dụng khi chọn chi nhánh & số lượng khách
  const fetchAvailableTables = useCallback(async () => {
    if (!selectedBranchId) return;

    try {
      setLoadingTables(true);
      const res = await tableService.searchAvailableTables({
        branchId: selectedBranchId,
        partySize: form.guests,
        includeLocked: true,
      });

      let tList = [];
      if (Array.isArray(res)) tList = res;
      else if (Array.isArray(res?.data)) tList = res.data;

      setTables(tList);

      // Nếu bàn đã chọn trước đó không còn thuộc danh sách khả dụng
      if (selectedTable && !tList.some((t) => t.id === selectedTable.id)) {
        setSelectedTable(null);
      }
    } catch (err) {
      console.error('Error searching available tables:', err);
    } finally {
      setLoadingTables(false);
    }
  }, [selectedBranchId, form.guests, selectedTable]);

  useEffect(() => {
    fetchAvailableTables();
  }, [selectedBranchId, form.guests]);

  // 3. Kết nối WebSocket realtime cho chi nhánh đã chọn
  useEffect(() => {
    if (!selectedBranchId) return;

    socketService.connect();
    socketService.joinBranch(selectedBranchId);

    const handleTableLocked = (lockInfo) => {
      setTables((prev) =>
        prev.map((t) =>
          t.id === lockInfo.tableId
            ? {
                ...t,
                lockStatus: {
                  isLocked: true,
                  lockedByMe: user?.id ? lockInfo.lockedBy === user.id : false,
                  expiresIn: 600,
                },
              }
            : t
        )
      );

      // Nếu chính user này vừa lock thành công
      if (user?.id && lockInfo.lockedBy === user.id) {
        const found = tables.find((t) => t.id === lockInfo.tableId);
        if (found) {
          setSelectedTable(found);
        }
      }
    };

    const handleTableReleased = ({ tableId }) => {
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId
            ? {
                ...t,
                lockStatus: {
                  isLocked: false,
                  lockedByMe: false,
                  expiresIn: null,
                },
              }
            : t
        )
      );

      if (selectedTable?.id === tableId) {
        setSelectedTable(null);
      }
    };

    const handleLockSuccess = (lockInfo) => {
      const lockedTbl = tables.find((t) => t.id === lockInfo.tableId);
      if (lockedTbl) {
        setSelectedTable(lockedTbl);
      }
      toast.success(`Đã giữ bàn ${lockInfo.tableNumber || ''} thành công trong 10 phút!`);
    };

    const handleLockFailed = (err) => {
      toast.error(err.reason || 'Bàn này vừa được người khác giữ chỗ. Vui lòng chọn bàn khác.');
    };

    socketService.on('table:locked', handleTableLocked);
    socketService.on('table:released', handleTableReleased);
    socketService.on('table:lock_success', handleLockSuccess);
    socketService.on('table:lock_failed', handleLockFailed);

    return () => {
      socketService.off('table:locked', handleTableLocked);
      socketService.off('table:released', handleTableReleased);
      socketService.off('table:lock_success', handleLockSuccess);
      socketService.off('table:lock_failed', handleLockFailed);
      socketService.leaveBranch(selectedBranchId);
    };
  }, [selectedBranchId, user?.id, tables, selectedTable]);

  // 4. Xử lý click chọn bàn trên TableMap
  const handleSelectTable = (table) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thực hiện chọn và giữ bàn.');
      return;
    }

    if (!selectedBranchId) {
      toast.error('Vui lòng chọn chi nhánh trước.');
      return;
    }

    // Nếu bấm lại vào bàn chính mình đang giữ -> Hủy giữ
    if (selectedTable?.id === table.id) {
      socketService.releaseTable(selectedBranchId, table.id);
      setSelectedTable(null);
      toast('Đã nhả bàn.', { icon: 'ℹ️' });
      return;
    }

    // Gửi yêu cầu giữ bàn qua WebSocket
    socketService.lockTable(selectedBranchId, table.id);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    await new Promise((r) => setTimeout(r, 1200));
    setIsSuccess(true);
    toast.success('Tạo đơn đặt bàn thành công!');
  };

  const togglePreOrderItem = (item) => {
    setPreOrderItems((prev) =>
      prev.find((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, { ...item, quantity: 1 }]
    );
  };

  const activeBranch = branches.find((b) => b.id === selectedBranchId);

  if (isSuccess) {
    return (
      <PageWrapper>
        <section className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-light dark:bg-dark">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md mx-auto p-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} className="text-success" />
            </motion.div>
            <h2 className="text-3xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] mb-3">
              Đặt Bàn Thành Công!
            </h2>
            <p className="text-sm text-text-secondary dark:text-gray-400 mb-6">
              Chúng tôi đã ghi nhận yêu cầu và giữ bàn cho bạn.
            </p>
            <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border text-left space-y-2.5">
              <p className="text-sm text-text-secondary dark:text-text-light">
                <strong className="text-text-primary dark:text-white">Chi nhánh:</strong> {activeBranch?.name}
              </p>
              <p className="text-sm text-text-secondary dark:text-text-light">
                <strong className="text-text-primary dark:text-white">Bàn chọn:</strong> {selectedTable ? `${selectedTable.tableNumber} (Tầng ${selectedTable.floor})` : 'Tự động xếp'}
              </p>
              <p className="text-sm text-text-secondary dark:text-text-light">
                <strong className="text-text-primary dark:text-white">Ngày đến:</strong> {form.date}
              </p>
              <p className="text-sm text-text-secondary dark:text-text-light">
                <strong className="text-text-primary dark:text-white">Giờ:</strong> {form.time}
              </p>
              <p className="text-sm text-text-secondary dark:text-text-light">
                <strong className="text-text-primary dark:text-white">Số khách:</strong> {form.guests} người
              </p>
              {preOrderItems.length > 0 && (
                <p className="text-sm text-primary font-medium pt-2 border-t border-gray-100 dark:border-dark-border">
                  🍽️ {preOrderItems.length} món đã được đặt trước
                </p>
              )}
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
            Đặt Bàn & <span className="gradient-text">Chọn Sơ Đồ Bàn</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-white/70 max-w-xl mx-auto text-sm sm:text-base">
            Xem trực tiếp sơ đồ bàn chi nhánh thời gian thực, giữ bàn ngay trong 10 phút và đặt trước món ăn.
          </motion.p>
        </div>
      </section>

      {/* Steps indicator */}
      <section className="bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border sticky top-16 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {['1. Chọn chi nhánh & Bàn', '2. Thông tin & Món ăn', '3. Xác nhận'].map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > i + 1 ? 'bg-success text-white' : step === i + 1 ? 'bg-primary text-white' : 'bg-light-card dark:bg-dark-card text-text-light'}`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-xs sm:text-sm font-medium hidden sm:block ${step === i + 1 ? 'text-primary font-bold' : 'text-text-light'}`}>
                  {label}
                </span>
                {i < 2 && <div className={`w-8 sm:w-20 h-0.5 mx-2 ${step > i + 1 ? 'bg-success' : 'bg-light-border dark:border-dark-border'}`} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Content */}
      <section className="py-10 bg-light dark:bg-dark min-h-[60vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {/* ─── BƯỚC 1: CHỌN CHI NHÁNH, THỜI GIAN & SƠ ĐỒ BÀN ─── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
                {/* 1. Chọn Chi Nhánh */}
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border">
                  <h3 className="font-bold text-text-primary dark:text-white mb-3 flex items-center gap-2 text-base">
                    <Building2 size={20} className="text-primary" /> Chọn Chi Nhánh
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {branches.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setSelectedBranchId(b.id);
                          setSelectedTable(null);
                        }}
                        className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                          selectedBranchId === b.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-light-border dark:border-dark-border hover:border-primary/40'
                        }`}
                      >
                        <p className={`font-bold text-sm ${selectedBranchId === b.id ? 'text-primary' : 'text-text-primary dark:text-white'}`}>
                          {b.name}
                        </p>
                        <p className="text-xs text-text-secondary dark:text-gray-400 mt-1 line-clamp-1">
                          {b.address || 'Hồ Chí Minh'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Ngày, Giờ & Số khách */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Ngày */}
                  <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-light-border dark:border-dark-border">
                    <h3 className="font-bold text-text-primary dark:text-white mb-3 flex items-center gap-2 text-sm">
                      <CalendarDays size={18} className="text-primary" /> Ngày đến
                    </h3>
                    <select
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      className="w-full py-2.5 px-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-text-primary dark:text-white outline-none focus:border-primary"
                    >
                      {dates.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Giờ */}
                  <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-light-border dark:border-dark-border">
                    <h3 className="font-bold text-text-primary dark:text-white mb-3 flex items-center gap-2 text-sm">
                      <Clock size={18} className="text-primary" /> Khung giờ
                    </h3>
                    <select
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      className="w-full py-2.5 px-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-text-primary dark:text-white outline-none focus:border-primary"
                    >
                      {timeSlots.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Số khách */}
                  <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-light-border dark:border-dark-border">
                    <h3 className="font-bold text-text-primary dark:text-white mb-3 flex items-center gap-2 text-sm">
                      <Users size={18} className="text-primary" /> Số lượng khách
                    </h3>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, guests: Math.max(1, form.guests - 1) })}
                        className="w-9 h-9 rounded-lg bg-light-card dark:bg-dark-card hover:bg-primary/10 text-text-primary dark:text-white flex items-center justify-center font-bold text-lg"
                      >
                        -
                      </button>
                      <span className="text-xl font-bold text-text-primary dark:text-white font-mono">
                        {form.guests} người
                      </span>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, guests: Math.min(20, form.guests + 1) })}
                        className="w-9 h-9 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center font-bold text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. SƠ ĐỒ BÀN THỜI GIAN THỰC (TABLE MAP) */}
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h3 className="font-bold text-text-primary dark:text-white text-base flex items-center gap-2">
                        <MapPin size={20} className="text-primary" /> Sơ đồ bàn chi nhánh (Real-time)
                      </h3>
                      <p className="text-xs text-text-secondary dark:text-gray-400 mt-0.5">
                        Chọn bàn yêu thích. Bàn sẽ được giữ cho bạn trong 10 phút.
                      </p>
                    </div>

                    {selectedTable && (
                      <div className="bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-xl text-primary font-bold text-xs flex items-center gap-1.5 self-start">
                        <CheckCircle2 size={16} />
                        <span>Đã chọn: Bàn {selectedTable.tableNumber} (Tầng {selectedTable.floor})</span>
                      </div>
                    )}
                  </div>

                  <TableMap
                    tables={tables}
                    mode="customer"
                    selectedTableId={selectedTable?.id}
                    onSelectTable={handleSelectTable}
                    partySize={form.guests}
                    loading={loadingTables}
                  />
                </div>

                {/* Nút Chuyển Bước */}
                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="text-xs text-text-secondary dark:text-gray-400">
                    {!selectedTable ? (
                      <span className="text-amber-500 font-medium">⚠️ Vui lòng click chọn 1 bàn trên sơ đồ để tiếp tục.</span>
                    ) : (
                      <span className="text-emerald-500 font-medium">✓ Đã giữ bàn {selectedTable.tableNumber}.</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!selectedTable}
                    className="py-3.5 px-8 bg-primary hover:bg-primary-dark disabled:opacity-40 text-white font-bold text-sm rounded-full transition-all shadow-md flex items-center gap-2"
                  >
                    <span>Tiếp theo</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── BƯỚC 2: THÔNG TIN LIÊN HỆ & ĐẶT MÓN TRƯỚC ─── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
                {/* Thông tin liên hệ */}
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border">
                  <h3 className="font-bold text-text-primary dark:text-white mb-4 text-base">Thông tin liên hệ</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-text-primary dark:text-white mb-1.5">
                        Họ tên *
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Nguyễn Văn A"
                        className="w-full px-4 py-2.5 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-sm text-text-primary dark:text-white outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-primary dark:text-white mb-1.5">
                        Số điện thoại *
                      </label>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        placeholder="0912 345 678"
                        className="w-full px-4 py-2.5 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-sm text-text-primary dark:text-white outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-text-primary dark:text-white mb-1.5">
                      Ghi chú / Yêu cầu đặc biệt
                    </label>
                    <textarea
                      name="note"
                      value={form.note}
                      onChange={handleChange}
                      rows={2}
                      placeholder="VD: Tổ chức sinh nhật, chuẩn bị ghế trẻ em..."
                      className="w-full px-4 py-2.5 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-sm text-text-primary dark:text-white outline-none focus:border-primary resize-none"
                    />
                  </div>
                </div>

                {/* Tùy chọn đặt món trước từ Thực đơn chuỗi */}
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-text-primary dark:text-white flex items-center gap-2 text-base">
                      <UtensilsCrossed size={20} className="text-primary" /> Đặt trước món ăn?
                    </h3>
                    <button
                      type="button"
                      onClick={() => setWantPreOrder(!wantPreOrder)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        wantPreOrder ? 'bg-primary' : 'bg-light-card dark:bg-dark-card'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          wantPreOrder ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-text-secondary dark:text-gray-400 text-xs mb-4">
                    Nhà hàng sẽ chuẩn bị món sẵn sàng để phục vụ ngay khi bạn đến bàn.
                  </p>

                  {wantPreOrder && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                        {menuList.slice(0, 16).map((item) => {
                          const isSelected = preOrderItems.some((i) => i.id === item.id);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => togglePreOrderItem(item)}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-light-border dark:border-dark-border hover:border-primary/40'
                              }`}
                            >
                              <img
                                src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-text-primary dark:text-white line-clamp-1">{item.name}</p>
                                <p className="text-xs text-primary font-semibold">{formatPrice(Number(item.price))}</p>
                              </div>
                              {isSelected && <CheckCircle2 size={18} className="text-primary shrink-0 ml-auto" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Nút quay lại & tiếp tục */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 border-2 border-light-border dark:border-dark-border text-text-primary dark:text-white font-bold rounded-full transition-all hover:bg-light-card dark:hover:bg-dark-card flex items-center justify-center gap-2 text-sm"
                  >
                    <ChevronLeft size={18} /> Quay lại sơ đồ
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!form.name || !form.phone}
                    className="flex-1 py-3.5 bg-primary hover:bg-primary-dark disabled:opacity-40 text-white font-bold rounded-full transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                  >
                    <span>Xem xác nhận</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── BƯỚC 3: XÁC NHẬN ĐẶT BÀN ─── */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border">
                  <h3 className="font-bold text-text-primary dark:text-white mb-4 text-lg">Xác nhận thông tin đặt bàn</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3.5 bg-light-card dark:bg-dark-card rounded-xl">
                      <Building2 size={20} className="text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-text-light">Chi nhánh</p>
                        <p className="text-sm font-bold text-text-primary dark:text-white">{activeBranch?.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3.5 bg-light-card dark:bg-dark-card rounded-xl">
                      <CheckCircle2 size={20} className="text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-text-light">Bàn đã chọn</p>
                        <p className="text-sm font-bold text-primary">
                          Bàn {selectedTable?.tableNumber} - Tầng {selectedTable?.floor} ({selectedTable?.tableType?.capacity || 2} chỗ)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3.5 bg-light-card dark:bg-dark-card rounded-xl">
                      <CalendarDays size={20} className="text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-text-light">Ngày đến</p>
                        <p className="text-sm font-bold text-text-primary dark:text-white">{form.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3.5 bg-light-card dark:bg-dark-card rounded-xl">
                      <Clock size={20} className="text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-text-light">Giờ đến</p>
                        <p className="text-sm font-bold text-text-primary dark:text-white">{form.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3.5 bg-light-card dark:bg-dark-card rounded-xl">
                      <Users size={20} className="text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-text-light">Số lượng khách</p>
                        <p className="text-sm font-bold text-text-primary dark:text-white">{form.guests} người</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3.5 bg-light-card dark:bg-dark-card rounded-xl">
                      <Users size={20} className="text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-text-light">Khách hàng</p>
                        <p className="text-sm font-bold text-text-primary dark:text-white">{form.name} ({form.phone})</p>
                      </div>
                    </div>
                  </div>

                  {preOrderItems.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-light-border dark:border-dark-border">
                      <p className="font-bold text-text-primary dark:text-white mb-2 text-sm">
                        🍽️ Món đặt trước ({preOrderItems.length} món):
                      </p>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {preOrderItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-gray-50 dark:bg-dark-card">
                            <span className="text-text-secondary dark:text-text-light font-medium">{item.name}</span>
                            <span className="text-primary font-bold">{formatPrice(Number(item.price))}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {form.note && (
                    <div className="mt-4 p-3 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs">
                      <strong>Ghi chú:</strong> {form.note}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-3.5 border-2 border-light-border dark:border-dark-border text-text-primary dark:text-white font-bold rounded-full transition-all hover:bg-light-card dark:hover:bg-dark-card flex items-center justify-center gap-2 text-sm"
                  >
                    <ChevronLeft size={18} /> Sửa thông tin
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-full transition-all shadow-lg shadow-primary/30 text-sm"
                  >
                    Xác nhận hoàn tất đặt bàn
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
