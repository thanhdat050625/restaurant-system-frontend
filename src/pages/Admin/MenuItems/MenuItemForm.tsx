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
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type MenuItemFormData = z.infer<typeof menuItemSchema>;

interface MenuItemFormProps {
  initialData?: MenuItem | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ initialData, onSubmit, onCancel, isLoading = false }) => {
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
      isFeatured: false,
      isActive: true,
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await menuCategoryService.getAll(false);
      const list = Array.isArray(res) ? res : (Array.isArray((res as any)?.data) ? (res as any).data : []);
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
        price: Number(initialData.price),
        originalPrice: initialData.originalPrice ? Number(initialData.originalPrice) : null,
        description: initialData.description ? initialData.description : '',
        imageUrl: initialData.imageUrl ? initialData.imageUrl : '',
        preparationTime: initialData.preparationTime !== undefined && initialData.preparationTime !== null ? initialData.preparationTime : 15,
        isFeatured: initialData.isFeatured,
        isActive: initialData.isActive,
      });
    } else {
      reset({
        name: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        price: 0,
        originalPrice: null,
        description: '',
        imageUrl: '',
        preparationTime: 15,
        isFeatured: false,
        isActive: true,
      });
    }
  }, [initialData, categories, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Tên món ăn <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
            placeholder="Ví dụ: Bò Wagyu Nướng..."
          />
          {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <select
            {...register('categoryId')}
            disabled={loadingCategories}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-xs text-red-600 font-medium">{errors.categoryId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Giá bán (VND) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="1000"
            {...register('price', { valueAsNumber: true })}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
            placeholder="65000"
          />
          {errors.price && <p className="mt-1 text-xs text-red-600 font-medium">{errors.price.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Giá gốc (nếu có giảm)
          </label>
          <input
            type="number"
            step="1000"
            {...register('originalPrice', { 
              setValueAs: (v) => (v === '' || isNaN(v) ? null : Number(v)) 
            })}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
            placeholder="85000"
          />
          {errors.originalPrice && <p className="mt-1 text-xs text-red-600 font-medium">{errors.originalPrice.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Thời gian chuẩn bị (phút)
          </label>
          <input
            type="number"
            {...register('preparationTime', { 
              setValueAs: (v) => (v === '' || isNaN(v) ? null : Number(v)) 
            })}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
            placeholder="15"
          />
          {errors.preparationTime && <p className="mt-1 text-xs text-red-600 font-medium">{errors.preparationTime.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Đường dẫn ảnh (Cloudinary URL)
        </label>
        <input
          {...register('imageUrl', {
            setValueAs: (v) => (v === '' ? null : v)
          })}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
          placeholder="https://res.cloudinary.com/..."
        />
        {errors.imageUrl && <p className="mt-1 text-xs text-red-600 font-medium">{errors.imageUrl.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Mô tả món ăn
        </label>
        <textarea
          {...register('description', {
            setValueAs: (v) => (v === '' ? null : v)
          })}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs custom-scrollbar resize-none"
          placeholder="Mô tả thành phần, hương vị đặc trưng..."
          rows={3}
        />
        {errors.description && <p className="mt-1 text-xs text-red-600 font-medium">{errors.description.message}</p>}
      </div>

      <div className="flex flex-wrap gap-6 pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('isFeatured')}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded-md cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-700">Món nổi bật / Bán chạy (Best Seller)</span>
        </label>
      </div>

      <div className="pt-4 flex items-center justify-end gap-3 border-t mt-6 border-gray-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          <span>{initialData ? 'Cập nhật món ăn' : 'Thêm món ăn mới'}</span>
        </button>
      </div>
    </form>
  );
};

export default MenuItemForm;
