import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MenuItem } from '../../../types/menuItem.type';
import { MenuCategory } from '../../../types/menuCategory.type';
import { menuCategoryService } from '../../../services/admin/menuCategory.service';
import toast from 'react-hot-toast';

const menuItemSchema = z.object({
  name: z.string().min(1, 'Tên món ăn là bắt buộc'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  price: z.number().min(0, 'Giá bán phải lớn hơn hoặc bằng 0'),
  originalPrice: z.number().min(0, 'Giá gốc phải lớn hơn hoặc bằng 0').optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url('URL ảnh không hợp lệ').optional().or(z.literal('')).nullable(),
  preparationTime: z.number().int().min(0, 'Thời gian chế biến không hợp lệ').optional().nullable(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export type MenuItemFormData = z.infer<typeof menuItemSchema>;

interface MenuItemFormProps {
  initialData?: MenuItem | null;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ initialData, onSubmit, isLoading = false }) => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      categoryId: '',
      price: 0,
      originalPrice: null,
      description: '',
      imageUrl: '',
      preparationTime: 15,
      isAvailable: true,
      isFeatured: false,
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await menuCategoryService.getAll(false);
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setCategories(list);
    } catch (error) {
      console.error('Error fetching categories for dropdown:', error);
      toast.error('Lỗi khi tải danh mục món ăn');
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        categoryId: initialData.categoryId,
        price: Number(initialData.price) || 0,
        originalPrice: initialData.originalPrice ? Number(initialData.originalPrice) : null,
        description: initialData.description || '',
        imageUrl: initialData.imageUrl || '',
        preparationTime: initialData.preparationTime ?? 15,
        isAvailable: initialData.isAvailable,
        isFeatured: initialData.isFeatured,
      });
    } else {
      reset({
        name: '',
        categoryId: categories[0]?.id || '',
        price: 0,
        originalPrice: null,
        description: '',
        imageUrl: '',
        preparationTime: 15,
        isAvailable: true,
        isFeatured: false,
      });
    }
  }, [initialData, categories, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên món ăn *</label>
          <input
            {...register('name')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
            placeholder="Ví dụ: Bò Wagyu Nướng..."
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
          <select
            {...register('categoryId')}
            disabled={loadingCategories}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VND) *</label>
          <input
            type="number"
            step="1000"
            {...register('price', { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
            placeholder="65000"
          />
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc (nếu có giảm giá)</label>
          <input
            type="number"
            step="1000"
            {...register('originalPrice', { 
              setValueAs: (v) => (v === '' || isNaN(v) ? null : Number(v)) 
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
            placeholder="85000"
          />
          {errors.originalPrice && <p className="mt-1 text-sm text-red-600">{errors.originalPrice.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian chuẩn bị (phút)</label>
          <input
            type="number"
            {...register('preparationTime', { 
              setValueAs: (v) => (v === '' || isNaN(v) ? null : Number(v)) 
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
            placeholder="15"
          />
          {errors.preparationTime && <p className="mt-1 text-sm text-red-600">{errors.preparationTime.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn ảnh (Cloudinary URL)</label>
        <input
          {...register('imageUrl', {
            setValueAs: (v) => (v === '' ? null : v)
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
          placeholder="https://res.cloudinary.com/..."
        />
        {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả món ăn</label>
        <textarea
          {...register('description', {
            setValueAs: (v) => (v === '' ? null : v)
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
          placeholder="Mô tả thành phần, hương vị đặc trưng..."
          rows={3}
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div className="flex flex-wrap gap-6 pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('isAvailable')}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-700">Đang còn món (Phục vụ ngay)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('isFeatured')}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-700">Món nổi bật / Bán chạy (Best Seller)</span>
        </label>
      </div>

      <div className="pt-4 flex justify-end gap-3 border-t mt-6 border-gray-100">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {initialData ? 'Cập nhật món ăn' : 'Thêm món ăn mới'}
        </button>
      </div>
    </form>
  );
};

export default MenuItemForm;
