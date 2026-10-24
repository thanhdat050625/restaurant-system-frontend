export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SEATED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface IPreOrderItem {
  menuItemId: string;
  quantity: number;
  note?: string;
  menuItem?: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
  };
}

export interface ICreateReservationDto {
  branchId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  guestCount: number;
  reservationDate: string; // YYYY-MM-DD
  reservationTime: string; // HH:mm
  tableTypeId?: string;
  specialNotes?: string;
  preOrders?: IPreOrderItem[];
}

export interface IAvailableSlot {
  time: string;
  isAvailable: boolean;
  remainingTables: number;
}

export interface IAvailableSlotsResponse {
  branchId: string;
  branchName: string;
  date: string;
  slotDurationMinutes: number;
  slots: IAvailableSlot[];
}

export interface IReservation {
  id: string;
  reservationCode: string;
  branchId: string;
  userId?: string | null;
  tableTypeId?: string | null;
  tableId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  guestCount: number;
  reservationDate: string;
  reservationTime: string;
  slotDurationMinutes: number;
  specialNotes?: string | null;
  status: ReservationStatus;
  cancelledReason?: string | null;
  createdAt: string;
  updatedAt: string;
  branch?: {
    id: string;
    name: string;
    phone: string;
    streetAddress?: string;
  };
  tableType?: {
    id: string;
    name: string;
    capacity: number;
  };
  orders?: {
    id: string;
    menuItemId: string;
    quantity: number;
    unitPrice: number;
    note?: string;
    menuItem?: {
      id: string;
      name: string;
      imageUrl?: string;
    };
  }[];
}
