import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Plus, Minus, Search, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { branchMenuService } from '../../services/admin/branchMenuService';
import { IBranchMenuItem } from '../../types/admin/branch-menu.type';
import { IPreOrderItem } from '../../types/reservation.type';
import { formatPrice } from '../../utils/helpers';

interface ReservationPreOrderStepProps {
  branchId: string;
  preOrders: IPreOrderItem[];
  onUpdatePreOrders: (items: IPreOrderItem[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export const ReservationPreOrderStep: React.FC<ReservationPreOrderStepProps> = ({
  branchId,
  preOrders,
  onUpdatePreOrders,
  onBack,
  onNext,
}) => {
  const [menuItems, setMenuItems] = useState<IBranchMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!branchId) return;
    const fetchMenu = async () => {
      setIsLoading(true);
      try {
        const res = await branchMenuService.getBranchMenu(branchId);
        const data = res?.data?.data || res?.data;
        const items = data?.items || [];
        setMenuItems(items.filter((i: IBranchMenuItem) => i.isActive && i.isAvailable));
      } catch {
        setMenuItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, [branchId]);

  const handleAddOrIncrement = (item: IBranchMenuItem) => {
    const existing = preOrders.find((p) => p.menuItemId === item.menuItemId);
    const finalPrice = item.priceOverride !== null ? Number(item.priceOverride) : Number(item.menuItem?.price || 0);

    if (existing) {
      onUpdatePreOrders(
        preOrders.map((p) =>
          p.menuItemId === item.menuItemId ? { ...p, quantity: p.quantity + 1 } : p,
        ),
      );
    } else {
      onUpdatePreOrders([
        ...preOrders,
        {
          menuItemId: item.menuItemId,
          quantity: 1,
          menuItem: {
            id: item.menuItemId,
            name: item.menuItem?.name || 'Món ăn',
            price: finalPrice,
            imageUrl: item.menuItem?.imageUrl,
          },
        },
      ]);
    }
  };

  const handleDecrement = (menuItemId: string) => {
    const existing = preOrders.find((p) => p.menuItemId === menuItemId);
    if (!existing) return;
    if (existing.quantity <= 1) {
      onUpdatePreOrders(preOrders.filter((p) => p.menuItemId !== menuItemId));
    } else {
      onUpdatePreOrders(
        preOrders.map((p) =>
          p.menuItemId === menuItemId ? { ...p, quantity: p.quantity - 1 } : p,
        ),
      );
    }
  };

  const filteredItems = menuItems.filter((i) =>
    (i.menuItem?.name || '').toLowerCase().includes(search.toLowerCase()),
  );

  const totalAmount = preOrders.reduce((sum, p) => {
    const price = p.menuItem?.price || 0;
    return sum + price * p.quantity;
  }, 0);

  const totalCount = preOrders.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="space-y-5">
      {/* Search and Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <UtensilsCrossed size={18} className="text-primary" /> Chọn món ăn đặt trước (Tùy chọn)
          </h3>
          <span className="text-xs text-slate-400">Không bắt buộc</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Món ăn sẽ được nhà hàng chuẩn bị sẵn sàng khi bạn và gia đình đến chi nhánh.
        </p>
        <div className="relative pt-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm món ăn yêu thích..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Food items list */}
      {isLoading ? (
        <div className="text-center py-10 text-xs text-slate-400">Đang tải thực đơn chi nhánh...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
          Không tìm thấy món ăn nào tại chi nhánh này.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {filteredItems.map((item) => {
            const finalPrice =
              item.priceOverride !== null
                ? Number(item.priceOverride)
                : Number(item.menuItem?.price || 0);
            const selected = preOrders.find((p) => p.menuItemId === item.menuItemId);

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-3 bg-white dark:bg-slate-800 ${
                  selected
                    ? 'border-primary/80 ring-1 ring-primary/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <img
                  src={
                    item.menuItem?.imageUrl ||
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'
                  }
                  alt={item.menuItem?.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                  loading="lazy"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 line-clamp-1">
                    {item.menuItem?.name}
                  </h4>
                  <p className="text-xs font-semibold text-primary mt-0.5">
                    {formatPrice(finalPrice)}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    {selected ? (
                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg">
                        <button
                          type="button"
                          onClick={() => handleDecrement(item.menuItemId)}
                          className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-bold"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold min-w-4 text-center">
                          {selected.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddOrIncrement(item)}
                          className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-bold text-primary"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddOrIncrement(item)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        + Thêm món
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Total Cart Summary Bar */}
      {preOrders.length > 0 && (
        <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
          <div>
            <span className="text-slate-600 dark:text-slate-300">Đã chọn: </span>
            <strong className="text-primary font-bold">{totalCount} món</strong>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-300">Tạm tính: </span>
            <strong className="text-primary font-bold text-sm">{formatPrice(totalAmount)}</strong>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 py-3 border border-slate-300 dark:border-slate-600 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
        >
          <ChevronLeft size={16} /> Quay lại
        </button>

        <button
          type="button"
          onClick={onNext}
          className="w-2/3 py-3 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs sm:text-sm font-semibold rounded-xl transition-opacity flex items-center justify-center gap-1 shadow-sm"
        >
          <span>{preOrders.length > 0 ? `Tiếp tục (${totalCount} món)` : 'Bỏ qua bước này'}</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
