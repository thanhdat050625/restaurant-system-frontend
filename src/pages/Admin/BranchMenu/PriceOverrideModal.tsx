import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IBranchMenuItem } from '../../../types/admin/branch-menu.type';
import {
  X,
  Tag,
  Sparkles,
  Check,
  Building2,
  TrendingUp,
  TrendingDown,
  Store,
  Layers,
  Percent,
  Info,
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

  const chainPrice = Number(item?.menuItem?.price || 0);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, loading]);

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

  const currentEnteredPrice = Number(customPrice) || 0;
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
          : `Đã khôi phục giá niêm yết chuỗi cho ${item.menuItem?.name}`
      );
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật giá món');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!loading) onClose();
            }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.28 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 flex flex-col font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100/80 flex items-center justify-center text-primary shadow-xs">
                  <Tag size={19} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
                    Thiết Lập Giá Riêng Chi Nhánh
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Tùy chỉnh giá bán áp dụng riêng theo cơ sở phục vụ
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(85vh-130px)]">
              {/* Card thông tin món ăn */}
              <div className="flex items-center gap-3.5 p-3.5 bg-gradient-to-r from-orange-50/60 via-amber-50/40 to-transparent rounded-2xl border border-orange-100/80">
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
                      <strong className="text-gray-800 font-bold">{branchName}</strong>
                    </span>
                  </div>
                  <h4 className="font-extrabold text-gray-900 text-base mt-1 truncate">
                    {item.menuItem?.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
                    <span>Giá niêm yết toàn chuỗi:</span>
                    <span className="font-extrabold text-gray-900">
                      {chainPrice.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Tùy chọn chính sách giá */}
              <div className="space-y-3">
                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block">
                  Chọn Chính Sách Giá
                </label>

                {/* Option 1: Áp dụng giá chuỗi */}
                <div
                  onClick={() => setIsCustomPrice(false)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                    !isCustomPrice
                      ? 'border-primary bg-primary/[0.03] shadow-xs'
                      : 'border-gray-200/80 hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                      !isCustomPrice
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {!isCustomPrice && <Check size={12} strokeWidth={3} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-gray-900">
                        Áp dụng giá niêm yết chuỗi
                      </span>
                      <span className="text-xs font-black text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                        {chainPrice.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Giá tự động đồng bộ theo toàn bộ hệ thống FoodHub khi có khuyến mãi hoặc cập nhật menu chung.
                    </p>
                  </div>
                </div>

                {/* Option 2: Giá riêng chi nhánh */}
                <div
                  onClick={() => setIsCustomPrice(true)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                    isCustomPrice
                      ? 'border-primary bg-primary/[0.03] shadow-xs'
                      : 'border-gray-200/80 hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                      isCustomPrice
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 bg-white'
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
                        <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                          {currentEnteredPrice.toLocaleString('vi-VN')} đ
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Áp dụng mức giá đặc thù cho cơ sở {branchName} (ví dụ vị trí trung tâm, khu du lịch, v.v.).
                    </p>
                  </div>
                </div>
              </div>

              {/* Phần nhập giá riêng (mở rộng khi chọn option 2) */}
              {isCustomPrice && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 pt-1"
                >
                  <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-gray-800">
                        Giá Bán Riêng Tại Chi Nhánh (VNĐ)
                      </label>
                      {currentEnteredPrice > 0 && priceDiff !== 0 && (
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                            priceDiff > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {priceDiff > 0 ? (
                            <TrendingUp size={12} />
                          ) : (
                            <TrendingDown size={12} />
                          )}
                          {priceDiff > 0 ? `+${priceDiff.toLocaleString('vi-VN')} đ` : `${priceDiff.toLocaleString('vi-VN')} đ`} ({priceDiff > 0 ? `+${percentDiff}%` : `${percentDiff}%`})
                        </span>
                      )}
                    </div>

                    {/* Input số tiền */}
                    <div className="relative">
                      <input
                        type="text"
                        value={currentEnteredPrice > 0 ? currentEnteredPrice.toLocaleString('vi-VN') : customPrice}
                        onChange={handlePriceInput}
                        placeholder="Nhập giá bán riêng..."
                        className="w-full pl-4 pr-12 py-3 bg-white border-2 border-gray-200 rounded-xl text-lg font-black text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-300"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-gray-400">
                        VNĐ
                      </span>
                    </div>

                    {/* Quick percentage chips */}
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
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
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-primary/10 hover:text-primary hover:border-primary/40 border border-gray-200 text-gray-700 transition-all shadow-2xs cursor-pointer active:scale-95"
                          >
                            {chip.label}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setCustomPrice(String(chainPrice));
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-gray-100 border border-gray-200 text-gray-500 transition-colors shadow-2xs cursor-pointer"
                        >
                          Bằng giá chuỗi
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-extrabold text-xs rounded-xl shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {loading && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>Lưu Cấu Hình Giá</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PriceOverrideModal;
