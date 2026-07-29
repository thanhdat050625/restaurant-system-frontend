export const APP_NAME = 'FoodHub';
export const DELIVERY_FEE = 25000;
export const FREE_DELIVERY_MIN = 200000;
export const MIN_ORDER = 50000;

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  DELIVERING: 'delivering',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
};

export const DELIVERY_TYPES = {
  DELIVERY: 'delivery',
  PICKUP: 'pickup',
};

export const SEATING_AREAS = [
  { id: 'indoor', name: 'Trong nhà', icon: '🏠' },
  { id: 'outdoor', name: 'Ngoài trời', icon: '🌳' },
  { id: 'vip', name: 'Phòng VIP', icon: '👑' },
];
