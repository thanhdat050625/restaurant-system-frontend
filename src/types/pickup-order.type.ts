import { IBranch } from './admin/branch.type';
import { MenuItem } from './menuItem.type';
import { PaginationMeta } from './api-response.type';

export type PickupOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export interface IPickupOrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
  note?: string | null;
  menuItem?: MenuItem;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPickupOrder {
  id: string;
  orderCode: string;
  branchId: string;
  userId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  pickupDate: string;
  pickupTime: string;
  totalAmount: number | string;
  specialNotes?: string | null;
  status: PickupOrderStatus;
  cancelledReason?: string | null;
  createdAt: string;
  updatedAt: string;
  branch?: IBranch;
  items?: IPickupOrderItem[];
  qrPayload?: string;
  canCancel?: boolean;
}

export interface ICreatePickupOrderItemRequest {
  menuItemId: string;
  quantity: number;
  note?: string;
}

export interface ICreatePickupOrderRequest {
  branchId: string;
  pickupDate: string;
  pickupTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  specialNotes?: string;
  items: ICreatePickupOrderItemRequest[];
}

export interface IQueryPickupOrderParams {
  page?: number;
  limit?: number;
  branchId?: string;
  status?: PickupOrderStatus | 'ALL';
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export interface IPickupOrdersResponse {
  items: IPickupOrder[];
  meta: PaginationMeta;
}
