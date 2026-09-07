import { MenuItem } from '../menuItem.type';
import { MenuCategory } from '../menuCategory.type';
import { PaginationMeta } from '../api-response.type';

export interface IBranchMenuItem {
  id: string;
  branchId: string;
  menuItemId: string;
  isAvailable: boolean; // Còn hàng / Tạm hết hôm nay
  isActive: boolean; // Chi nhánh có kinh doanh món này không
  priceOverride?: number | string | null; // Giá riêng của chi nhánh
  createdAt: string;
  updatedAt: string;
  menuItem: MenuItem & {
    category?: MenuCategory;
  };
}

export interface IBranchMenuStats {
  total: number;
  inStock: number;
  outOfStock: number;
  inactive: number;
}

export interface IBranchInfo {
  id: string;
  name: string;
  address: string;
  phone?: string;
}

export interface IBranchMenuResponse {
  branch: IBranchInfo;
  stats: IBranchMenuStats;
  items: IBranchMenuItem[];
  meta: PaginationMeta;
}

export interface IQueryBranchMenuParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isAvailable?: boolean;
  isActive?: boolean;
}

export interface IUpdateBranchMenuPrice {
  priceOverride?: number | null;
}

export interface IBulkUpdateBranchMenu {
  menuItemIds: string[];
  isAvailable?: boolean;
  isActive?: boolean;
}
