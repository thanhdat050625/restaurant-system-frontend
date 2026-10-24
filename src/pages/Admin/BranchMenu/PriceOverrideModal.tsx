import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import { IBranchMenuItem } from '../../../types/admin/branch-menu.type';
import {
  Sparkles,
  Check,
  Building2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PriceOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: IBranchMenuItem | null;
  branchName: string;
  onSave: (menuItemId: string, priceOverride: number | null) => Promise<void>;
}

const PriceOverrideModal: React.FC<PriceOverrideModalProps> = ({
  isOpen,
  onClose,
  item,
  branchName,
  onSave,
}) => {
  const [isCustomPrice, setIsCustomPrice] = useState<boolean>(false);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const chainPrice = item?.menuItem?.price ? Number(item.menuItem.price) : 0;

  useEffect(() => {
    if (item) {
      if (item.priceOverride !== null && item.priceOverride !== undefined) {
        setIsCustomPrice(true);
        setCustomPrice(String(Number(item.priceOverride)));
      } else {
        setIsCustomPrice(false);
        setCustomPrice(String(chainPrice));
      }
    }
  }, [item, chainPrice]);

  if (!item) return null;

  const currentEnteredPrice = customPrice ? Number(customPrice) : 0;
  const priceDiff = currentEnteredPrice - chainPrice;
  const percentDiff = chainPrice > 0 ? ((priceDiff / chainPrice) * 100).toFixed(1) : '0';

  const applyPercentage = (pct: number) => {
    const calculated = Math.round((chainPrice * (1 + pct / 100)) / 1000) * 1000;
    setCustomPrice(String(calculated));
    setIsCustomPrice(true);
  };

  const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setCustomPrice(rawVal);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalPrice: number | null = null;
    if (isCustomPrice) {
      const num = Number(customPrice);
      if (isNaN(num) || num < 0) {
        toast.error('Vui lòng nhập giá bán riêng hợp lệ (>= 0 đ)');
        return;
      }
      finalPrice = num;
    }

    try {
      setLoading(true);
      await onSave(item.menuItemId, finalPrice);
      toast.success(
        finalPrice !== null
          ? `Đã áp dụng giá ${finalPrice.toLocaleString('vi-VN')} đ cho ${item.menuItem?.name}`
          : `Đã khôi phục giá niêm yết chuỗi cho ${item.menuItem?.name}`,
      );
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật giá món');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thiết Lập Giá Riêng Chi Nhánh"
      subtitle="Tùy chỉnh giá bán áp dụng riêng theo cơ sở phục vụ"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-3.5 p-3.5 bg-gray-50/80 rounded-xl border border-gray-200/80">
          <img
            src={item.menuItem?.imageUrl || 'https://placehold.co/100x100?text=Food'}
            alt={item.menuItem?.name}
            className="w-16 h-16 rounded-xl object-cover ring-2 ring-white shadow-xs shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-orange-600 border border-orange-200/60 uppercase tracking-wide">
                {item.menuItem?.category?.name || 'Món Ăn'}
              </span>
              <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1">
                <Building2 size={13} className="text-gray-400" />
                <strong className="text-gray-800">{branchName}</strong>
              </span>
            </div>
            <h4 className="font-bold text-gray-900 text-base mt-1 truncate">
              {item.menuItem?.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
              <span>Giá niêm yết toàn chuỗi:</span>
              <span className="font-bold text-gray-900">
                {chainPrice.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Chọn Chính Sách Giá
          </label>

          <div
            onClick={() => setIsCustomPrice(false)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
              !isCustomPrice
                ? 'border-primary bg-primary/[0.03] shadow-xs'
                : 'border-gray-200/80 hover:border-gray-300 hover:bg-gray-50/50'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                !isCustomPrice ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white'
              }`}
            >
              {!isCustomPrice && <Check size={12} strokeWidth={3} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-gray-900">
                  Áp dụng giá niêm yết chuỗi
                </span>
                <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                  {chainPrice.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Tự động đồng bộ theo toàn bộ hệ thống FoodHub khi có thay đổi giá chung.
              </p>
            </div>
          </div>

          <div
            onClick={() => setIsCustomPrice(true)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
              isCustomPrice
                ? 'border-primary bg-primary/[0.03] shadow-xs'
                : 'border-gray-200/80 hover:border-gray-300 hover:bg-gray-50/50'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                isCustomPrice ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white'
              }`}
            >
              {isCustomPrice && <Check size={12} strokeWidth={3} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  Thiết lập giá riêng cho cơ sở này
                  <Sparkles size={14} className="text-amber-500" />
                </span>
                {isCustomPrice && currentEnteredPrice > 0 && (
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {currentEnteredPrice.toLocaleString('vi-VN')} đ
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Áp dụng mức giá đặc thù cho cơ sở {branchName}.
              </p>
            </div>
          </div>
        </div>

        {isCustomPrice && (
          <div className="space-y-4 pt-1">
            <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Giá Bán Riêng Tại Chi Nhánh (VNĐ)
                </label>
                {currentEnteredPrice > 0 && priceDiff !== 0 && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      priceDiff > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {priceDiff > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {priceDiff > 0
                      ? `+${priceDiff.toLocaleString('vi-VN')} đ`
                      : `${priceDiff.toLocaleString('vi-VN')} đ`}{' '}
                    ({priceDiff > 0 ? `+${percentDiff}%` : `${percentDiff}%`})
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={currentEnteredPrice > 0 ? currentEnteredPrice.toLocaleString('vi-VN') : customPrice}
                  onChange={handlePriceInput}
                  placeholder="Nhập giá bán riêng..."
                  className="w-full pl-4 pr-14 py-2.5 bg-white border border-gray-300 rounded-xl text-base font-bold text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-400"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  VNĐ
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Điều Chỉnh Nhanh Theo % Giá Chuỗi:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: '+5%', val: 5 },
                    { label: '+10%', val: 10 },
                    { label: '+15%', val: 15 },
                    { label: '-5%', val: -5 },
                    { label: '-10%', val: -10 },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => applyPercentage(chip.val)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-primary/10 hover:text-primary hover:border-primary/40 border border-gray-200 text-gray-700 transition-all cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCustomPrice(String(chainPrice))}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 transition-colors cursor-pointer"
                  >
                    Bằng giá chuỗi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors disabled:opacity-70 flex items-center gap-2 cursor-pointer"
          >
            {loading && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>Lưu Cấu Hình Giá</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PriceOverrideModal;
