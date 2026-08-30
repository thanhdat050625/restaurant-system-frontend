export interface IProvince {
  code: string;
  name: string;
  level: string;
}

export interface IWard {
  code: string;
  name: string;
  fullName: string;
  level: string;
  provinceCode: string;
}

export interface IBranch {
  id: string;
  name: string;
  streetAddress: string;
  provinceCode: string;
  wardCode: string;
  province?: IProvince;
  ward?: IWard;
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
