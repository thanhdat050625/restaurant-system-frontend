import React, { useState, useEffect, useMemo } from 'react';
import { menuItemService } from '../../../services/admin/menuItem.service';
import { menuCategoryService } from '../../../services/admin/menuCategory.service';
import { MenuItem } from '../../../types/menuItem.type';
import { MenuCategory } from '../../../types/menuCategory.type';
import Modal from '../../../components/ui/Modal';
import MenuItemForm from './MenuItemForm';
import { Search, Plus, Star, Clock, Filter, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const MenuItems: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await menuCategoryService.getAll(true);
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setCategories(list);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const res = await menuItemService.getAll({ includeInactive: true });
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setItems(list);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Lỗi khi tải danh sách món ăn');
    } finally {
      setLoading(false);
    }
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
        await menuItemService.update(selectedItem.id, formData);
        toast.success('Cập nhật món ăn thành công!');
      } else {
        await menuItemService.create(formData);
        toast.success('Thêm món ăn mới thành công!');
      }
      handleCloseModal();
      fetchMenuItems();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi lưu món ăn!');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await menuItemService.update(item.id, { isAvailable: !item.isAvailable });
      toast.success(item.isAvailable ? 'Đã chuyển sang Hết món' : 'Đã chuyển sang Còn món');
      setItems(prev => prev.map(it => it.id === item.id ? { ...it, isAvailable: !it.isAvailable } : it));
    } catch (error: any) {
      toast.error('Cập nhật trạng thái thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn ẩn món ăn này khỏi thực đơn?')) {
      try {
        await menuItemService.delete(id);
        toast.success('Đã ẩn món ăn thành công!');
        fetchMenuItems();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Ẩn món ăn thất bại!');
      }
    }
  };

  const formatVND = (price: number | string | undefined | null) => {
    if (price === undefined || price === null) return '-';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search by name or description
      const matchSearch =
        search.trim() === '' ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase()));

      // Filter by category
      const matchCategory =
        selectedCategoryId === 'ALL' || item.categoryId === selectedCategoryId;

      // Filter by availability
      const matchAvailability =
        availabilityFilter === 'ALL' ||
        (availabilityFilter === 'AVAILABLE' && item.isAvailable) ||
        (availabilityFilter === 'UNAVAILABLE' && !item.isAvailable);

      return matchSearch && matchCategory && matchAvailability;
    });
  }, [items, search, selectedCategoryId, availabilityFilter]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Quản lý Món Ăn</h2>
          <p className="text-sm text-gray-500 mt-1">Danh sách tất cả món ăn trong thực đơn nhà hàng</p>
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc mô tả..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400 shrink-0" />
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
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

        <div>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="w-full py-2 px-3 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
          >
            <option value="ALL">Tất cả trạng thái phục vụ</option>
            <option value="AVAILABLE">Đang còn món</option>
            <option value="UNAVAILABLE">Đang hết món</option>
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
        <div className="overflow-x-auto border border-gray-100 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
                <th className="p-3 font-semibold">Món ăn</th>
                <th className="p-3 font-semibold">Danh mục</th>
                <th className="p-3 font-semibold text-right">Giá bán</th>
                <th className="p-3 font-semibold text-center">Thời gian</th>
                <th className="p-3 font-semibold text-center">Trạng thái phục vụ</th>
                <th className="p-3 font-semibold text-center">Hiển thị</th>
                <th className="p-3 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Không tìm thấy món ăn nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
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
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          item.isAvailable
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                        title="Click để đổi trạng thái"
                      >
                        {item.isAvailable ? 'Còn món' : 'Hết món'}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        item.isActive ? 'text-green-600' : 'text-gray-400 line-through'
                      }`}>
                        {item.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                        {item.isActive ? 'Hiện' : 'Ẩn'}
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
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-error hover:text-red-700 font-medium text-xs px-2 py-1 bg-red-50 rounded hover:bg-red-100 transition-colors"
                        >
                          Ẩn
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Dialog Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedItem ? 'Sửa thông tin món ăn' : 'Thêm món ăn mới vào thực đơn'}
        maxWidth="max-w-2xl"
      >
        <MenuItemForm
          initialData={selectedItem}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default MenuItems;
