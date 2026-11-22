import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  BellRing,
  CalendarCheck,
  CheckCheck,
  ChefHat,
  Clock,
  CreditCard,
  RefreshCw,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  UserCheck,
  UtensilsCrossed,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { useNotifications } from '../../features/notifications/NotificationContext';
import { NotificationSettingsPanel } from '../../features/notifications/NotificationSettingsPanel';
import Modal from '../ui/Modal';
import {
  INotification,
  NotificationCategory,
  NotificationType,
} from '../../types/notification.type';

interface NotificationBellProps {
  /** Giao diện trên thanh Header khách hàng hay Topbar nhân viên/bếp/admin */
  variant?: 'customer' | 'staff';
  /** Khi Header khách hàng đang ở trạng thái nền trong suốt (hero) hay nền đặc */
  isSolidHeader?: boolean;
}

type FilterTab = 'ALL' | 'UNREAD' | NotificationCategory;

function formatRelativeTime(isoDate: string): string {
  if (!isoDate) return '';
  const diffSec = Math.max(
    0,
    Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000),
  );
  if (diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return new Date(isoDate).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getItemVisual(type: NotificationType) {
  switch (type) {
    case 'RESERVATION_CREATED':
      return {
        icon: BellRing,
        iconClass:
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
      };
    case 'RESERVATION_CANCELLED_BY_CUSTOMER':
    case 'PICKUP_ORDER_CANCELLED_BY_CUSTOMER':
    case 'KITCHEN_ITEM_CANCELLED':
      return {
        icon: XCircle,
        iconClass: 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300',
      };
    case 'RESERVATION_CONFIRMED':
      return {
        icon: CalendarCheck,
        iconClass:
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
      };
    case 'RESERVATION_REMINDER':
    case 'PICKUP_ORDER_REMINDER':
    case 'PICKUP_ORDER_OVERDUE':
    case 'TABLE_DIRTY_OVERDUE':
      return {
        icon: Clock,
        iconClass:
          'bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300',
      };
    case 'PICKUP_ORDER_CREATED':
    case 'PICKUP_ORDER_CONFIRMED':
    case 'PICKUP_ORDER_PREPARING':
    case 'PICKUP_ORDER_COMPLETED':
    case 'PICKUP_ORDER_CANCELLED':
      return {
        icon: ShoppingBag,
        iconClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300',
      };
    case 'PICKUP_ORDER_READY':
      return {
        icon: ShoppingBag,
        iconClass:
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
      };
    case 'KITCHEN_NEW_BATCH':
    case 'KITCHEN_NEW_PICKUP':
      return {
        icon: ChefHat,
        iconClass:
          'bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300',
      };
    case 'KITCHEN_ITEM_READY':
      return {
        icon: UtensilsCrossed,
        iconClass:
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
      };
    case 'TABLE_PAYMENT_REQUESTED':
    case 'PAYMENT_FAILED':
    case 'PAYMENT_REFUNDED':
      return {
        icon: CreditCard,
        iconClass:
          type === 'PAYMENT_FAILED'
            ? 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300'
            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300',
      };
    case 'AUTH_NEW_DEVICE_LOGIN':
    case 'AUTH_SESSIONS_REVOKED':
    case 'AUTH_PASSWORD_CHANGED':
      return {
        icon: ShieldAlert,
        iconClass: 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300',
      };
    case 'AUTH_DAILY_LOGIN':
    case 'AUTH_WELCOME':
      return {
        icon: Sparkles,
        iconClass:
          'bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300',
      };
    case 'STAFF_ACCOUNT_CREATED':
    case 'STAFF_ACCOUNT_LOCKED':
    case 'STAFF_ACCOUNT_UNLOCKED':
    case 'STAFF_BRANCH_TRANSFERRED':
    case 'STAFF_PASSWORD_RESET':
      return {
        icon: UserCheck,
        iconClass: 'bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300',
      };
    default:
      return {
        icon: AlertTriangle,
        iconClass:
          'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300',
      };
  }
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  variant = 'customer',
  isSolidHeader = true,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    soundEnabled,
    toggleSound,
    refreshNotifications,
    markAllAsRead,
    openNotificationTarget,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const filterTabs = useMemo(() => {
    const base: Array<{ key: FilterTab; label: string }> = [
      { key: 'ALL', label: 'Tất cả' },
      { key: 'UNREAD', label: 'Chưa đọc' },
      { key: 'RESERVATION', label: 'Đặt bàn' },
      { key: 'PICKUP', label: 'Mang về' },
    ];
    if (variant === 'staff') {
      base.push({ key: 'KITCHEN', label: 'Bếp/Bàn' });
    }
    base.push({ key: 'SECURITY', label: 'Bảo mật' });
    return base;
  }, [variant]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'ALL') return notifications;
    if (activeFilter === 'UNREAD') {
      return notifications.filter((n) => !n.readAt);
    }
    return notifications.filter((n) => n.category === activeFilter);
  }, [notifications, activeFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      void refreshNotifications(false);
    }
  };

  const handleItemClick = (item: INotification) => {
    setIsOpen(false);
    openNotificationTarget(item);
  };

  const handleOpenSettings = () => {
    setIsOpen(false);
    if (!user?.role || user.role === 'USER') {
      navigate('/profile?tab=notifications');
    } else {
      setIsSettingsOpen(true);
    }
  };

  const bellButtonClass =
    variant === 'staff'
      ? 'relative p-2.5 rounded-xl bg-gray-100 hover:bg-orange-50 text-gray-700 hover:text-primary border border-gray-200/80 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-700 transition-all cursor-pointer'
      : `relative p-2 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer ${
          isSolidHeader
            ? 'text-text-primary dark:text-white hover:bg-light-card dark:hover:bg-dark-card'
            : 'text-white hover:bg-white/10'
        }`;

  return (
    <>
      <div ref={containerRef} className="relative flex items-center gap-1.5">
        {variant === 'staff' && (
          <button
            type="button"
            onClick={toggleSound}
            title={
              soundEnabled
                ? 'Đang bật chuông cảnh báo (Bấm để tắt âm)'
                : 'Đang tắt chuông cảnh báo (Bấm để bật âm)'
            }
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400'
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 size={15} className="text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">Chuông: Bật</span>
              </>
            ) : (
              <>
                <VolumeX size={15} className="text-gray-400" />
                <span className="hidden sm:inline">Chuông: Tắt</span>
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={handleToggleOpen}
          aria-label="Thông báo"
          className={bellButtonClass}
        >
          <Bell size={20} className={unreadCount > 0 ? 'animate-bounce' : ''} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-primary text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-[400px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50">
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50/90 dark:bg-slate-800/90 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Thông báo
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-primary/15 text-primary">
                    {unreadCount} mới
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleSound}
                  title={soundEnabled ? 'Tắt âm thông báo' : 'Bật âm thông báo'}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                </button>

                <button
                  type="button"
                  onClick={handleOpenSettings}
                  title="Cài đặt thông báo"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Settings size={15} />
                </button>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => void markAllAsRead()}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    <CheckCheck size={14} />
                    <span>Đọc hết</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter tabs */}
            <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white dark:bg-slate-900">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    activeFilter === tab.key
                      ? 'bg-primary text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
              {isLoading && notifications.length === 0 ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((idx) => (
                    <div key={idx} className="flex items-start gap-3 animate-pulse">
                      <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-slate-700 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => void refreshNotifications(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    <span>Thử lại</span>
                  </button>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="py-10 px-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3">
                    <Bell size={22} />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Chưa có thông báo nào
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Các thông báo về lịch đặt bàn, đơn món ăn và tài khoản sẽ xuất hiện tức thì tại đây.
                  </p>
                </div>
              ) : (
                filteredNotifications.map((item) => {
                  const visual = getItemVisual(item.type);
                  const Icon = visual.icon;
                  const isUnread = !item.readAt;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                        isUnread
                          ? 'bg-orange-50/60 dark:bg-orange-950/20 hover:bg-orange-50 dark:hover:bg-orange-950/30'
                          : 'bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${visual.iconClass}`}>
                        <Icon size={17} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-xs sm:text-sm leading-snug ${
                              isUnread
                                ? 'font-bold text-gray-900 dark:text-white'
                                : 'font-semibold text-gray-700 dark:text-gray-200'
                            }`}
                          >
                            {item.title}
                          </p>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                          )}
                        </div>

                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {item.body}
                        </p>

                        <span className="mt-1.5 inline-block text-[11px] font-medium text-gray-400 dark:text-gray-500">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal cài đặt thông báo nhanh dành cho Staff / Kitchen / Admin ngay trong ca trực */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Cài đặt thông báo"
        maxWidth="max-w-xl"
      >
        <NotificationSettingsPanel compact />
      </Modal>
    </>
  );
};

export default NotificationBell;
