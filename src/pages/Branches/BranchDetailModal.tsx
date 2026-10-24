import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, ExternalLink, UtensilsCrossed, Calendar } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { IBranch } from '../../types/admin/branch.type';

interface BranchDetailModalProps {
  branch: IBranch | null;
  isOpen: boolean;
  onClose: () => void;
}

const DAY_NAMES = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
];

const DEFAULT_BRANCH_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';

export const BranchDetailModal: React.FC<BranchDetailModalProps> = ({
  branch,
  isOpen,
  onClose,
}) => {
  if (!branch) return null;

  const currentDayOfWeek = new Date().getDay();
  const fullAddress = [
    branch.streetAddress,
    branch.ward?.fullName || branch.ward?.name,
    branch.province?.name,
  ]
    .filter(Boolean)
    .join(', ');

  const googleMapsUrl =
    typeof branch.latitude === 'number' && typeof branch.longitude === 'number'
      ? `https://www.google.com/maps/search/?api=1&query=${branch.latitude},${branch.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || branch.name)}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={branch.name}
      subtitle="Thông tin chi nhánh & thời gian phục vụ"
      size="lg"
    >
      <div className="space-y-5">
        {/* Branch Image */}
        <div className="relative h-44 sm:h-52 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={branch.imageUrl || DEFAULT_BRANCH_IMAGE}
            alt={branch.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            {branch.isOpenNow ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-md">
                Đang mở cửa
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500 text-white shadow-md">
                Đóng cửa
              </span>
            )}
          </div>
        </div>

        {/* Contact info list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Địa chỉ chi nhánh</span>
            <div className="flex items-start gap-2 text-slate-800 dark:text-slate-100">
              <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
              <span className="text-xs leading-relaxed">{fullAddress || 'Chưa cập nhật'}</span>
            </div>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium pt-1"
            >
              <span>Xem trên Google Maps</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 space-y-2">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Hotline liên hệ</span>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 pt-0.5">
                <Phone size={15} className="text-primary shrink-0" />
                <a href={`tel:${branch.phone}`} className="font-semibold text-xs hover:text-primary transition-colors">
                  {branch.phone}
                </a>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Thời lượng mỗi ca dùng bữa</span>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 pt-0.5">
                <Clock size={15} className="text-primary shrink-0" />
                <span className="font-semibold text-xs">
                  {branch.slotDurationMinutes || 90} phút / lượt bàn
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 7-day schedule */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Lịch hoạt động trong tuần
          </h4>
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-700 text-xs sm:text-sm">
            {DAY_NAMES.map((dayName, idx) => {
              const config = branch.operatingHours?.find((h) => h.dayOfWeek === idx);
              const isToday = currentDayOfWeek === idx;
              const isOpen = config ? config.isOpen : true;
              const hoursText = config
                ? isOpen
                  ? `${config.openTime} - ${config.closeTime}`
                  : 'Nghỉ'
                : branch.openingTime && branch.closingTime
                  ? `${branch.openingTime} - ${branch.closingTime}`
                  : '08:00 - 22:00';

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-3.5 py-2.5 ${
                    isToday
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{dayName}</span>
                    {isToday && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-primary text-white font-bold">
                        Hôm nay
                      </span>
                    )}
                  </div>
                  <span className={!isOpen ? 'text-rose-500 font-medium' : ''}>
                    {hoursText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal footer CTAs */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <Link
            to={`/menu?branchId=${branch.id}`}
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <UtensilsCrossed size={16} />
            <span>Xem thực đơn chi nhánh</span>
          </Link>

          <Link
            to={`/reservation?branchId=${branch.id}`}
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent hover:opacity-95 rounded-xl transition-opacity flex items-center justify-center gap-2 shadow-sm"
          >
            <Calendar size={16} />
            <span>Đặt bàn tại chi nhánh này</span>
          </Link>
        </div>
      </div>
    </Modal>
  );
};
