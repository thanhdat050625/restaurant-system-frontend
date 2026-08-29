import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PaginationMeta } from '../../types/api-response.type';

interface PaginationProps {
  meta?: PaginationMeta | null;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  pageSizeOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  meta,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [5, 10, 20, 50],
}) => {
  if (!meta || meta.totalItems === 0) return null;

  const { page, limit, totalItems, totalPages, hasNextPage, hasPrevPage } = meta;

  const startItem = Math.min((page - 1) * limit + 1, totalItems);
  const endItem = Math.min(page * limit, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // Number of pages around current page

    const left = page - delta;
    const right = page + delta;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 border-t border-gray-100 mt-4 text-sm text-gray-600">
      {/* Items count info */}
      <div className="flex items-center gap-3">
        <span>
          Hiển thị <span className="font-semibold text-gray-900">{startItem}</span> -{' '}
          <span className="font-semibold text-gray-900">{endItem}</span> trên tổng số{' '}
          <span className="font-semibold text-gray-900">{totalItems}</span> mục
        </span>

        {onLimitChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-xs text-gray-500">Mỗi trang:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-medium focus:ring-primary focus:border-primary outline-none"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination buttons */}
      <div className="flex items-center gap-1">
        {/* Nút về trang đầu tiên */}
        <button
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage}
          className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors text-gray-700"
          title="Trang đầu tiên"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Nút về trang trước */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors text-gray-700"
          title="Trang trước"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Danh sách số trang */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 py-1 text-gray-400 text-xs select-none">
                  ...
                </span>
              );
            }

            const pageNum = p as number;
            const isActive = pageNum === page;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[32px] h-8 px-2.5 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white font-semibold shadow-sm'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Nút sang trang sau */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors text-gray-700"
          title="Trang sau"
        >
          <ChevronRight size={16} />
        </button>

        {/* Nút tới trang cuối cùng */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage}
          className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors text-gray-700"
          title="Trang cuối cùng"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
