import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  ShoppingBag,
  Send,
  UtensilsCrossed,
  Clock,
  Trash2,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import { dineInService } from '../../services/dineInService';
import {
  IDineInMenuItem,
  IDineInOrderBatch,
  IDineInTableInfo,
  IInvoice,
} from '../../types/dine-in.type';
import { formatPrice } from '../../utils/helpers';

interface CartEntry {
  menuItem: IDineInMenuItem;
  quantity: number;
  note: string;
}

interface DineInMenuTabProps {
  table: IDineInTableInfo;
  menu: IDineInMenuItem[];
  activeInvoice: IInvoice | null;
  onOrderSubmitted: (updatedInvoice: IInvoice, batch: IDineInOrderBatch) => void;
}

export const DineInMenuTab: React.FC<DineInMenuTabProps> = ({
  table,
  menu,
  activeInvoice,
  onOrderSubmitted,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [cart, setCart] = useState<Record<string, CartEntry>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [batchNote, setBatchNote] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of menu) {
      if (item.category?.id && item.category?.name) {
        map.set(item.category.id, item.category.name);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [menu]);

  const filteredMenu = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return menu.filter((item) => {
      const matchesCat =
        selectedCategoryId === 'ALL' || item.category?.id === selectedCategoryId;
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [menu, searchTerm, selectedCategoryId]);

  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const totalCount = useMemo(
    () => cartItems.reduce((sum, entry) => sum + entry.quantity, 0),
    [cartItems],
  );
  const totalPrice = useMemo(
    () => cartItems.reduce((sum, entry) => sum + Number(entry.menuItem.price) * entry.quantity, 0),
    [cartItems],
  );

  const isPaymentLocked =
    activeInvoice?.status === 'PAID' || activeInvoice?.status === 'CANCELLED';
  const isMaintenance = table.status === 'MAINTENANCE';

  const handleIncrease = (item: IDineInMenuItem) => {
    if (isMaintenance || isPaymentLocked) return;
    setCart((prev) => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: {
          menuItem: item,
          quantity: existing ? existing.quantity + 1 : 1,
          note: existing?.note || '',
        },
      };
    });
  };

  const handleDecrease = (itemId: string) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return {
        ...prev,
        [itemId]: { ...existing, quantity: existing.quantity - 1 },
      };
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const handleItemNoteChange = (itemId: string, note: string) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      return {
        ...prev,
        [itemId]: { ...existing, note },
      };
    });
  };

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) return;

    setSubmitting(true);
    try {
      const res = await dineInService.createOrderBatch(table.id, {
        items: cartItems.map((entry) => ({
          menuItemId: entry.menuItem.id,
          quantity: entry.quantity,
          note: entry.note.trim() || undefined,
        })),
        note: batchNote.trim() || undefined,
        customerName: !activeInvoice && customerName.trim() ? customerName.trim() : undefined,
        customerPhone: !activeInvoice && customerPhone.trim() ? customerPhone.trim() : undefined,
      });

      toast.success(
        `Đã gửi đợt #${res.data.batch.batchNumber} (${totalCount} món) xuống nhà bếp!`,
      );
      setCart({});
      setBatchNote('');
      setIsCartOpen(false);
      onOrderSubmitted(res.data.updatedInvoice, res.data.batch);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string | string[] } }; message?: string };
      const rawMsg = axiosErr?.response?.data?.message;
      const msg = Array.isArray(rawMsg)
        ? rawMsg.join(', ')
        : rawMsg || axiosErr?.message || 'Không thể gửi đơn gọi món. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {isMaintenance && (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 font-medium">
          Bàn này đang bảo trì nên tạm thời không thể nhận đơn gọi món.
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm món ăn, đồ uống..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-primary shadow-xs"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategoryId('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategoryId === 'ALL'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:border-primary/40'
              }`}
            >
              Tất cả ({menu.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategoryId === cat.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:border-primary/40'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Menu Grid */}
      {filteredMenu.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 space-y-2">
          <UtensilsCrossed className="w-10 h-10 text-gray-400 mx-auto" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Không tìm thấy món ăn phù hợp
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredMenu.map((item) => {
            const qty = cart[item.id]?.quantity || 0;
            const priceNum = Number(item.price);
            const originalNum = item.originalPrice ? Number(item.originalPrice) : null;
            const hasDiscount = originalNum !== null && originalNum > priceNum;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex gap-3 ${
                  qty > 0
                    ? 'border-primary/60 ring-1 ring-primary/20 shadow-sm'
                    : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 shrink-0 relative">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <UtensilsCrossed size={24} />
                    </div>
                  )}
                  {item.isFeatured && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold inline-flex items-center gap-0.5 shadow-xs">
                      <Sparkles size={10} />
                      Hot
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1.5">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                        {item.name}
                      </h3>
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                        {item.description}
                      </p>
                    )}
                    {item.preparationTime && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                        <Clock size={11} />
                        ~{item.preparationTime} phút
                      </span>
                    )}
                  </div>

                  <div className="flex items-end justify-between gap-2 mt-2">
                    <div>
                      <div className="text-sm font-extrabold text-primary">
                        {formatPrice(priceNum)}
                      </div>
                      {hasDiscount && originalNum !== null && (
                        <div className="text-[11px] text-gray-400 line-through">
                          {formatPrice(originalNum)}
                        </div>
                      )}
                    </div>

                    {qty === 0 ? (
                      <button
                        type="button"
                        disabled={isMaintenance || isPaymentLocked}
                        onClick={() => handleIncrease(item)}
                        className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 text-white text-xs font-bold inline-flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                      >
                        <Plus size={14} />
                        <span>Thêm</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 border border-gray-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => handleDecrease(item.id)}
                          aria-label={`Giảm số lượng ${item.name}`}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-white flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-600 cursor-pointer"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-5 text-center text-xs font-extrabold text-gray-900 dark:text-white">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleIncrease(item)}
                          aria-label={`Tăng số lượng ${item.name}`}
                          className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90 cursor-pointer"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Bottom Cart Bar */}
      {totalCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 relative">
                <ShoppingBag size={20} />
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
                  {totalCount}
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Tạm tính đợt gọi món
                </div>
                <div className="text-base font-extrabold text-gray-900 dark:text-white truncate">
                  {formatPrice(totalPrice)}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold inline-flex items-center gap-2 shadow-sm shrink-0 cursor-pointer transition-colors"
            >
              <Send size={15} />
              <span>Xem &amp; Gửi Bếp</span>
            </button>
          </div>
        </div>
      )}

      {/* Cart Review & Submit Modal */}
      <Modal
        isOpen={isCartOpen}
        onClose={() => !submitting && setIsCartOpen(false)}
        title={`Xác nhận gọi món — ${table.tableNumber}`}
        subtitle={`Tầng ${table.floor} • Món ăn sẽ được chuyển thẳng tới màn hình Bếp`}
        size="lg"
      >
        <div className="space-y-4">
          {!activeInvoice && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2.5">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                Bàn chưa có hóa đơn mở. Bạn có thể nhập tên để nhà hàng tiện phục vụ (không bắt buộc):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Tên khách hàng (VD: Anh Minh)"
                  className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-700 text-gray-900 dark:text-white outline-none focus:border-primary"
                />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Số điện thoại (tùy chọn)"
                  className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-700 text-gray-900 dark:text-white outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
            {cartItems.map(({ menuItem, quantity, note }) => (
              <div
                key={menuItem.id}
                className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {menuItem.name}
                    </h4>
                    <p className="text-xs text-primary font-semibold">
                      {formatPrice(Number(menuItem.price) * quantity)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 rounded-lg p-0.5 border border-gray-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => handleDecrease(menuItem.id)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-gray-900 dark:text-white">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleIncrease(menuItem)}
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-primary text-white hover:bg-primary/90 cursor-pointer"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(menuItem.id)}
                      aria-label={`Xóa ${menuItem.name}`}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <MessageSquare
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => handleItemNoteChange(menuItem.id, e.target.value)}
                    placeholder="Ghi chú riêng cho món này (VD: Không hành, ít đá)..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Ghi chú chung cho đợt gọi món (tùy chọn)
            </label>
            <input
              type="text"
              value={batchNote}
              onChange={(e) => setBatchNote(e.target.value)}
              placeholder="Ví dụ: Lên món khai vị trước, mang thêm chén..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white outline-none focus:border-primary"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 block">
                Tổng cộng ({totalCount} món)
              </span>
              <span className="text-lg font-extrabold text-primary">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setIsCartOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-semibold cursor-pointer"
              >
                Chọn thêm
              </button>
              <button
                type="button"
                disabled={submitting || cartItems.length === 0}
                onClick={handleSubmitOrder}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                <span>{submitting ? 'Đang gửi...' : 'Gửi Xuống Bếp'}</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default DineInMenuTab;
