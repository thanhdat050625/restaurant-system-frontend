import React, { useState, useEffect } from 'react';
import { tableTypeService } from '../../../services/admin/tableTypeService';
import { ITableType } from '../../../types/admin/table-type.type';
import { PaginationMeta } from '../../../types/api-response.type';
import Modal from '../../../components/ui/Modal';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import TableTypeForm, { TableTypeFormData } from './TableTypeForm';
import Pagination from '../../../components/common/Pagination';
import { Search, Filter, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const TableTypes: React.FC = () => {
  const [tableTypes, setTableTypes] = useState<ITableType[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Pagination & Filter state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [capacityFilter, setCapacityFilter] = useState<string>('ALL');

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTableType, setSelectedTableType] = useState<ITableType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm delete state
  const [deleteTableType, setDeleteTableType] = useState<ITableType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTableTypes();
  }, [page, limit, search, capacityFilter]);

  const fetchTableTypes = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const params: any = { page, limit };
      if (search.trim()) params.search = search.trim();
      if (capacityFilter !== 'ALL') params.capacity = Number(capacityFilter);

      const res = await tableTypeService.getTableTypes(params);
      if (Array.isArray(res)) {
        setTableTypes(res);
        setMeta(null);
      } else {
        setTableTypes(res?.data || []);
        setMeta(res?.meta || null);
      }
    } catch (error) {
      console.error('Error fetching table types:', error);
      toast.error('Lỗi khi tải danh sách loại bàn');
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

  const handleCapacityFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCapacityFilter(e.target.value);
    setPage(1);
  };

  const handleOpenModal = (type?: ITableType) => {
    setSelectedTableType(type || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTableType(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (data: TableTypeFormData) => {
    try {
      setIsSubmitting(true);
      if (selectedTableType) {
        const res = await tableTypeService.updateTableType(selectedTableType.id, data);
        const updated = (res as any)?.data || res;
        setTableTypes(prev => prev.map(t => t.id === selectedTableType.id ? { ...t, ...updated } : t));
        toast.success('Cập nhật loại bàn thành công!');
        handleCloseModal();
      } else {
        await tableTypeService.createTableType(data);
        toast.success('Thêm loại bàn thành công!');
        handleCloseModal();
        fetchTableTypes(false);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra!');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (type: ITableType) => {
    setDeleteTableType(type);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTableType) return;
    try {
      setIsDeleting(true);
      await tableTypeService.deleteTableType(deleteTableType.id);
      setTableTypes(prev => prev.filter(t => t.id !== deleteTableType.id));
      toast.success(`Xóa loại bàn "${deleteTableType.name}" thành công!`);
      setDeleteTableType(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Xóa loại bàn thất bại!');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Danh sách Loại Bàn</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý các loại bàn và sức chứa</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus size={18} />
          <span>Thêm loại bàn</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Tìm theo tên loại bàn hoặc mô tả..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400 shrink-0" />
          <select
            value={capacityFilter}
            onChange={handleCapacityFilterChange}
            className="w-full py-2 px-3 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
          >
            <option value="ALL">Tất cả số chỗ ngồi</option>
            <option value="2">Bàn 2 người</option>
            <option value="4">Bàn 4 người</option>
            <option value="6">Bàn 6 người</option>
            <option value="8">Bàn 8 người</option>
            <option value="10">Bàn 10 người</option>
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
                  <th className="p-3 font-medium">Tên loại bàn</th>
                  <th className="p-3 font-medium">Số chỗ ngồi</th>
                  <th className="p-3 font-medium">Mô tả</th>
                  <th className="p-3 font-medium text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {tableTypes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      Không tìm thấy loại bàn nào phù hợp
                    </td>
                  </tr>
                ) : (
                  tableTypes.map((type) => (
                    <tr key={type.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-sm font-medium text-gray-900">{type.name}</td>
                      <td className="p-3 text-sm text-gray-600">{type.capacity} chỗ</td>
                      <td className="p-3 text-sm text-gray-600">{type.description || '-'}</td>
                      <td className="p-3 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenModal(type)}
                            className="text-info hover:text-blue-700 font-medium text-xs px-2 py-1 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                          >
                            Sửa
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(type)}
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
        title={selectedTableType ? "Sửa loại bàn" : "Thêm loại bàn mới"}
      >
        <TableTypeForm 
          initialData={selectedTableType}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Custom Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteTableType}
        onClose={() => setDeleteTableType(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa loại bàn"
        message={`Bạn có chắc chắn muốn xóa loại bàn "${deleteTableType?.name}"?\n\nChỉ có thể xóa loại bàn khi không có bàn nào đang sử dụng loại bàn này.`}
        confirmText="Xóa loại bàn"
        cancelText="Hủy"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default TableTypes;
