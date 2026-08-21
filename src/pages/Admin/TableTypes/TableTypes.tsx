import React, { useState, useEffect } from 'react';
import { tableTypeService } from '../../../services/admin/tableTypeService';
import { ITableType } from '../../../types/admin/table-type.type';
import Modal from '../../../components/ui/Modal';
import TableTypeForm, { TableTypeFormData } from './TableTypeForm';
import toast from 'react-hot-toast';

const TableTypes: React.FC = () => {
  const [tableTypes, setTableTypes] = useState<ITableType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTableType, setSelectedTableType] = useState<ITableType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTableTypes();
  }, []);

  const fetchTableTypes = async () => {
    try {
      setLoading(true);
      const res = await tableTypeService.getTableTypes();
      if (res?.data) {
        setTableTypes(res.data);
      }
    } catch (error) {
      console.error('Error fetching table types:', error);
      toast.error('Lỗi khi tải danh sách loại bàn');
    } finally {
      setLoading(false);
    }
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
        await tableTypeService.updateTableType(selectedTableType.id, data);
        toast.success('Cập nhật loại bàn thành công!');
      } else {
        await tableTypeService.createTableType(data);
        toast.success('Thêm loại bàn thành công!');
      }
      handleCloseModal();
      fetchTableTypes();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra!');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa loại bàn này?')) {
      try {
        await tableTypeService.deleteTableType(id);
        toast.success('Xóa loại bàn thành công!');
        fetchTableTypes();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Xóa loại bàn thất bại!');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Danh sách Loại Bàn</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors text-sm font-medium"
        >
          + Thêm loại bàn
        </button>
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
                    Chưa có loại bàn nào
                  </td>
                </tr>
              ) : (
                tableTypes.map((type) => (
                  <tr key={type.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-sm font-medium text-gray-900">{type.name}</td>
                    <td className="p-3 text-sm text-gray-600">{type.capacity}</td>
                    <td className="p-3 text-sm text-gray-600">{type.description}</td>
                    <td className="p-3 text-sm text-center">
                      <button 
                        onClick={() => handleOpenModal(type)}
                        className="text-info hover:text-blue-700 mr-3"
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => handleDelete(type.id)}
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
        title={selectedTableType ? "Sửa loại bàn" : "Thêm loại bàn mới"}
      >
        <TableTypeForm 
          initialData={selectedTableType}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default TableTypes;
