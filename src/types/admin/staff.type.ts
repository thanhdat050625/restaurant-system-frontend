export interface IStaffBranch {
  id: string;
  name: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IStaff {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  avatar?: string | null;
  role: 'STAFF';
  isActive: boolean;
  branchId: string;
  branch?: IStaffBranch | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateStaffDto {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  branchId: string;
}

export interface IUpdateStaffDto {
  fullName?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  branchId?: string;
  isActive?: boolean;
}

export interface IQueryStaffParams {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
  isActive?: boolean;
}

export interface IStaffListResponse {
  items: IStaff[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
