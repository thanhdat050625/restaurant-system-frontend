import { IDineInOrderItem, KitchenItemStatus } from './dine-in.type';
import { PickupOrderStatus, IPickupOrder } from './pickup-order.type';

export type KitchenSourceFilter = 'ALL' | 'DINE_IN' | 'PICKUP';
export type KitchenStatusFilter = KitchenItemStatus | 'ALL';

export interface IKitchenQueueSummary {
  queuedCount: number;
  preparingCount: number;
  readyCount: number;
  totalActive: number;
}

export interface IKitchenDineInBatch {
  id: string;
  batchNumber: number;
  invoiceId: string;
  branchId: string;
  tableId: string;
  orderedByRole: 'USER' | 'STAFF' | 'KITCHEN' | 'ADMIN';
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  table: {
    id: string;
    tableNumber: string;
    floor: number;
  };
  invoice: {
    id: string;
    invoiceCode: string;
    customerName: string;
  };
  items: IDineInOrderItem[];
}

export interface IKitchenPickupOrder extends Omit<IPickupOrder, 'items'> {
  items: {
    id: string;
    orderId: string;
    menuItemId: string;
    quantity: number;
    unitPrice: number | string;
    subtotal: number | string;
    note?: string | null;
    menuItem: {
      id: string;
      name: string;
      imageUrl?: string | null;
      preparationTime?: number | null;
    };
  }[];
}

export interface IKitchenQueueResponse {
  branchId: string;
  summary: IKitchenQueueSummary;
  dineInBatches: IKitchenDineInBatch[];
  pickupOrders: IKitchenPickupOrder[];
}

export interface IQueryKitchenQueueParams {
  branchId?: string;
  source?: KitchenSourceFilter;
  status?: KitchenStatusFilter;
}

export interface IUpdateKitchenItemStatusDto {
  status: KitchenItemStatus;
  cancelledReason?: string;
}

export interface IUpdateKitchenBatchStatusDto {
  status: KitchenItemStatus;
}

export type KitchenPickupTransitionStatus = Extract<PickupOrderStatus, 'PREPARING' | 'READY' | 'COMPLETED'>;

