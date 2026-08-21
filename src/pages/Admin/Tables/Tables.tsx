import React, { useState, useEffect } from 'react';
import { tableService } from '../../../services/admin/tableService';
import { branchService } from '../../../services/admin/branchService';
import { tableTypeService } from '../../../services/admin/tableTypeService';
import { ITable } from '../../../types/admin/table.type';
import { IBranch } from '../../../types/admin/branch.type';
import { ITableType } from '../../../types/admin/table-type.type';
import Modal from '../../../components/ui/Modal';
import TableForm, { TableFormData } from './TableForm';
import BulkTableForm, { BulkTableFormData } from './BulkTableForm';
import toast from 'react-hot-toast';

const Tables: React.FC = () => {
  const [tables, setTables] = useState<ITable[]>([]);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [tableTypes, setTableTypes] = useState<ITableType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<ITable | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTablesOnly();
  }, [selectedBranchId]);

  const fetchInitialData = async () => {
    try {
      const [branchesRes, typesRes] = await Promise.all([
        branchService.getBranches(),
        tableTypeService.getTableTypes()
      ]);

      if (branchesRes?.data) setBranches(branchesRes.data);
      if (typesRes?.data) setTableTypes(typesRes.data);

    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Lỗi khi tải dữ liệu');
    }
  };

  const fetchTablesOnly = async () => {
    try {
      setLoading(true);
      let res;
      if (selectedBranchId) {
        res = await tableService.getTablesByBranch(selectedBranchId);
      } else {
        res = await tableService.getTables();
      }
      if (res?.data) {
        setTables(res.data);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
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
        await tableService.updateTable(selectedTable.id, data);
        toast.success('Cập nhật bàn thành công!');
      } else {
        await tableService.createTable(data);
        toast.success('Thêm bàn thành công!');
      }
      handleCloseModal();
      fetchTablesOnly();
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
      fetchTablesOnly();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra!');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bàn này?')) {
      try {
        await tableService.deleteTable(id);
        toast.success('Xóa bàn thành công!');
        fetchTablesOnly();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Xóa bàn thất bại!');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Danh sách Bàn</h2>
        <div className="flex gap-4 items-center">
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none text-sm bg-white min-w-[200px]"
          >
            <option value="">Tất cả chi nhánh</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <button
            onClick={() => handleOpenBulkModal()}
            className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors text-sm font-medium whitespace-nowrap"
          >
            + Tạo nhiều bàn
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors text-sm font-medium whitespace-nowrap"
          >
            + Thêm bàn
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
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
                    Chưa có bàn nào
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
                      <button
                        onClick={() => handleOpenModal(table)}
                        className="text-info hover:text-blue-700 mr-3"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(table.id)}
                        className="text-error hover:text-red-700"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
          selectedBranchId={selectedBranchId}
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
          selectedBranchId={selectedBranchId}
        />
      </Modal>
    </div>
  );
};

export default Tables;
