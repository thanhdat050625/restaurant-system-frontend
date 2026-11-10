import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { branchService } from '../../../services/admin/branchService';
import { tableService } from '../../../services/admin/tableService';
import { tableTypeService } from '../../../services/admin/tableTypeService';
import { menuCategoryService } from '../../../services/admin/menuCategory.service';
import { menuItemService } from '../../../services/admin/menuItem.service';
import { IBranch } from '../../../types/admin/branch.type';
import { ITable } from '../../../types/admin/table.type';
import { ITableType } from '../../../types/admin/table-type.type';
import { MenuCategory } from '../../../types/menuCategory.type';
import { MenuItem } from '../../../types/menuItem.type';
import { IDashboardBranchTable } from '../types/dashboard.type';

export function useDashboardStats() {
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [tables, setTables] = useState<ITable[]>([]);
  const [tableTypes, setTableTypes] = useState<ITableType[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchAllStats = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [branchesRes, tablesRes, tableTypesRes, categoriesRes, menuItemsRes] = await Promise.all([
        branchService.getBranches({ limit: 100 }).catch(() => ({ data: [] })),
        tableService.getTables({ limit: 1000 }).catch(() => ({ data: [] })),
        tableTypeService.getTableTypes({ limit: 100 }).catch(() => ({ data: [] })),
        menuCategoryService.getAll({ includeInactive: true, limit: 100 }).catch(() => ({ data: [] })),
        menuItemService.getAll({ includeInactive: true, limit: 1000 }).catch(() => ({ data: [] })),
      ]);

      const branchList = Array.isArray(branchesRes)
        ? branchesRes
        : Array.isArray((branchesRes as any)?.data)
          ? (branchesRes as any).data
          : [];
      const tableList = Array.isArray(tablesRes)
        ? tablesRes
        : Array.isArray((tablesRes as any)?.data)
          ? (tablesRes as any).data
          : [];
      const tableTypeList = Array.isArray(tableTypesRes)
        ? tableTypesRes
        : Array.isArray((tableTypesRes as any)?.data)
          ? (tableTypesRes as any).data
          : [];
      const categoryList = Array.isArray(categoriesRes)
        ? categoriesRes
        : Array.isArray((categoriesRes as any)?.data)
          ? (categoriesRes as any).data
          : [];
      const menuItemList = Array.isArray(menuItemsRes)
        ? menuItemsRes
        : Array.isArray((menuItemsRes as any)?.data)
          ? (menuItemsRes as any).data
          : [];

      setBranches(branchList);
      setTables(tableList);
      setTableTypes(tableTypeList);
      setCategories(categoryList);
      setMenuItems(menuItemList);

      if (isManualRefresh) {
        toast.success('Đã cập nhật dữ liệu mới nhất!');
      }
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      toast.error('Lỗi khi tải dữ liệu thống kê');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  const activeBranchesCount = useMemo(
    () => branches.filter((b) => b.status === 'ACTIVE').length,
    [branches],
  );

  const activeMenuItemsCount = useMemo(
    () => menuItems.filter((m) => m.isActive).length,
    [menuItems],
  );

  const featuredMenuItems = useMemo(
    () => menuItems.filter((m) => m.isFeatured),
    [menuItems],
  );

  const tablesPerBranch: IDashboardBranchTable[] = useMemo(
    () =>
      branches.map((b) => ({
        ...b,
        tableCount: tables.filter((t) => t.branchId === b.id).length,
      })),
    [branches, tables],
  );

  return {
    branches,
    tables,
    tableTypes,
    categories,
    menuItems,
    activeBranchesCount,
    activeMenuItemsCount,
    featuredMenuItems,
    tablesPerBranch,
    loading,
    refreshing,
    refresh: () => fetchAllStats(true),
  };
}
