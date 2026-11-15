import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Plus,
  Minus,
  Search,
  RefreshCw,
  Check,
  Send,
  ExternalLink,
  Receipt,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import { IReservation, IPreOrderItem } from '../../types/reservation.type';
import { IBranchMenuItem } from '../../types/admin/branch-menu.type';
import { IInvoice } from '../../types/dine-in.type';
import { branchMenuService } from '../../services/admin/branchMenuService';
import { reservationService } from '../../services/reservationService';
import { dineInService } from '../../services/dineInService';
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
  const [activeInvoice, setActiveInvoice] = useState<IInvoice | null>(null);
  const [batchNote, setBatchNote] = useState('');
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const isSeatedDineIn = reservation?.status === 'SEATED';

  useEffect(() => {
    if (!isOpen || !reservation) return;

    setSearch('');
    setBatchNote('');
    setActiveInvoice(null);

    if (reservation.status === 'SEATED') {
      // Đang ngồi tại bàn: giỏ chỉ chứa các món GỌI THÊM cho đợt gửi bếp mới (tránh gửi trùng món đặt trước)
      setSelectedItems([]);
    } else {
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
    }

    const fetchMenuAndSession = async () => {
      setIsLoadingMenu(true);
      try {
        const menuPromise = branchMenuService.getPublicBranchMenu(reservation.branchId, { limit: 100 });
        const sessionPromise =
          reservation.status === 'SEATED' && reservation.tableId
            ? dineInService.getTableSession(reservation.tableId).catch(() => null)
            : Promise.resolve(null);

        const [menuRes, sessionRes] = await Promise.all([menuPromise, sessionPromise]);
        const data = (menuRes as any)?.data?.data || (menuRes as any)?.data;
        const items = data?.items || [];
        setMenuItems(items.filter((i: IBranchMenuItem) => i.isActive && i.isAvailable));

        const sessionData = (sessionRes as any)?.data || sessionRes;
        if (sessionData?.activeInvoice) {
          setActiveInvoice(sessionData.activeInvoice);
        }
      } catch {
        toast.error('Không thể tải thực đơn chi nhánh.');
        setMenuItems([]);
      } finally {
        setIsLoadingMenu(false);
      }
    };

    fetchMenuAndSession();
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
    if (isSeatedDineIn) {
      if (!reservation.tableId) {
        toast.error('Đơn đặt bàn chưa được gán số bàn cụ thể để gửi món xuống bếp.');
        return;
      }
      if (selectedItems.length === 0) {
        toast.error('Vui lòng chọn ít nhất 1 món cần gọi thêm.');
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await dineInService.createOrderBatch(reservation.tableId, {
          items: selectedItems.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            note: item.note,
          })),
          note: batchNote.trim() || undefined,
          customerName: reservation.customerName,
          customerPhone: reservation.customerPhone,
        });
        const batchNumber = (res as any)?.data?.batch?.batchNumber;
        toast.success(
          batchNumber
            ? `Đã gửi Đợt #${batchNumber} (${totalCount} món) xuống Bếp và cộng vào hóa đơn bàn!`
            : `Đã gửi ${totalCount} món gọi thêm xuống Bếp!`,
        );
        if (onSuccess) onSuccess();
        onClose();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Không thể gửi món xuống nhà bếp.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

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
      toast.success('Cập nhật món đặt trước cho đơn đặt bàn thành công!');
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

  const existingInvoiceItems = (activeInvoice?.batches || []).flatMap((b) =>
    (b.items || []).filter((it) => it.status !== 'CANCELLED'),
  );
  const existingItemsCount = existingInvoiceItems.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isSeatedDineIn
          ? `Gọi thêm món xuống Bếp • ${reservation.table?.tableNumber || `#${reservation.reservationCode}`}`
          : `Chọn món đặt trước • #${reservation.reservationCode}`
      }
    >
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
              {activeInvoice && (
                <span className="ml-1.5 font-mono text-primary font-semibold">
                  • HĐ: {activeInvoice.invoiceCode}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isSeatedDineIn && reservation.tableId && (
              <Link
                to={`/table-order/${reservation.tableId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-primary hover:bg-primary/10 font-bold inline-flex items-center gap-1 transition-colors"
              >
                <ExternalLink size={12} />
                <span>Mở Menu Bàn</span>
              </Link>
            )}
            <span className="text-xs font-bold text-primary font-mono bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-primary/20">
              {isSeatedDineIn ? 'Đợt mới: ' : 'Tạm tính: '}
              {formatPrice(totalAmount)}
            </span>
          </div>
        </div>

        {/* Cảnh báo nếu SEATED nhưng chưa có tableId */}
        {isSeatedDineIn && !reservation.tableId && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>Đơn này chưa được gán bàn cụ thể. Vui lòng xếp bàn trước khi gửi món xuống bếp.</span>
          </div>
        )}

        {/* Thông tin hóa đơn hiện có của bàn */}
        {isSeatedDineIn && activeInvoice && (
          <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 flex items-center justify-between gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
            <span className="flex items-center gap-1.5 font-semibold">
              <Receipt size={13} />
              Đã gửi Bếp {activeInvoice.batches?.length || 0} đợt ({existingItemsCount} phần)
            </span>
            <span className="font-mono font-bold">
              Tổng HĐ hiện tại: {formatPrice(Number(activeInvoice.finalAmount || 0))}
            </span>
          </div>
        )}

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

        {/* Ghi chú gửi bếp cho đợt gọi mới */}
        {isSeatedDineIn && selectedItems.length > 0 && (
          <input
            type="text"
            value={batchNote}
            onChange={(e) => setBatchNote(e.target.value)}
            placeholder="Ghi chú cho nhà bếp (VD: Ít cay, lên món trước...)"
            className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary"
          />
        )}

        {/* Selected Summary bar */}
        {selectedItems.length > 0 && (
          <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {isSeatedDineIn ? 'Đợt gọi mới: ' : 'Đã chọn: '}
              <strong className="text-gray-800 dark:text-gray-100">{totalCount} phần</strong> ({selectedItems.length} món)
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
            disabled={
              isSubmitting || (isSeatedDineIn && (!reservation.tableId || totalCount === 0))
            }
            className="px-4 py-2 bg-primary hover:bg-primary-hover active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : isSeatedDineIn ? (
              <Send size={14} />
            ) : (
              <Check size={14} />
            )}
            <span>
              {isSeatedDineIn
                ? `Gửi xuống bếp (${totalCount})`
                : `Lưu món (${totalCount})`}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
