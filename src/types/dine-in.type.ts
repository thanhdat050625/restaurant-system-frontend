export type InvoiceStatus = 'OPEN' | 'PAYMENT_PENDING' | 'PAID' | 'CANCELLED';

export type KitchenItemStatus = 'QUEUED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

export type PaymentMethodType = 'CASH' | 'BANKING' | 'VNPAY' | 'MOMO' | 'CARD';

export interface IDineInMenuCategory {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface IDineInMenuItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  originalPrice?: number | null;
  imageUrl?: string | null;
  isFeatured?: boolean;
  preparationTime?: number | null;
  category?: IDineInMenuCategory | null;
}

export interface IDineInOrderItem {
  id: string;
  batchId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
  note?: string | null;
  status: KitchenItemStatus;
  preparedAt?: string | null;
  readyAt?: string | null;
  servedAt?: string | null;
  cancelledReason?: string | null;
  createdAt: string;
  updatedAt: string;
  menuItem: {
    id: string;
    name: string;
    price?: number | string;
    imageUrl?: string | null;
    preparationTime?: number | null;
  };
}

export interface IDineInOrderBatch {
  id: string;
  batchNumber: number;
  invoiceId: string;
  branchId: string;
  tableId: string;
  orderedByRole: 'USER' | 'STAFF' | 'KITCHEN' | 'ADMIN';
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  items: IDineInOrderItem[];
}

export interface IDineInReservationInfo {
  id: string;
  reservationCode: string;
  customerName: string;
  customerPhone: string;
  reservationTime: string;
  guestCount: number;
}

export interface IInvoice {
  id: string;
  invoiceCode: string;
  branchId: string;
  tableId: string;
  reservationId?: string | null;
  userId?: string | null;
  customerName: string;
  customerPhone?: string | null;
  guestCount: number;
  subtotal: number | string;
  discountAmount: number | string;
  finalAmount: number | string;
  status: InvoiceStatus;
  paymentMethod?: string | null;
  notes?: string | null;
  openedAt: string;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  batches?: IDineInOrderBatch[];
  reservation?: IDineInReservationInfo | null;
}

export interface IDineInTableBranch {
  id: string;
  name: string;
  address?: string | null;
  streetAddress?: string | null;
  phone?: string | null;
  status: string;
  openingTime?: string | null;
  closingTime?: string | null;
}

export interface IDineInTableInfo {
  id: string;
  tableNumber: string;
  floor: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'DIRTY';
  capacity?: number;
  tableTypeName?: string;
  branch: IDineInTableBranch;
}

export interface ITableSessionResponse {
  table: IDineInTableInfo;
  activeInvoice: IInvoice | null;
  menu: IDineInMenuItem[];
}

export interface IOpenTableSessionDto {
  customerName?: string;
  customerPhone?: string;
  guestCount?: number;
  reservationId?: string;
  notes?: string;
}

export interface IOrderBatchItemInput {
  menuItemId: string;
  quantity: number;
  note?: string;
}

export interface ICreateOrderBatchDto {
  items: IOrderBatchItemInput[];
  note?: string;
  customerName?: string;
  customerPhone?: string;
}

export interface ICreateOrderBatchResponse {
  batch: IDineInOrderBatch;
  updatedInvoice: IInvoice;
}

export interface ICheckoutInvoiceDto {
  paymentMethod: PaymentMethodType;
  discountAmount?: number;
  notes?: string;
}
