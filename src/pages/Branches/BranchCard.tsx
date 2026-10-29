import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, UtensilsCrossed, CalendarCheck, Navigation, ChevronRight } from 'lucide-react';
import { IBranch } from '../../types/admin/branch.type';

interface BranchCardProps {
  branch: IBranch;
  onSelectDetail: (branch: IBranch) => void;
}

const DEFAULT_BRANCH_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';

export const BranchCard: React.FC<BranchCardProps> = ({ branch, onSelectDetail }) => {
  const fullAddress = [branch.streetAddress, branch.ward?.fullName || branch.ward?.name, branch.province?.name]
    .filter(Boolean)
    .join(', ');

  return (
    <article className="group bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-light-border dark:border-dark-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Ảnh bìa */}
      <button
        type="button"
        onClick={() => onSelectDetail(branch)}
        className="relative h-52 w-full overflow-hidden bg-light-card dark:bg-dark-card text-left"
        aria-label={`Xem chi tiết ${branch.name}`}
      >
        <img
          src={branch.imageUrl || DEFAULT_BRANCH_IMAGE}
          alt={branch.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 ${
              branch.isOpenNow ? 'bg-success/90 text-white' : 'bg-black/55 text-white/90'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${branch.isOpenNow ? 'bg-white animate-pulse' : 'bg-white/60'}`} />
            {branch.isOpenNow ? 'Đang mở cửa' : 'Đã đóng cửa'}
          </span>

          {typeof branch.distanceKm === 'number' && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-text-primary backdrop-blur-md flex items-center gap-1">
              <Navigation size={12} className="text-primary" />
              {branch.distanceKm} km
            </span>
          )}
        </div>
      </button>

      {/* Nội dung */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] line-clamp-1 group-hover:text-primary transition-colors">
            {branch.name}
          </h3>
          <p className="mt-1.5 text-sm text-text-secondary dark:text-text-light flex items-start gap-1.5">
            <MapPin size={15} className="text-primary shrink-0 mt-0.5" />
            <span className="line-clamp-2">{fullAddress || 'Đang cập nhật địa chỉ'}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="px-3 py-2.5 rounded-xl bg-light-card dark:bg-dark-card">
            <p className="text-text-light flex items-center gap-1">
              <Clock size={12} /> Hôm nay
            </p>
            <p className="mt-0.5 font-semibold text-text-primary dark:text-white truncate">
              {branch.todayHours || 'Chưa thiết lập'}
            </p>
          </div>
          <a
            href={`tel:${branch.phone}`}
            className="px-3 py-2.5 rounded-xl bg-light-card dark:bg-dark-card hover:bg-primary/10 transition-colors"
          >
            <p className="text-text-light flex items-center gap-1">
              <Phone size={12} /> Hotline
            </p>
            <p className="mt-0.5 font-semibold text-text-primary dark:text-white truncate">{branch.phone}</p>
          </a>
        </div>

        {/* Hành động */}
        <div className="mt-auto space-y-2">
          <Link
            to={`/reservation?branchId=${branch.id}`}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow-glow transition-colors flex items-center justify-center gap-2"
          >
            <CalendarCheck size={16} />
            Đặt bàn tại đây
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/menu?branchId=${branch.id}`}
              className="py-2.5 rounded-xl border border-light-border dark:border-dark-border text-xs font-semibold text-text-secondary dark:text-gray-200 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1.5"
            >
              <UtensilsCrossed size={14} />
              Thực đơn
            </Link>
            <button
              type="button"
              onClick={() => onSelectDetail(branch)}
              className="py-2.5 rounded-xl border border-light-border dark:border-dark-border text-xs font-semibold text-text-secondary dark:text-gray-200 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1"
            >
              Chi tiết
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
