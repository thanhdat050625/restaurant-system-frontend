import { ITableType } from './table-type.type';
import { IBranch } from './branch.type';

export interface ITableLockStatus {
  isLocked: boolean;
  lockedByMe: boolean;
  expiresIn: number | null;
}

export interface ITable {
  id: string;
  tableNumber: string;
  floor: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'DIRTY';
  note?: string;
  branchId: string;
  tableTypeId: string;
  branch?: IBranch;
  tableType?: ITableType;
  lockStatus?: ITableLockStatus;
  /** Bàn đã có đơn đặt trong khung giờ đang xem (chỉ có ở API tìm bàn theo khung giờ) */
  isReserved?: boolean;
}

export interface QueryRestaurantTableParams {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
  tableTypeId?: string;
  status?: string;
  floor?: number;
}

export interface SearchAvailableTablesParams {
  branchId: string;
  partySize: number;
  floor?: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes?: number;
  includeLocked?: boolean;
}
