export interface IBranch {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  status: 'ACTIVE' | 'CLOSED' | 'INACTIVE';
}

export interface QueryBranchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
