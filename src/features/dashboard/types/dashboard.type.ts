import { IBranch } from '../../../types/admin/branch.type';
import { ITable } from '../../../types/admin/table.type';
import { ITableType } from '../../../types/admin/table-type.type';
import { MenuCategory } from '../../../types/menuCategory.type';
import { MenuItem } from '../../../types/menuItem.type';

export interface IDashboardBranchTable extends IBranch {
  tableCount: number;
}

export interface IDashboardStats {
  branches: IBranch[];
  tables: ITable[];
  tableTypes: ITableType[];
  categories: MenuCategory[];
  menuItems: MenuItem[];
  activeBranchesCount: number;
  activeMenuItemsCount: number;
  featuredMenuItems: MenuItem[];
  tablesPerBranch: IDashboardBranchTable[];
}
