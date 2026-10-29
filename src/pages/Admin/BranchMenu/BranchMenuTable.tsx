import React from 'react';
import { IBranchMenuItem } from '../../../types/admin/branch-menu.type';
import {
  CheckCircle2,
  AlertTriangle,
  Edit3,
  CheckSquare,
  Square,
  Star,
} from 'lucide-react';

interface BranchMenuTableProps {
  items: IBranchMenuItem[];
  loading: boolean;
  selectedItemIds: string[];
  isBulkUpdating: boolean;
  onToggleSelectAll: () => void;
  onToggleSelectItem: (menuItemId: string) => void;
  onBulkSetAvailability: (isAvailable: boolean) => void;
  onClearSelection: () => void;
  onToggleAvailability: (item: IBranchMenuItem) => void;
  onToggleStatus: (item: IBranchMenuItem) => void;
  onEditPrice: (item: IBranchMenuItem) => void;
  formatVND: (price: number | string | undefined | null) => string;
}

export const BranchMenuTable: React.FC<BranchMenuTableProps> = ({
  items,
  loading,
  selectedItemIds,
  isBulkUpdating,
  onToggleSelectAll,
  onToggleSelectItem,
  onBulkSetAvailability,
  onClearSelection,
  onToggleAvailability,
  onToggleStatus,
  onEditPrice,
  formatVND,
}) => {
  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        <p className="text-sm text-gray-500 mt-2">Đang tải thực đơn chi nhánh...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedItemIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm">
          <span className="font-semibold text-primary">
            Đã chọn {selectedItemIds.length} món ăn
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onBulkSetAvailability(true)}
              disabled={isBulkUpdating}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>Đánh dấu Còn hàng</span>
            </button>
            <button
              onClick={() => onBulkSetAvailability(false)}
              disabled={isBulkUpdating}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <AlertTriangle size={14} />
              <span>Đánh dấu Tạm hết</span>
            </button>
            <button
              onClick={onClearSelection}
              className="px-2.5 py-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto border border-gray-100 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
              <th className="p-3 w-10 text-center">
                <button
                  onClick={onToggleSelectAll}
                  className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
                  title="Chọn tất cả trên trang này"
                >
                  {selectedItemIds.length === items.length && items.length > 0 ? (
                    <CheckSquare size={16} className="text-primary" />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
              </th>
              <th className="p-3 font-semibold">Món ăn</th>
              <th className="p-3 font-semibold text-center whitespace-nowrap">Danh mục</th>
              <th className="p-3 font-semibold text-right whitespace-nowrap">Giá bán tại cơ sở</th>
              <th className="p-3 font-semibold text-center whitespace-nowrap">Tình trạng hôm nay</th>
              <th className="p-3 font-semibold text-center whitespace-nowrap">Phục vụ cơ sở</th>
              <th className="p-3 font-semibold text-center whitespace-nowrap">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  Không tìm thấy món ăn nào phù hợp với bộ lọc
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isSelected = selectedItemIds.includes(item.menuItemId);
                const defaultPrice = item.menuItem?.price ? Number(item.menuItem.price) : 0;
                const hasPriceOverride =
                  item.priceOverride !== null && item.priceOverride !== undefined;
                const currentPrice = hasPriceOverride
                  ? Number(item.priceOverride)
                  : defaultPrice;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onToggleSelectItem(item.menuItemId)}
                        className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-primary" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {item.menuItem?.imageUrl ? (
                          <img
                            src={item.menuItem.imageUrl}
                            alt={item.menuItem.name}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs shrink-0 font-medium">
                            No img
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                            {item.menuItem?.name}
                            {item.menuItem?.isFeatured && (
                              <span className="inline-flex items-center gap-0.5 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                                <Star size={12} className="fill-amber-500 text-amber-500" />
                                Nổi bật
                              </span>
                            )}
                          </div>
                          {item.menuItem?.description && (
                            <p className="text-xs text-gray-500 truncate max-w-xs">
                              {item.menuItem.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
                        {item.menuItem?.category?.name || 'Chưa phân loại'}
                      </span>
                    </td>

                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="font-bold text-gray-900">
                        {formatVND(currentPrice)}
                      </div>
                      {hasPriceOverride ? (
                        <div className="text-[11px] text-gray-400 line-through">
                          Gốc: {formatVND(defaultPrice)}
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400">Giá niêm yết</span>
                      )}
                    </td>

                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onToggleAvailability(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          item.isAvailable
                            ? 'text-emerald-800 bg-emerald-100 border border-emerald-200 hover:bg-emerald-200'
                            : 'text-amber-800 bg-amber-100 border border-amber-200 hover:bg-amber-200'
                        }`}
                        title="Bấm để chuyển nhanh giữa Còn hàng và Tạm hết"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <span>{item.isAvailable ? 'Còn hàng' : 'Tạm hết'}</span>
                      </button>
                    </td>

                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(item)}
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded cursor-pointer transition-colors ${
                          item.isActive
                            ? 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                            : 'text-gray-500 bg-gray-100 hover:bg-gray-200 border border-gray-200'
                        }`}
                        title="Bấm để bật/tắt phục vụ món này tại chi nhánh"
                      >
                        {item.isActive ? 'Đang phục vụ' : 'Ngừng bán'}
                      </button>
                    </td>

                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => onEditPrice(item)}
                        className="text-info hover:text-blue-700 font-medium text-xs px-2.5 py-1 bg-blue-50 rounded hover:bg-blue-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Điều chỉnh giá riêng cho chi nhánh này"
                      >
                        <Edit3 size={13} />
                        <span>Chỉnh giá</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BranchMenuTable;
