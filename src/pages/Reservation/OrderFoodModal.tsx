import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Plus, Minus, Search, RefreshCw, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import { IReservation, IPreOrderItem } from '../../types/reservation.type';
import { IBranchMenuItem } from '../../types/admin/branch-menu.type';
import { branchMenuService } from '../../services/admin/branchMenuService';
import { reservationService } from '../../services/reservationService';
import { formatPrice } from '../../utils/helpers';

interface OrderFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: IReservation | null;
  onSuccess?: () => void;
}

export const OrderFoodModal: React.FC<OrderFoodModalProps> = ({
  isOpen,
  onClose,
  reservation,
  onSuccess,
}) => {
  const [menuItems, setMenuItems] = useState<IBranchMenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<IPreOrderItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isOpen || !reservation) return;

    // Khởi tạo danh sách món đã có của đơn đặt bàn
    const currentOrders: IPreOrderItem[] = (reservation.orders || []).map((o) => ({
      menuItemId: o.menuItemId,
      quantity: o.quantity,
      note: o.note || undefined,
      menuItem: {
        id: o.menuItemId,
        name: o.menuItem?.name || 'Món ăn',
        price: Number(o.unitPrice || 0),
        imageUrl: o.menuItem?.imageUrl,
      },
    }));
    setSelectedItems(currentOrders);
    setSearch('');

    const fetchMenu = async () => {
      setIsLoadingMenu(true);
      try {
        const res = await branchMenuService.getPublicBranchMenu(reservation.branchId, { limit: 100 });
        const data = (res as any)?.data?.data || (res as any)?.data;
        const items = data?.items || [];
        setMenuItems(items.filter((i: IBranchMenuItem) => i.isActive && i.isAvailable));
      } catch {
        toast.error('Không thể tải thực đơn chi nhánh.');
        setMenuItems([]);
      } finally {
        setIsLoadingMenu(false);
      }
    };

    fetchMenu();
  }, [isOpen, reservation]);

  if (!reservation) return null;

  const handleAddOrIncrement = (item: IBranchMenuItem) => {
    const existing = selectedItems.find((p) => p.menuItemId === item.menuItemId);
    const finalPrice = item.priceOverride !== null ? Number(item.priceOverride) : Number(item.menuItem?.price || 0);

    if (existing) {
      setSelectedItems(
        selectedItems.map((p) =>
          p.menuItemId === item.menuItemId ? { ...p, quantity: p.quantity + 1 } : p,
        ),
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          menuItemId: item.menuItemId,
          quantity: 1,
          menuItem: {
            id: item.menuItemId,
            name: item.menuItem?.name || 'Món ăn',
            price: finalPrice,
            imageUrl: item.menuItem?.imageUrl ?? undefined,
          },
        },
      ]);
    }
  };

  const handleDecrement = (menuItemId: string) => {
    const existing = selectedItems.find((p) => p.menuItemId === menuItemId);
    if (!existing) return;
    if (existing.quantity <= 1) {
      setSelectedItems(selectedItems.filter((p) => p.menuItemId !== menuItemId));
    } else {
      setSelectedItems(
        selectedItems.map((p) =>
          p.menuItemId === menuItemId ? { ...p, quantity: p.quantity - 1 } : p,
        ),
      );
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await reservationService.updatePreOrders(
        reservation.id,
        selectedItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          note: item.note,
        })),
      );
      toast.success('Cập nhật món ăn cho đơn đặt bàn thành công!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật món ăn.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = menuItems.filter((i) =>
    (i.menuItem?.name || '').toLowerCase().includes(search.toLowerCase()),
  );

  const totalCount = selectedItems.reduce((sum, p) => sum + p.quantity, 0);
  const totalAmount = selectedItems.reduce((sum, p) => {
    const price = Number(p.menuItem?.price || 0);
    return sum + price * p.quantity;
  }, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Gọi thêm món • Bàn #${reservation.reservationCode}`}>
      <div className="space-y-4 text-xs">
        {/* Banner tóm tắt */}
        <div className="p-3 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-bold text-gray-800 dark:text-gray-100">
              Khách: {reservation.customerName} ({reservation.guestCount} người)
            </p>
            <p className="text-[11px] text-gray-500">
              {reservation.table ? `Bàn ${reservation.table.tableNumber} (Tầng ${reservation.table.floor})` : 'Chưa xếp bàn'}{' '}
              • Giờ hẹn: {reservation.reservationTime}
            </p>
          </div>
          <span className="text-xs font-bold text-primary font-mono bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-primary/20">
            Tạm tính: {formatPrice(totalAmount)}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm món ăn trong thực đơn..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary"
          />
        </div>

        {/* Menu Items List */}
        {isLoadingMenu ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
            <RefreshCw size={24} className="animate-spin text-primary" />
            <p>Đang tải thực đơn chi nhánh...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            <UtensilsCrossed size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            {search ? 'Không tìm thấy món ăn phù hợp.' : 'Chi nhánh chưa có món ăn nào.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto custom-scrollbar p-1">
            {filteredItems.map((item) => {
              const finalPrice =
                item.priceOverride !== null ? Number(item.priceOverride) : Number(item.menuItem?.price || 0);
              const selected = selectedItems.find((p) => p.menuItemId === item.menuItemId);

              return (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
                    selected
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/30'
                      : 'border-gray-200 dark:border-slate-700 hover:border-primary/40 bg-white dark:bg-slate-800'
                  }`}
                >
                  <img
                    src={item.menuItem?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150'}
                    alt={item.menuItem?.name}
                    className="w-14 h-14 rounded-lg object-cover shrink-0 border border-gray-100 dark:border-slate-700"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs text-gray-800 dark:text-gray-100 truncate">
                      {item.menuItem?.name}
                    </h4>
                    <p className="text-xs font-bold text-primary mt-0.5 font-mono">{formatPrice(finalPrice)}</p>
                  </div>

                  {selected ? (
                    <div className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDecrement(item.menuItemId)}
                        className="w-6 h-6 rounded flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-xs font-bold font-mono">{selected.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleAddOrIncrement(item)}
                        className="w-6 h-6 rounded flex items-center justify-center text-primary hover:bg-primary/10 cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddOrIncrement(item)}
                      className="w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Summary bar */}
        {selectedItems.length > 0 && (
          <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Đã chọn: <strong className="text-gray-800 dark:text-gray-100">{totalCount} phần</strong> ({selectedItems.length} món)
            </span>
            <span className="font-bold text-sm text-primary font-mono">{formatPrice(totalAmount)}</span>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t border-gray-200 dark:border-slate-700 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary hover:bg-primary-hover active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
            <span>Lưu món ({totalCount})</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
