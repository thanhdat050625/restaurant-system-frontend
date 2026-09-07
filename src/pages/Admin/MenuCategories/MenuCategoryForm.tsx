import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MenuCategory } from '../../../types/menuCategory.type';

const menuCategorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc'),
  description: z.string().optional(),
  imageUrl: z.string().url('URL ảnh không hợp lệ').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
});

export type MenuCategoryFormData = z.infer<typeof menuCategorySchema>;

interface MenuCategoryFormProps {
  initialData?: MenuCategory | null;
  onSubmit: (data: MenuCategoryFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const MenuCategoryForm: React.FC<MenuCategoryFormProps> = ({ initialData, onSubmit, onCancel, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MenuCategoryFormData>({
    resolver: zodResolver(menuCategorySchema),
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
      isActive: true,
      order: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || '',
        imageUrl: initialData.imageUrl || '',
        isActive: initialData.isActive,
        order: initialData.order,
      });
    } else {
      reset({
        name: '',
        description: '',
        imageUrl: '',
        isActive: true,
        order: 0,
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans">
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Tên danh mục <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name')}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
          placeholder="Nhập tên danh mục (VD: Khai vị, Món nướng...)..."
        />
        {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Mô tả
        </label>
        <textarea
          {...register('description')}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs custom-scrollbar resize-none"
          placeholder="Nhập mô tả tóm tắt..."
          rows={3}
        />
        {errors.description && <p className="mt-1 text-xs text-red-600 font-medium">{errors.description.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Đường dẫn ảnh (Cloudinary URL)
        </label>
        <input
          {...register('imageUrl')}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
          placeholder="https://res.cloudinary.com/..."
        />
        {errors.imageUrl && <p className="mt-1 text-xs text-red-600 font-medium">{errors.imageUrl.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Thứ tự hiển thị
          </label>
          <input
            type="number"
            {...register('order', { valueAsNumber: true })}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
          />
          {errors.order && <p className="mt-1 text-xs text-red-600 font-medium">{errors.order.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Trạng thái
          </label>
          <label className="flex items-center gap-2 mt-2.5 cursor-pointer">
            <input
              type="checkbox"
              {...register('isActive')}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded-md cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700">Hiển thị danh mục này</span>
          </label>
          {errors.isActive && <p className="mt-1 text-xs text-red-600 font-medium">{errors.isActive.message}</p>}
        </div>
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
          <span>{initialData ? 'Lưu thay đổi' : 'Thêm mới'}</span>
        </button>
      </div>
    </form>
  );
};

export default MenuCategoryForm;
