import React, { useState, useEffect } from 'react';
import { branchService } from '../../../services/admin/branchService';
import { IBranch } from '../../../types/admin/branch.type';
import { PaginationMeta } from '../../../types/api-response.type';
import Modal from '../../../components/ui/Modal';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import BranchForm, { BranchFormData } from './BranchForm';
import Pagination from '../../../components/common/Pagination';
import { Search, Filter, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const Branches: React.FC = () => {
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Pagination & Filter state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<IBranch | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm delete state
  const [deleteBranch, setDeleteBranch] = useState<IBranch | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, [page, limit, search, statusFilter]);

  const fetchBranches = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const params: any = { page, limit };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await branchService.getBranches(params);
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

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
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
        const res = await branchService.updateBranch(selectedBranch.id, data);
        const updated = (res as any)?.data || res;
        setBranches(prev => prev.map(b => b.id === selectedBranch.id ? { ...b, ...updated } : b));
        toast.success('Cập nhật chi nhánh thành công!');
        handleCloseModal();
      } else {
        await branchService.createBranch(data);
        toast.success('Thêm chi nhánh thành công!');
        handleCloseModal();
        fetchBranches(false);
      }
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
      setBranches(prev => prev.filter(b => b.id !== deleteBranch.id));
      toast.success(`Đã xóa chi nhánh "${deleteBranch.name}" thành công!`);
      setDeleteBranch(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Xóa chi nhánh thất bại!');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Danh sách Chi nhánh</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý các chi nhánh trực thuộc chuỗi nhà hàng</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus size={18} />
          <span>Thêm chi nhánh</span>
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
            placeholder="Tìm theo tên, địa chỉ, số điện thoại..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full py-2 px-3 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
          >
            <option value="ALL">Tất cả trạng thái hoạt động</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="CLOSED">Đã đóng cửa</option>
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
                      Không tìm thấy chi nhánh nào phù hợp
                    </td>
                  </tr>
                ) : (
                  branches.map((branch) => (
                    <tr key={branch.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-sm font-medium text-gray-900">{branch.name}</td>
                      <td className="p-3 text-sm text-gray-600">
                        {branch.streetAddress}
                        {branch.ward?.name ? `, ${branch.ward.name}` : ''}
                        {branch.province?.name ? `, ${branch.province.name}` : ''}
                      </td>
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
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenModal(branch)}
                            className="text-info hover:text-blue-700 font-medium text-xs px-2 py-1 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                          >
                            Sửa
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(branch)}
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
