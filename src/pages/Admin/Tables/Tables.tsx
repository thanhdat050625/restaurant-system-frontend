import React, { useState, useEffect } from 'react';
import { tableService } from '../../../services/admin/tableService';
import { branchService } from '../../../services/admin/branchService';
import { tableTypeService } from '../../../services/admin/tableTypeService';
import { ITable } from '../../../types/admin/table.type';
import { IBranch } from '../../../types/admin/branch.type';
import { ITableType } from '../../../types/admin/table-type.type';
import { PaginationMeta } from '../../../types/api-response.type';
import Modal from '../../../components/ui/Modal';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import TableForm, { TableFormData } from './TableForm';
import BulkTableForm, { BulkTableFormData } from './BulkTableForm';
import Pagination from '../../../components/common/Pagination';
import { Search, Filter, Plus, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

const Tables: React.FC = () => {
  const [tables, setTables] = useState<ITable[]>([]);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [tableTypes, setTableTypes] = useState<ITableType[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination & Filter state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [selectedTableTypeId, setSelectedTableTypeId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<ITable | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm delete state
  const [deleteTable, setDeleteTable] = useState<ITable | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTablesOnly();
  }, [page, limit, search, selectedBranchId, selectedTableTypeId, statusFilter]);

  const fetchInitialData = async () => {
    try {
      const [branchesRes, typesRes] = await Promise.all([
        branchService.getBranches({ limit: 100 }),
        tableTypeService.getTableTypes({ limit: 100 })
      ]);

      if (branchesRes?.data) setBranches(branchesRes.data);
      if (typesRes?.data) setTableTypes(typesRes.data);

    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Lỗi khi tải dữ liệu cấu hình');
    }
  };

  const fetchTablesOnly = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const params: any = { page, limit };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (selectedBranchId !== 'ALL') {
        params.branchId = selectedBranchId;
      }

      if (selectedTableTypeId !== 'ALL') {
        params.tableTypeId = selectedTableTypeId;
      }

      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      const res = await tableService.getTables(params);
      if (Array.isArray(res)) {
        setTables(res);
        setMeta(null);
      } else {
        setTables(res?.data || []);
        setMeta(res?.meta || null);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Lỗi khi tải danh sách bàn');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleBranchFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBranchId(e.target.value);
    setPage(1);
  };

  const handleTableTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTableTypeId(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleOpenModal = (table?: ITable) => {
    setSelectedTable(table || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTable(null);
    setIsModalOpen(false);
  };

  const handleOpenBulkModal = () => {
    setIsBulkModalOpen(true);
  };

  const handleCloseBulkModal = () => {
    setIsBulkModalOpen(false);
  };

  const handleSubmit = async (data: TableFormData) => {
    try {
      setIsSubmitting(true);
      if (selectedTable) {
        const res = await tableService.updateTable(selectedTable.id, data);
        const updated = (res as any)?.data || res;
        const matchedBranch = branches.find(b => b.id === (updated.branchId || selectedTable.branchId));
        const matchedType = tableTypes.find(tt => tt.id === (updated.tableTypeId || selectedTable.tableTypeId));
        setTables(prev => prev.map(t => t.id === selectedTable.id ? { 
          ...t, 
          ...updated, 
          branch: matchedBranch || t.branch, 
          tableType: matchedType || t.tableType 
        } : t));
        toast.success('Cập nhật bàn thành công!');
        handleCloseModal();
      } else {
        await tableService.createTable(data);
        toast.success('Thêm bàn thành công!');
        handleCloseModal();
        fetchTablesOnly(false);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra!');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkSubmit = async (data: BulkTableFormData) => {
    try {
      setIsSubmitting(true);
      const res = await tableService.bulkCreateTables(data);
      toast.success(res?.data?.message || 'Tạo hàng loạt bàn thành công!');
      handleCloseBulkModal();
      fetchTablesOnly(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra!');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (table: ITable) => {
    setDeleteTable(table);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTable) return;
    try {
      setIsDeleting(true);
      await tableService.deleteTable(deleteTable.id);
      setTables(prev => prev.filter(t => t.id !== deleteTable.id));
      toast.success(`Xóa bàn "${deleteTable.tableNumber}" thành công!`);
      setDeleteTable(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Xóa bàn thất bại!');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Danh sách Bàn</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý sơ đồ bàn và trạng thái phục vụ</p>
        </div>
        <div className="flex gap-3 items-center self-start sm:self-auto flex-wrap">
          <button
            onClick={() => handleOpenBulkModal()}
            className="bg-secondary text-white px-4 py-2.5 rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
          >
            <Layers size={18} />
            <span>Tạo nhiều bàn</span>
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} />
            <span>Thêm bàn</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Tìm theo số bàn, ghi chú..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400 shrink-0" />
          <select
            value={selectedBranchId}
            onChange={handleBranchFilterChange}
            className="w-full py-2 px-3 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
          >
            <option value="ALL">Tất cả chi nhánh</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTableTypeId}
            onChange={handleTableTypeFilterChange}
            className="w-full py-2 px-3 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
          >
            <option value="ALL">Tất cả loại bàn</option>
            {tableTypes.map(tt => (
              <option key={tt.id} value={tt.id}>{tt.name} ({tt.capacity} chỗ)</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full py-2 px-3 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="AVAILABLE">Trống</option>
            <option value="OCCUPIED">Có khách</option>
            <option value="DIRTY">Cần dọn</option>
            <option value="MAINTENANCE">Bảo trì</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                  <th className="p-3 font-medium">Bàn</th>
                  <th className="p-3 font-medium">Tầng</th>
                  <th className="p-3 font-medium">Chi nhánh</th>
                  <th className="p-3 font-medium">Loại bàn</th>
                  <th className="p-3 font-medium text-center">Trạng thái</th>
                  <th className="p-3 font-medium text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {tables.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      Không tìm thấy bàn nào phù hợp
                    </td>
                  </tr>
                ) : (
                  tables.map((table) => (
                    <tr key={table.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-sm font-medium text-gray-900">{table.tableNumber}</td>
                      <td className="p-3 text-sm text-gray-600">Tầng {table.floor}</td>
                      <td className="p-3 text-sm text-gray-600">{table.branch?.name || 'N/A'}</td>
                      <td className="p-3 text-sm text-gray-600">{table.tableType?.name || 'N/A'}</td>
                      <td className="p-3 text-sm text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${table.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                          table.status === 'OCCUPIED' ? 'bg-red-100 text-red-800' :
                            table.status === 'DIRTY' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                          {table.status === 'AVAILABLE' ? 'Trống' :
                            table.status === 'OCCUPIED' ? 'Có khách' :
                              table.status === 'DIRTY' ? 'Cần dọn' : 'Bảo trì'}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(table)}
                            className="text-info hover:text-blue-700 font-medium text-xs px-2 py-1 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteClick(table)}
                            className="text-error hover:text-red-700 font-medium text-xs px-2 py-1 bg-red-50 rounded hover:bg-red-100 transition-colors"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination UI */}
          <Pagination
            meta={meta}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedTable ? "Sửa thông tin bàn" : "Thêm bàn mới"}
        maxWidth="max-w-2xl"
      >
        <TableForm
          initialData={selectedTable}
          branches={branches}
          tableTypes={tableTypes}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          selectedBranchId={selectedBranchId !== 'ALL' ? selectedBranchId : ''}
        />
      </Modal>

      {/* Bulk Form Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={handleCloseBulkModal}
        title="Tạo nhiều bàn cùng lúc"
        maxWidth="max-w-3xl"
      >
        <BulkTableForm
          branches={branches}
          tableTypes={tableTypes}
          onSubmit={handleBulkSubmit}
          isLoading={isSubmitting}
          selectedBranchId={selectedBranchId !== 'ALL' ? selectedBranchId : ''}
        />
      </Modal>

      {/* Custom Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteTable}
        onClose={() => setDeleteTable(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa bàn"
        message={`Bạn có chắc chắn muốn xóa bàn "${deleteTable?.tableNumber}" (Tầng ${deleteTable?.floor})?\n\nHành động này sẽ xóa dữ liệu bàn khỏi chi nhánh.`}
        confirmText="Xóa bàn"
        cancelText="Hủy"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Tables;
