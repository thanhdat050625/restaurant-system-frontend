import React, { useState, useEffect } from 'react';
import { menuItemService } from '../../../services/admin/menuItem.service';
import { menuCategoryService } from '../../../services/admin/menuCategory.service';
import { MenuItem } from '../../../types/menuItem.type';
import { MenuCategory } from '../../../types/menuCategory.type';
import { PaginationMeta } from '../../../types/api-response.type';
import Modal from '../../../components/ui/Modal';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import MenuItemForm from './MenuItemForm';
import Pagination from '../../../components/common/Pagination';
import { Search, Plus, Star, Clock, Filter, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const MenuItems: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Pagination & Filters state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm delete state
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [page, limit, search, selectedCategoryId, activeFilter]);

  const fetchCategories = async () => {
    try {
      const res = await menuCategoryService.getAll({ includeInactive: true, limit: 100 });
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setCategories(list);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMenuItems = async (showSpinner = true) => {
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

      if (selectedCategoryId !== 'ALL') {
        params.categoryId = selectedCategoryId;
      }

      if (activeFilter === 'ACTIVE') {
        params.isActive = true;
      } else if (activeFilter === 'INACTIVE') {
        params.isActive = false;
      }

      const res = await menuItemService.getAll(params);
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setItems(list);
      setMeta((res as any)?.meta || null);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Lỗi khi tải danh sách món ăn');
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

  const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoryId(e.target.value);
    setPage(1);
  };

  const handleActiveFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveFilter(e.target.value);
    setPage(1);
  };

  const handleOpenModal = (item?: MenuItem) => {
    setSelectedItem(item || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      if (selectedItem) {
        const res = await menuItemService.update(selectedItem.id, formData);
        const updated = (res as any)?.data || res;
        const matchedCategory = categories.find(c => c.id === (updated.categoryId || selectedItem.categoryId));
        setItems(prev => prev.map(it => it.id === selectedItem.id ? { 
          ...it, 
          ...updated, 
          category: matchedCategory || it.category 
        } : it));
        toast.success('Cập nhật món ăn thành công!');
        handleCloseModal();
      } else {
        await menuItemService.create(formData);
        toast.success('Thêm món ăn mới thành công!');
        handleCloseModal();
        fetchMenuItems(false);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi lưu món ăn!');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (item: MenuItem) => {
    setDeleteItem(item);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    try {
      setIsDeleting(true);
      await menuItemService.delete(deleteItem.id);
      setItems(prev => prev.map(it => it.id === deleteItem.id ? { ...it, isActive: false } : it));
      toast.success(`Đã ẩn món "${deleteItem.name}" thành công!`);
      setDeleteItem(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Ẩn món ăn thất bại!');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async (item: MenuItem) => {
    try {
      await menuItemService.update(item.id, { isActive: true });
      setItems(prev => prev.map(it => it.id === item.id ? { ...it, isActive: true } : it));
      toast.success(`Đã hiển thị lại món "${item.name}" trên thực đơn!`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Khôi phục hiển thị thất bại!');
    }
  };

  const formatVND = (price: number | string | undefined | null) => {
    if (price === undefined || price === null) return '-';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Danh Mục Món Ăn Toàn Chuỗi</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý danh mục món ăn mẫu chung cho toàn bộ chuỗi nhà hàng</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus size={18} />
          <span>Thêm món ăn mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Tìm theo tên hoặc mô tả..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400 shrink-0" />
          <select
            value={selectedCategoryId}
            onChange={handleCategoryFilterChange}
            className="w-full py-2 px-3 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
          >
            <option value="ALL">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activeFilter}
            onChange={handleActiveFilterChange}
            className="w-full py-2 px-3 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang kinh doanh</option>
            <option value="INACTIVE">Đang ẩn</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Đang tải danh sách món ăn...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-100 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="p-3 font-semibold">Món ăn</th>
                  <th className="p-3 font-semibold">Danh mục</th>
                  <th className="p-3 font-semibold text-right">Giá niêm yết</th>
                  <th className="p-3 font-semibold text-center">Thời gian nấu</th>
                  <th className="p-3 font-semibold text-center">Trạng thái</th>
                  <th className="p-3 font-semibold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Không tìm thấy món ăn nào phù hợp
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs shrink-0 font-medium">
                              No img
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                              {item.name}
                              {item.isFeatured && (
                                <span className="inline-flex items-center gap-0.5 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                                  <Star size={12} className="fill-amber-500 text-amber-500" />
                                  Nổi bật
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-xs text-gray-500 truncate max-w-xs">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {item.category?.name || 'Chưa phân loại'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="font-bold text-gray-900">{formatVND(item.price)}</div>
                        {item.originalPrice && (
                          <div className="text-xs text-gray-400 line-through">
                            {formatVND(item.originalPrice)}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {item.preparationTime ? (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                            <Clock size={13} /> {item.preparationTime}p
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                          item.isActive 
                            ? 'text-emerald-800 bg-emerald-100 border border-emerald-200' 
                            : 'text-gray-500 bg-gray-100 border border-gray-200 line-through'
                        }`}>
                          {item.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                          {item.isActive ? 'Đang kinh doanh' : 'Đang ẩn'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="text-info hover:text-blue-700 font-medium text-xs px-2 py-1 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                          >
                            Sửa
                          </button>
                          {item.isActive ? (
                            <button
                              onClick={() => handleDeleteClick(item)}
                              className="text-error hover:text-red-700 font-medium text-xs px-2 py-1 bg-red-50 rounded hover:bg-red-100 transition-colors"
                              title="Ẩn món ăn khỏi thực đơn"
                            >
                              Ẩn
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestore(item)}
                              className="text-green-600 hover:text-green-700 font-medium text-xs px-2 py-1 bg-green-50 rounded hover:bg-green-100 transition-colors"
                              title="Khôi phục hiển thị món ăn"
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedItem ? 'Chỉnh sửa món ăn chuỗi' : 'Thêm món ăn mới toàn chuỗi'}
      >
        <MenuItemForm
          initialData={selectedItem}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Confirm Delete / Hide Modal */}
      <ConfirmModal
        isOpen={!!deleteItem}
        title="Ẩn món ăn"
        message={`Bạn có chắc chắn muốn ẩn món "${deleteItem?.name}" khỏi thực đơn toàn hệ thống không?`}
        confirmLabel="Ẩn món"
        cancelLabel="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteItem(null)}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default MenuItems;
