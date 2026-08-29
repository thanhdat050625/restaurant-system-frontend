import React, { useState, useEffect } from 'react';
import { menuCategoryService } from '../../../services/admin/menuCategory.service';
import { MenuCategory } from '../../../types/menuCategory.type';
import Modal from '../../../components/ui/Modal';
import MenuCategoryForm, { MenuCategoryFormData } from './MenuCategoryForm';
import toast from 'react-hot-toast';

const MenuCategories: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await menuCategoryService.getAll(true); // Include inactive to see all in admin
      if (Array.isArray(res)) {
        setCategories(res);
      } else if ((res as any)?.data) {
        setCategories((res as any).data);
      } else {
        setCategories(res as unknown as MenuCategory[]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
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
        await menuCategoryService.update(selectedCategory.id, data);
        toast.success('Cập nhật danh mục thành công!');
      } else {
        await menuCategoryService.create(data);
        toast.success('Thêm danh mục thành công!');
      }
      handleCloseModal();
      fetchCategories();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra!');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn ẩn danh mục này? Các món ăn trong danh mục sẽ không bị xóa.')) {
      try {
        await menuCategoryService.delete(id);
        toast.success('Đã ẩn danh mục thành công!');
        fetchCategories();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Ẩn danh mục thất bại!');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Danh mục món ăn</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors text-sm font-medium"
        >
          + Thêm danh mục
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
                    Chưa có danh mục nào
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
                      <button 
                        onClick={() => handleOpenModal(category)}
                        className="text-info hover:text-blue-700 mr-3"
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id)}
                        className="text-error hover:text-red-700"
                      >
                        Ẩn
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
        title={selectedCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
        maxWidth="max-w-xl"
      >
        <MenuCategoryForm 
          initialData={selectedCategory}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default MenuCategories;
