import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronRight, UtensilsCrossed, Clock } from 'lucide-react';
import { MenuItem } from '../../../types/menuItem.type';
import { formatPrice } from '../../../utils/helpers';

interface FeaturedItemsListProps {
  loading: boolean;
  featuredMenuItems: MenuItem[];
}

export const FeaturedItemsList: React.FC<FeaturedItemsListProps> = ({
  loading,
  featuredMenuItems,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Món Nổi Bật Chuỗi</h2>
            <p className="text-xs text-gray-500">Món ăn bán chạy & được gắn cờ Best-seller</p>
          </div>
        </div>
        <Link
          to="/admin/menu-items"
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
        >
          Xem tất cả <ChevronRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-400 text-sm">Đang tải món ăn...</div>
      ) : featuredMenuItems.length === 0 ? (
        <div className="py-6 text-center text-gray-400 text-xs">Chưa có món nào được đánh dấu nổi bật.</div>
      ) : (
        <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-0.5">
          {featuredMenuItems.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white transition-all gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                    <UtensilsCrossed size={16} />
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock size={11} /> {item.preparationTime ? item.preparationTime : 15}p nấu
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-orange-600 font-mono">
                  {formatPrice(typeof item.price === 'string' ? parseFloat(item.price) : item.price)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
