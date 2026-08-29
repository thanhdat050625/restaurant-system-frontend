import React, { useState, useEffect } from 'react';
import { menuCategoryService } from '../../../services/admin/menuCategory.service';
import { MenuCategory } from '../../../types/menuCategory.type';
import { PaginationMeta } from '../../../types/api-response.type';
import Modal from '../../../components/ui/Modal';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import MenuCategoryForm, { MenuCategoryFormData } from './MenuCategoryForm';
import Pagination from '../../../components/common/Pagination';
import { Search, Filter, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const MenuCategories: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Pagination & Filter state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm delete state
  const [deleteCategory, setDeleteCategory] = useState<MenuCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [page, limit, search, activeFilter]);

  const fetchCategories = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const params: any = {
        page,
        limit,
        includeInactive: true,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (activeFilter === 'ACTIVE') {
        params.isActive = true;
      } else if (activeFilter === 'INACTIVE') {
        params.isActive = false;
      }

      const res = await menuCategoryService.getAll(params);

      if (Array.isArray(res)) {
        setCategories(res);
        setMeta(null);
      } else {
        setCategories(res.data || []);
        setMeta(res.meta || null);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Lỗi khi tải danh mục');
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

  const handleActiveFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveFilter(e.target.value);
    setPage(1);
  };

  const handleOpenModal = (category?: MenuCategory) => {
    setSelectedCategory(category || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (data: MenuCategoryFormData) => {
    try {
      setIsSubmitting(true);
      if (selectedCategory) {
        const res = await menuCategoryService.update(selectedCategory.id, data);
        const updated = (res as any)?.data || res;
        setCategories(prev => prev.map(c => c.id === selectedCategory.id ? { ...c, ...updated } : c));
        toast.success('Cập nhật danh mục thành công!');
        handleCloseModal();
      } else {
        await menuCategoryService.create(data);
        toast.success('Thêm danh mục thành công!');
        handleCloseModal();
        fetchCategories(false);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra!');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (category: MenuCategory) => {
    setDeleteCategory(category);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCategory) return;
    try {
      setIsDeleting(true);
      await menuCategoryService.delete(deleteCategory.id);
      setCategories(prev => prev.map(c => c.id === deleteCategory.id ? { ...c, isActive: false } : c));
      toast.success(`Đã ẩn danh mục "${deleteCategory.name}" thành công!`);
      setDeleteCategory(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Ẩn danh mục thất bại!');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async (category: MenuCategory) => {
    try {
      await menuCategoryService.update(category.id, { isActive: true });
      setCategories(prev => prev.map(c => c.id === category.id ? { ...c, isActive: true } : c));
      toast.success(`Đã hiển thị lại danh mục "${category.name}"!`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Khôi phục hiển thị thất bại!');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Danh mục món ăn</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý các nhóm danh mục món ăn trong thực đơn</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus size={18} />
          <span>Thêm danh mục</span>
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
            placeholder="Tìm theo tên danh mục..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400 shrink-0" />
          <select
            value={activeFilter}
            onChange={handleActiveFilterChange}
            className="w-full py-2 px-3 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
          >
            <option value="ALL">Tất cả trạng thái hiển thị</option>
            <option value="ACTIVE">Đang hiển thị</option>
            <option value="INACTIVE">Đang ẩn</option>
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
                  <th className="p-3 font-medium">Ảnh</th>
                  <th className="p-3 font-medium">Tên danh mục</th>
                  <th className="p-3 font-medium text-center">Thứ tự hiển thị</th>
                  <th className="p-3 font-medium text-center">Trạng thái</th>
                  <th className="p-3 font-medium text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      Không tìm thấy danh mục nào phù hợp
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        {category.imageUrl ? (
                          <img src={category.imageUrl} alt={category.name} className="w-12 h-12 rounded object-cover border" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                            No img
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-sm font-medium text-gray-900">{category.name}</td>
                      <td className="p-3 text-sm text-center">{category.order}</td>
                      <td className="p-3 text-sm text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          category.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {category.isActive ? 'Hiển thị' : 'Đang ẩn'}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenModal(category)}
                            className="text-info hover:text-blue-700 font-medium text-xs px-2 py-1 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                          >
                            Sửa
                          </button>
                          {category.isActive ? (
                            <button 
                              onClick={() => handleDeleteClick(category)}
                              className="text-error hover:text-red-700 font-medium text-xs px-2 py-1 bg-red-50 rounded hover:bg-red-100 transition-colors"
                              title="Ẩn danh mục khỏi thực đơn"
                            >
                              Ẩn
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleRestore(category)}
                              className="text-green-600 hover:text-green-700 font-medium text-xs px-2 py-1 bg-green-50 rounded hover:bg-green-100 transition-colors"
                              title="Khôi phục hiển thị danh mục"
                            >
                              Hiện lại
                            </button>
                          )}
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
        title={selectedCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
        maxWidth="max-w-xl"
      >
        <MenuCategoryForm 
          initialData={selectedCategory}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Custom Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteCategory}
        onClose={() => setDeleteCategory(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận ẩn danh mục"
        message={`Bạn có chắc chắn muốn ẩn danh mục "${deleteCategory?.name}"?\n\nCác món ăn trong danh mục này sẽ không bị xóa nhưng danh mục sẽ không hiển thị trên thực đơn của khách hàng.`}
        confirmText="Ẩn danh mục"
        cancelText="Hủy"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default MenuCategories;
