import React, { useEffect, useState } from 'react';
import { Building2, CalendarDays, Clock, Users, Armchair, UtensilsCrossed, Timer, Info } from 'lucide-react';
import { IBranch } from '../../types/admin/branch.type';
import { ITable } from '../../types/admin/table.type';
import { IPreOrderItem } from '../../types/reservation.type';
import { formatPrice } from '../../utils/helpers';
import { ui, formatReservationDate } from './reservationUi';

interface ReservationSummaryCardProps {
  branch?: IBranch;
  date: string;
  time: string;
  endTime?: string;
  slotCount?: number;
  slotDurationMinutes?: number;
  guests: number;
  selectedTable: ITable | null;
  holdExpiresAt: number | null;
  preOrders: IPreOrderItem[];
}

const useCountdown = (expiresAt: number | null) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  if (!expiresAt) return null;
  const totalSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
};

const Row: React.FC<{ icon: typeof Clock; label: string; children: React.ReactNode }> = ({
  icon: Icon,
  label,
  children,
}) => (
  <div className="flex items-start gap-3 py-3">
    <Icon size={17} className="text-primary shrink-0 mt-0.5" />
    <div className="min-w-0 flex-1">
      <p className="text-[11px] uppercase tracking-wide text-text-light">{label}</p>
      <div className={`text-sm font-medium ${ui.heading}`}>{children}</div>
    </div>
  </div>
);

/** Tóm tắt đơn đặt bàn hiển thị xuyên suốt các bước */
export const ReservationSummaryCard: React.FC<ReservationSummaryCardProps> = ({
  branch,
  date,
  time,
  endTime,
  slotCount = 1,
  slotDurationMinutes = 90,
  guests,
  selectedTable,
  holdExpiresAt,
  preOrders,
}) => {
  const countdown = useCountdown(selectedTable ? holdExpiresAt : null);
  const totalCount = preOrders.reduce((sum, p) => sum + p.quantity, 0);
  const totalAmount = preOrders.reduce((sum, p) => sum + (p.menuItem?.price || 0) * p.quantity, 0);
  const placeholder = <span className="font-normal text-text-light">Chưa chọn</span>;

  return (
    <div className={`${ui.card} overflow-hidden`}>
      <div className="px-5 py-4 bg-gradient-to-r from-primary to-primary-dark text-white">
        <p className="text-xs text-white/80">Đơn đặt bàn của bạn</p>
        <p className="font-semibold font-[family-name:var(--font-heading)] text-lg truncate">
          {branch?.name || 'FoodHub'}
        </p>
      </div>

      <div className="px-5 divide-y divide-light-border dark:divide-dark-border">
        <Row icon={Building2} label="Địa chỉ">
          {branch?.streetAddress || placeholder}
        </Row>
        <Row icon={CalendarDays} label="Ngày">
          {date ? formatReservationDate(date) : placeholder}
        </Row>
        <div className="grid grid-cols-2 gap-3">
          <Row icon={Clock} label="Khung giờ">
            {time ? (
              <div>
                <span>{time}{endTime ? ` - ${endTime}` : ''}</span>
                <span className="block text-[11px] font-normal text-text-light">
                  {slotCount * slotDurationMinutes}p ({slotCount} slot)
                </span>
              </div>
            ) : (
              placeholder
            )}
          </Row>
          <Row icon={Users} label="Số khách">
            {guests} người
          </Row>
        </div>
        <Row icon={Armchair} label="Vị trí bàn">
          {selectedTable ? (
            <span>
              Bàn {selectedTable.tableNumber}
              <span className="font-normal text-text-secondary dark:text-text-light">
                {' '}
                · Tầng {selectedTable.floor || 1} · {selectedTable.tableType?.capacity || 2} chỗ
              </span>
            </span>
          ) : (
            <span className="font-normal text-text-secondary dark:text-text-light">Nhà hàng tự xếp bàn</span>
          )}
        </Row>
        {preOrders.length > 0 && (
          <Row icon={UtensilsCrossed} label={`Món gọi trước (${totalCount})`}>
            <span className="text-primary">{formatPrice(totalAmount)}</span>
          </Row>
        )}
      </div>

      {countdown && (
        <div className="mx-5 mb-4 px-3.5 py-2.5 rounded-xl bg-warning/10 text-warning text-xs font-semibold flex items-center gap-2">
          <Timer size={15} />
          Đang giữ bàn cho bạn · còn {countdown}
        </div>
      )}

      <div className="px-5 py-3.5 bg-light-card/60 dark:bg-dark-card/60 text-[11px] text-text-secondary dark:text-text-light flex gap-2">
        <Info size={14} className="shrink-0 mt-px" />
        <span>Đơn sẽ ở trạng thái chờ xác nhận, nhà hàng sẽ liên hệ với bạn trước giờ đến.</span>
      </div>
    </div>
  );
};
