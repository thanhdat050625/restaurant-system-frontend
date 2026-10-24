import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, UtensilsCrossed, Calendar } from 'lucide-react';
import { IBranch } from '../../types/admin/branch.type';

interface BranchCardProps {
  branch: IBranch;
  onSelectDetail: (branch: IBranch) => void;
}

const DEFAULT_BRANCH_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';

export const BranchCard: React.FC<BranchCardProps> = ({ branch, onSelectDetail }) => {
  const fullAddress = [
    branch.streetAddress,
    branch.ward?.fullName || branch.ward?.name,
    branch.province?.name,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      {/* Cover Image & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
        <img
          src={branch.imageUrl || DEFAULT_BRANCH_IMAGE}
          alt={branch.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {branch.isOpenNow ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-md flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Đang mở cửa
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/90 text-white backdrop-blur-md flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white/70" />
              Đóng cửa
            </span>
          )}

          {typeof branch.distanceKm === 'number' && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/90 text-white backdrop-blur-md flex items-center gap-1 shadow-sm">
              <MapPin size={12} />
              {branch.distanceKm} km
            </span>
          )}
        </div>

        {/* Branch Name overlay at bottom of image */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-white drop-shadow-md line-clamp-1">
            {branch.name}
          </h3>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
            <span className="line-clamp-2">{fullAddress || 'Đang cập nhật địa chỉ'}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={16} className="text-primary shrink-0" />
            <span>Hôm nay: <strong className="text-slate-800 dark:text-slate-100">{branch.todayHours || 'Chưa thiết lập'}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Phone size={16} className="text-primary shrink-0" />
            <a
              href={`tel:${branch.phone}`}
              className="hover:text-primary transition-colors font-medium text-slate-800 dark:text-slate-100"
            >
              {branch.phone}
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onSelectDetail(branch)}
            className="px-2 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors text-center"
          >
            Chi tiết
          </button>

          <Link
            to={`/menu?branchId=${branch.id}`}
            className="px-2 py-2 text-xs font-medium text-primary hover:text-white bg-primary/10 hover:bg-primary rounded-xl transition-all flex items-center justify-center gap-1 text-center"
          >
            <UtensilsCrossed size={13} />
            <span>Thực đơn</span>
          </Link>

          <Link
            to={`/reservation?branchId=${branch.id}`}
            className="px-2 py-2 text-xs font-semibold text-white bg-gradient-to-r from-primary to-accent hover:opacity-95 rounded-xl transition-opacity flex items-center justify-center gap-1 text-center shadow-sm"
          >
            <Calendar size={13} />
            <span>Đặt bàn</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
