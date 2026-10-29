import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Plus, Minus, Search } from 'lucide-react';
import { ui, SectionTitle, StepActions } from './reservationUi';
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
        const res = await branchMenuService.getPublicBranchMenu(branchId, { limit: 100 });
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
            imageUrl: item.menuItem?.imageUrl ?? undefined,
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
      <div className={`${ui.card} p-5 sm:p-6`}>
        <SectionTitle
          icon={UtensilsCrossed}
          title="Gọi món trước"
          description="Món sẽ được chuẩn bị sẵn khi bạn đến nhà hàng"
          aside={
            <span className="px-2.5 py-1 rounded-full bg-light-card dark:bg-dark-card text-[11px] font-medium text-text-light whitespace-nowrap">
              Không bắt buộc
            </span>
          }
        />
        <div className="relative mb-4">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm món ăn yêu thích..."
            className={`${ui.input} pl-10`}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-light-card dark:bg-dark-card animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className={`py-10 text-center text-sm ${ui.muted}`}>
            <UtensilsCrossed size={32} className="mx-auto mb-2 text-text-light" />
            {search ? 'Không tìm thấy món phù hợp.' : 'Chi nhánh chưa có món nào phục vụ.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[28rem] overflow-y-auto pr-1 -mr-1">
            {filteredItems.map((item) => {
              const finalPrice =
                item.priceOverride !== null ? Number(item.priceOverride) : Number(item.menuItem?.price || 0);
              const selected = preOrders.find((p) => p.menuItemId === item.menuItemId);

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                    selected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                      : 'border-light-border dark:border-dark-border hover:border-primary/40'
                  }`}
                >
                  <img
                    src={item.menuItem?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                    alt={item.menuItem?.name}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-sm line-clamp-1 ${ui.heading}`}>{item.menuItem?.name}</h4>
                    <p className="text-sm font-bold text-primary mt-0.5">{formatPrice(finalPrice)}</p>
                  </div>
                  {selected ? (
                    <div className="flex items-center gap-1 rounded-lg bg-white dark:bg-dark border border-light-border dark:border-dark-border p-1 shrink-0">
                      <button
                        type="button"
                        aria-label="Bớt một phần"
                        onClick={() => handleDecrement(item.menuItemId)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-text-secondary hover:bg-light-card dark:hover:bg-dark-card"
                      >
                        <Minus size={14} />
                      </button>
                      <span className={`w-6 text-center text-sm font-bold ${ui.heading}`}>{selected.quantity}</span>
                      <button
                        type="button"
                        aria-label="Thêm một phần"
                        onClick={() => handleAddOrIncrement(item)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-primary hover:bg-primary/10"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Thêm ${item.menuItem?.name}`}
                      onClick={() => handleAddOrIncrement(item)}
                      className="w-9 h-9 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-colors shrink-0"
                    >
                      <Plus size={17} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {preOrders.length > 0 && (
          <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border flex items-center justify-between text-sm">
            <span className={ui.muted}>
              Đã chọn <strong className={ui.heading}>{totalCount} món</strong>
            </span>
            <span className={ui.muted}>
              Tạm tính <strong className="text-primary text-base">{formatPrice(totalAmount)}</strong>
            </span>
          </div>
        )}
      </div>

      <StepActions
        onBack={onBack}
        onNext={onNext}
        nextLabel={preOrders.length > 0 ? `Tiếp tục (${totalCount} món)` : 'Bỏ qua bước này'}
      />
    </div>
  );
};
