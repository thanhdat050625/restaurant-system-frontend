import toast from 'react-hot-toast';
import {
  AlertTriangle,
  BellRing,
  CalendarCheck,
  ChefHat,
  Clock,
  CreditCard,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  UserCheck,
  UtensilsCrossed,
  X,
  XCircle,
} from 'lucide-react';
import { INotification, NotificationType } from '../../types/notification.type';

interface ShowNotificationPopupOptions {
  onActionClick?: (notification: INotification) => void;
}

function getPopupConfig(type: NotificationType) {
  switch (type) {
    case 'RESERVATION_CREATED':
      return {
        icon: BellRing,
        badgeText: 'Đặt bàn mới',
        accentBorder: 'border-l-4 border-l-emerald-500',
        iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
        badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300',
        actionLabel: 'Xem & Xác nhận',
        duration: 8500,
      };
    case 'RESERVATION_CANCELLED_BY_CUSTOMER':
    case 'PICKUP_ORDER_CANCELLED_BY_CUSTOMER':
      return {
        icon: XCircle,
        badgeText: type === 'RESERVATION_CANCELLED_BY_CUSTOMER' ? 'Khách hủy bàn' : 'Khách hủy món',
        accentBorder: 'border-l-4 border-l-red-500',
        iconBg: 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300',
        badgeClass: 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300',
        actionLabel: 'Kiểm tra đơn',
        duration: 8500,
      };
    case 'RESERVATION_CONFIRMED':
      return {
        icon: CalendarCheck,
        badgeText: 'Đã xác nhận',
        accentBorder: 'border-l-4 border-l-emerald-500',
        iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
        badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300',
        actionLabel: 'Xem mã QR Check-in',
        duration: 6500,
      };
    case 'RESERVATION_REMINDER':
    case 'PICKUP_ORDER_REMINDER':
      return {
        icon: Clock,
        badgeText: 'Nhắc lịch hẹn',
        accentBorder: 'border-l-4 border-l-orange-500',
        iconBg: 'bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300',
        badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300',
        actionLabel: 'Xem chi tiết',
        duration: 7500,
      };
    case 'PICKUP_ORDER_CREATED':
    case 'PICKUP_ORDER_CONFIRMED':
    case 'PICKUP_ORDER_PREPARING':
    case 'PICKUP_ORDER_COMPLETED':
      return {
        icon: ShoppingBag,
        badgeText:
          type === 'PICKUP_ORDER_CREATED'
            ? 'Đơn mang về'
            : type === 'PICKUP_ORDER_PREPARING'
              ? 'Bếp đang làm'
              : 'Cập nhật mang về',
        accentBorder: 'border-l-4 border-l-blue-500',
        iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300',
        badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300',
        actionLabel: 'Xem đơn hàng',
        duration: 7000,
      };
    case 'PICKUP_ORDER_READY':
      return {
        icon: ShoppingBag,
        badgeText: 'Món đã sẵn sàng!',
        accentBorder: 'border-l-4 border-l-emerald-500',
        iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
        badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300',
        actionLabel: 'Mở mã nhận món',
        duration: 8500,
      };
    case 'KITCHEN_NEW_BATCH':
    case 'KITCHEN_NEW_PICKUP':
      return {
        icon: ChefHat,
        badgeText: 'Đơn bếp mới',
        accentBorder: 'border-l-4 border-l-orange-500',
        iconBg: 'bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300',
        badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300',
        actionLabel: 'Mở màn hình Bếp',
        duration: 8000,
      };
    case 'KITCHEN_ITEM_READY':
      return {
        icon: UtensilsCrossed,
        badgeText: 'Món sẵn sàng phục vụ',
        accentBorder: 'border-l-4 border-l-emerald-500',
        iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
        badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300',
        actionLabel: 'Xem bàn ăn',
        duration: 8000,
      };
    case 'TABLE_PAYMENT_REQUESTED':
    case 'PAYMENT_FAILED':
    case 'PAYMENT_REFUNDED':
      return {
        icon: CreditCard,
        badgeText:
          type === 'TABLE_PAYMENT_REQUESTED'
            ? 'Yêu cầu thanh toán'
            : type === 'PAYMENT_REFUNDED'
              ? 'Hoàn tiền'
              : 'Thanh toán lỗi',
        accentBorder:
          type === 'PAYMENT_FAILED'
            ? 'border-l-4 border-l-red-500'
            : 'border-l-4 border-l-indigo-500',
        iconBg:
          type === 'PAYMENT_FAILED'
            ? 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300'
            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300',
        badgeClass:
          type === 'PAYMENT_FAILED'
            ? 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300'
            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300',
        actionLabel: 'Kiểm tra ngay',
        duration: 8000,
      };
    case 'AUTH_NEW_DEVICE_LOGIN':
    case 'AUTH_SESSIONS_REVOKED':
    case 'AUTH_PASSWORD_CHANGED':
      return {
        icon: ShieldAlert,
        badgeText: 'Bảo mật tài khoản',
        accentBorder: 'border-l-4 border-l-red-500',
        iconBg: 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300',
        badgeClass: 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300',
        actionLabel: 'Xem tài khoản',
        duration: 7500,
      };
    case 'AUTH_DAILY_LOGIN':
    case 'AUTH_WELCOME':
      return {
        icon: Sparkles,
        badgeText: 'FoodHub',
        accentBorder: 'border-l-4 border-l-primary',
        iconBg: 'bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300',
        badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300',
        actionLabel: 'Khám phá',
        duration: 5000,
      };
    case 'STAFF_ACCOUNT_CREATED':
    case 'STAFF_ACCOUNT_LOCKED':
    case 'STAFF_ACCOUNT_UNLOCKED':
    case 'STAFF_BRANCH_TRANSFERRED':
    case 'STAFF_PASSWORD_RESET':
      return {
        icon: UserCheck,
        badgeText: 'Tài khoản nhân sự',
        accentBorder: 'border-l-4 border-l-sky-500',
        iconBg: 'bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300',
        badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300',
        actionLabel: 'Xem chi tiết',
        duration: 6500,
      };
    default:
      return {
        icon: AlertTriangle,
        badgeText: 'Thông báo hệ thống',
        accentBorder: 'border-l-4 border-l-amber-500',
        iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300',
        badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300',
        actionLabel: 'Xem chi tiết',
        duration: 6500,
      };
  }
}

export function showNotificationPopup(
  notification: INotification,
  options?: ShowNotificationPopupOptions,
) {
  const cfg = getPopupConfig(notification.type);
  const Icon = cfg.icon;

  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white dark:bg-slate-800 shadow-2xl rounded-2xl pointer-events-auto border border-gray-200 dark:border-slate-700 ${cfg.accentBorder} overflow-hidden transition-all`}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${cfg.iconBg}`}>
              <Icon size={20} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${cfg.badgeClass}`}
                >
                  {cfg.badgeText}
                </span>
                <button
                  type="button"
                  onClick={() => toast.dismiss(t.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors"
                  aria-label="Đóng thông báo"
                >
                  <X size={15} />
                </button>
              </div>

              <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                {notification.title}
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                {notification.body}
              </p>

              {options?.onActionClick && (
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      toast.dismiss(t.id);
                      options.onActionClick?.(notification);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary-dark text-white shadow-xs transition-colors cursor-pointer"
                  >
                    {cfg.actionLabel}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      id: `notif-${notification.id}`,
      duration: cfg.duration,
      position: 'top-right',
    },
  );
}
