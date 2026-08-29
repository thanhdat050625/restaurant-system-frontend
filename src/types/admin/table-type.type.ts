export interface ITableType {
  id: string;
  name: string;
  capacity: number;
  description?: string;
}

export interface QueryTableTypeParams {
  page?: number;
  limit?: number;
  search?: string;
  capacity?: number;
}
