import React, { useState, useEffect } from 'react';
import { branchService } from '../../../services/admin/branchService';
import { IBranch } from '../../../types/admin/branch.type';
import { PaginationMeta } from '../../../types/api-response.type';
import Modal from '../../../components/ui/Modal';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import BranchForm, { BranchFormData } from './BranchForm';
import Pagination from '../../../components/common/Pagination';
import toast from 'react-hot-toast';

const Branches: React.FC = () => {
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<IBranch | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm delete state
  const [deleteBranch, setDeleteBranch] = useState<IBranch | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, [page, limit]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await branchService.getBranches({ page, limit });
      if (Array.isArray(res)) {
        setBranches(res);
        setMeta(null);
      } else {
        setBranches(res?.data || []);
        setMeta(res?.meta || null);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Lỗi khi tải danh sách chi nhánh');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleOpenModal = (branch?: IBranch) => {
    setSelectedBranch(branch || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedBranch(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (data: BranchFormData) => {
    try {
      setIsSubmitting(true);
      if (selectedBranch) {
        await branchService.updateBranch(selectedBranch.id, data);
        toast.success('Cập nhật chi nhánh thành công!');
      } else {
        await branchService.createBranch(data);
        toast.success('Thêm chi nhánh thành công!');
      }
      handleCloseModal();
      fetchBranches();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra!');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (branch: IBranch) => {
    setDeleteBranch(branch);
  };

  const handleConfirmDelete = async () => {
    if (!deleteBranch) return;
    try {
      setIsDeleting(true);
      await branchService.deleteBranch(deleteBranch.id);
      toast.success(`Đã xóa chi nhánh "${deleteBranch.name}" thành công!`);
      setDeleteBranch(null);
      fetchBranches();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Xóa chi nhánh thất bại!');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Danh sách Chi nhánh</h2>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý các chi nhánh trực thuộc chuỗi nhà hàng</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors text-sm font-medium"
        >
          + Thêm chi nhánh
        </button>
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
                  <th className="p-3 font-medium">Tên chi nhánh</th>
                  <th className="p-3 font-medium">Địa chỉ</th>
                  <th className="p-3 font-medium">Số điện thoại</th>
                  <th className="p-3 font-medium text-center">Trạng thái</th>
                  <th className="p-3 font-medium text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {branches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      Chưa có chi nhánh nào
                    </td>
                  </tr>
                ) : (
                  branches.map((branch) => (
                    <tr key={branch.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-sm font-medium text-gray-900">{branch.name}</td>
                      <td className="p-3 text-sm text-gray-600">{branch.address}</td>
                      <td className="p-3 text-sm text-gray-600">{branch.phone}</td>
                      <td className="p-3 text-sm text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          branch.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {branch.status === 'ACTIVE' ? 'Hoạt động' : 'Đã đóng'}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-center">
                        <button 
                          onClick={() => handleOpenModal(branch)}
                          className="text-info hover:text-blue-700 mr-3"
                        >
                          Sửa
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(branch)}
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
        title={selectedBranch ? "Sửa chi nhánh" : "Thêm chi nhánh mới"}
        maxWidth="max-w-xl"
      >
        <BranchForm 
          initialData={selectedBranch}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Custom Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteBranch}
        onClose={() => setDeleteBranch(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa chi nhánh"
        message={`Bạn có chắc chắn muốn xóa chi nhánh "${deleteBranch?.name}"?\n\nHành động này không thể hoàn tác.`}
        confirmText="Xóa chi nhánh"
        cancelText="Hủy"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Branches;
