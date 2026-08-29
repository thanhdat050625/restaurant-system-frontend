import { ITableType } from './table-type.type';
import { IBranch } from './branch.type';

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
