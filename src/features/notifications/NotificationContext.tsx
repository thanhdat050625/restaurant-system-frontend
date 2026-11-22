import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { notificationService } from '../../services/notificationService';
import { socketService } from '../../services/socketService';
import {
  INotification,
  INotificationPreferences,
  IUpdateNotificationPreferencesDto,
} from '../../types/notification.type';
import {
  NotificationSoundKind,
  useNotificationSound,
} from './hooks/useNotificationSound';
import { showNotificationPopup } from '../../components/common/NotificationToast';

const DEFAULT_PREFERENCES: INotificationPreferences = {
  inApp: {
    reservation: true,
    pickup: true,
    kitchen: true,
    payment: true,
    security: true,
    account: true,
  },
  email: {
    reservation: true,
    pickup: true,
  },
  soundEnabled: true,
};

interface INotificationContextValue {
  notifications: INotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  soundEnabled: boolean;
  preferences: INotificationPreferences;
  isSavingPreferences: boolean;
  toggleSound: () => void;
  updatePreferences: (dto: IUpdateNotificationPreferencesDto) => Promise<void>;
  refreshNotifications: (showLoading?: boolean) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  openNotificationTarget: (notification: INotification) => void;
}

const NotificationContext = createContext<INotificationContextValue | null>(null);

function resolveSoundKind(notification: INotification): NotificationSoundKind {
  switch (notification.type) {
    case 'RESERVATION_CREATED':
    case 'PICKUP_ORDER_CREATED':
      return 'staff_created';
    case 'RESERVATION_CANCELLED_BY_CUSTOMER':
    case 'PICKUP_ORDER_CANCELLED_BY_CUSTOMER':
    case 'KITCHEN_ITEM_CANCELLED':
    case 'PAYMENT_FAILED':
      return 'staff_cancelled';
    case 'KITCHEN_NEW_BATCH':
    case 'KITCHEN_NEW_PICKUP':
    case 'KITCHEN_ITEM_READY':
    case 'TABLE_PAYMENT_REQUESTED':
    case 'PICKUP_ORDER_READY':
      return 'kitchen';
    case 'AUTH_NEW_DEVICE_LOGIN':
    case 'AUTH_SESSIONS_REVOKED':
    case 'PICKUP_ORDER_OVERDUE':
    case 'TABLE_DIRTY_OVERDUE':
    case 'ADMIN_SYSTEM_ALERT':
      return 'alert';
    default:
      return 'customer';
  }
}

function resolveNotificationTargetUrl(
  notification: INotification,
  userRole?: string,
): string {
  if (notification.link) {
    return notification.link;
  }

  const resCode = notification.data?.reservationCode;
  const orderCode = notification.data?.orderCode;

  if (notification.category === 'PICKUP' || notification.type.startsWith('PICKUP_')) {
    if (userRole === 'STAFF') {
      return orderCode
        ? `/staff/pickup-orders?code=${encodeURIComponent(orderCode)}`
        : '/staff/pickup-orders';
    }
    if (userRole === 'KITCHEN') {
      return '/kitchen';
    }
    return orderCode
      ? `/profile?tab=pickup-orders&code=${encodeURIComponent(orderCode)}`
      : '/profile?tab=pickup-orders';
  }

  if (notification.category === 'KITCHEN') {
    if (userRole === 'KITCHEN') return '/kitchen';
    return notification.data?.tableId
      ? `/staff/table-turnover?table=${encodeURIComponent(notification.data.tableId)}`
      : '/staff/table-turnover';
  }

  if (notification.category === 'SECURITY') {
    return '/profile';
  }

  if (notification.category === 'SYSTEM' && userRole === 'ADMIN') {
    return '/admin';
  }

  if (userRole === 'STAFF') {
    return resCode
      ? `/staff/reservations?code=${encodeURIComponent(resCode)}`
      : '/staff/reservations';
  }

  return resCode
    ? `/profile?tab=reservations&code=${encodeURIComponent(resCode)}`
    : '/profile?tab=reservations';
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { soundEnabled, syncSoundEnabled, toggleSound: toggleLocalSound, playSound } =
    useNotificationSound();

  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] =
    useState<INotificationPreferences>(DEFAULT_PREFERENCES);
  const [isSavingPreferences, setIsSavingPreferences] = useState<boolean>(false);

  const seenIdsRef = useRef<Set<string>>(new Set());

  const refreshNotifications = useCallback(
    async (showLoading = false) => {
      if (!isAuthenticated || !user?.id) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      if (showLoading) setIsLoading(true);
      setError(null);

      try {
        const [listRes, countRes] = await Promise.all([
          notificationService.getMyNotifications({ page: 1, limit: 40 }),
          notificationService.getUnreadCount(),
        ]);

        const rawItems =
          (listRes as any)?.data?.items ||
          (listRes as any)?.data ||
          (listRes as any)?.items ||
          [];
        const items: INotification[] = Array.isArray(rawItems) ? rawItems : [];
        items.forEach((item) => seenIdsRef.current.add(item.id));
        setNotifications(items);

        const count =
          (countRes as any)?.data?.count ??
          (countRes as any)?.count ??
          items.filter((i) => !i.readAt).length;
        setUnreadCount(typeof count === 'number' ? count : 0);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || 'Không thể tải danh sách thông báo.',
        );
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [isAuthenticated, user?.id],
  );

  const loadPreferences = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setPreferences(DEFAULT_PREFERENCES);
      return;
    }
    try {
      const res = await notificationService.getPreferences();
      const data = (res as any)?.data || res;
      if (data?.inApp && data?.email) {
        setPreferences(data);
        if (typeof data.soundEnabled === 'boolean') {
          syncSoundEnabled(data.soundEnabled);
        }
      }
    } catch {
      // Giữ mặc định nếu chưa tải được
    }
  }, [isAuthenticated, user?.id, syncSoundEnabled]);

  const updatePreferences = useCallback(
    async (dto: IUpdateNotificationPreferencesDto) => {
      setIsSavingPreferences(true);
      try {
        const res = await notificationService.updatePreferences(dto);
        const updated = (res as any)?.data || res;
        if (updated?.inApp && updated?.email) {
          setPreferences(updated);
          if (typeof updated.soundEnabled === 'boolean') {
            syncSoundEnabled(updated.soundEnabled);
          }
        }
      } finally {
        setIsSavingPreferences(false);
      }
    },
    [syncSoundEnabled],
  );

  const toggleSound = useCallback(() => {
    const next = toggleLocalSound();
    setPreferences((prev) => ({ ...prev, soundEnabled: next }));
    if (isAuthenticated && user?.id) {
      notificationService.updatePreferences({ soundEnabled: next }).catch(() => {});
    }
  }, [toggleLocalSound, isAuthenticated, user?.id]);

  const markAsRead = useCallback(async (id: string) => {
    let wasUnread = false;
    setNotifications((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (!item.readAt) wasUnread = true;
          return { ...item, readAt: item.readAt || new Date().toISOString() };
        }
        return item;
      }),
    );

    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await notificationService.markAsRead(id);
    } catch {
      // Sẽ đồng bộ lại ở lần tải tiếp theo
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const nowIso = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((item) => (item.readAt ? item : { ...item, readAt: nowIso })),
    );
    setUnreadCount(0);

    try {
      await notificationService.markAllAsRead();
    } catch {
      void refreshNotifications(false);
    }
  }, [refreshNotifications]);

  const openNotificationTarget = useCallback(
    (notification: INotification) => {
      if (!notification.readAt) {
        void markAsRead(notification.id);
      }
      const targetUrl = resolveNotificationTargetUrl(notification, user?.role);
      navigate(targetUrl);
    },
    [markAsRead, navigate, user?.role],
  );

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      seenIdsRef.current.clear();
      setNotifications([]);
      setUnreadCount(0);
      setPreferences(DEFAULT_PREFERENCES);
      return;
    }

    void Promise.all([refreshNotifications(true), loadPreferences()]);
  }, [isAuthenticated, user?.id, refreshNotifications, loadPreferences]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const socket = socketService.connect(user.id);

    const handleIncomingNotification = (incoming: INotification) => {
      if (!incoming || !incoming.id) return;

      const isAlreadySeen = seenIdsRef.current.has(incoming.id);
      seenIdsRef.current.add(incoming.id);

      setNotifications((prev) => {
        const exists = prev.some((item) => item.id === incoming.id);
        if (exists) return prev;
        return [incoming, ...prev].slice(0, 60);
      });

      if (!isAlreadySeen && !incoming.readAt) {
        setUnreadCount((prev) => prev + 1);
      }

      if (!isAlreadySeen) {
        playSound(resolveSoundKind(incoming));
        showNotificationPopup(incoming, {
          onActionClick: (item) => openNotificationTarget(item),
        });
        window.dispatchEvent(
          new CustomEvent('foodhub:notification', { detail: incoming }),
        );
      }
    };

    const handleReconnect = () => {
      void refreshNotifications(false);
    };

    socketService.on('notification:new', handleIncomingNotification);
    socket.on('connect', handleReconnect);

    return () => {
      socketService.off('notification:new', handleIncomingNotification);
      socket.off('connect', handleReconnect);
    };
  }, [
    isAuthenticated,
    user?.id,
    playSound,
    openNotificationTarget,
    refreshNotifications,
  ]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        soundEnabled,
        preferences,
        isSavingPreferences,
        toggleSound,
        updatePreferences,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        openNotificationTarget,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): INotificationContextValue => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications phải được sử dụng bên trong NotificationProvider');
  }
  return ctx;
};
