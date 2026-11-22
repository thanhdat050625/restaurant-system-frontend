import { PaginationMeta } from './api-response.type';

export type NotificationCategory =
  | 'RESERVATION'
  | 'PICKUP'
  | 'KITCHEN'
  | 'PAYMENT'
  | 'SECURITY'
  | 'ACCOUNT'
  | 'SYSTEM';

export type NotificationType =
  | 'RESERVATION_CREATED'
  | 'RESERVATION_CANCELLED_BY_CUSTOMER'
  | 'RESERVATION_BOOKED'
  | 'RESERVATION_CONFIRMED'
  | 'RESERVATION_CANCELLED'
  | 'RESERVATION_NO_SHOW'
  | 'RESERVATION_REMINDER'
  | 'RESERVATION_PREORDER_UPDATED'
  | 'RESERVATION_DEPOSIT_EXPIRED'
  | 'RESERVATION_AUTO_COMPLETED'
  | 'PICKUP_ORDER_CREATED'
  | 'PICKUP_ORDER_CONFIRMED'
  | 'PICKUP_ORDER_PREPARING'
  | 'PICKUP_ORDER_READY'
  | 'PICKUP_ORDER_COMPLETED'
  | 'PICKUP_ORDER_CANCELLED'
  | 'PICKUP_ORDER_CANCELLED_BY_CUSTOMER'
  | 'PICKUP_ORDER_REMINDER'
  | 'PICKUP_ORDER_OVERDUE'
  | 'KITCHEN_NEW_BATCH'
  | 'KITCHEN_NEW_PICKUP'
  | 'KITCHEN_ITEM_READY'
  | 'KITCHEN_ITEM_CANCELLED'
  | 'TABLE_PAYMENT_REQUESTED'
  | 'TABLE_DIRTY_OVERDUE'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_REFUNDED'
  | 'AUTH_WELCOME'
  | 'AUTH_DAILY_LOGIN'
  | 'AUTH_NEW_DEVICE_LOGIN'
  | 'AUTH_PASSWORD_CHANGED'
  | 'AUTH_SESSIONS_REVOKED'
  | 'STAFF_ACCOUNT_CREATED'
  | 'STAFF_ACCOUNT_LOCKED'
  | 'STAFF_ACCOUNT_UNLOCKED'
  | 'STAFF_BRANCH_TRANSFERRED'
  | 'STAFF_PASSWORD_RESET'
  | 'ADMIN_SYSTEM_ALERT';

export interface INotificationData {
  reservationId?: string;
  reservationCode?: string;
  pickupOrderId?: string;
  orderCode?: string;
  branchId?: string;
  branchName?: string;
  customerName?: string;
  customerPhone?: string;
  guestCount?: number;
  reservationDate?: string;
  reservationTime?: string;
  pickupDate?: string;
  pickupTime?: string;
  tableId?: string;
  tableName?: string | null;
  tableNumber?: string | null;
  status?: string;
  reason?: string | null;
}

export interface INotification {
  id: string;
  userId: string;
  branchId?: string | null;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  link?: string | null;
  data?: INotificationData | null;
  readAt?: string | null;
  createdAt: string;
}

export interface IQueryNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  category?: NotificationCategory;
}

export interface INotificationPreferences {
  inApp: {
    reservation: boolean;
    pickup: boolean;
    kitchen: boolean;
    payment: boolean;
    security: boolean;
    account: boolean;
  };
  email: {
    reservation: boolean;
    pickup: boolean;
  };
  soundEnabled: boolean;
}

export type IUpdateNotificationPreferencesDto = {
  inApp?: Partial<INotificationPreferences['inApp']>;
  email?: Partial<INotificationPreferences['email']>;
  soundEnabled?: boolean;
};

export interface INotificationListResponse {
  items: INotification[];
  meta?: PaginationMeta;
}
