import { ITableType } from './table-type.type';

export interface ITable {
  id: string;
  name?: string;
  tableNumber: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  branchId: string;
  tableTypeId: string;
  tableType?: ITableType;
}
