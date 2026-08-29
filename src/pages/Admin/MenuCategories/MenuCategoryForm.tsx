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
  isLoading?: boolean;
}

const MenuCategoryForm: React.FC<MenuCategoryFormProps> = ({ initialData, onSubmit, isLoading = false }) => {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục *</label>
        <input
          {...register('name')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
          placeholder="Nhập tên danh mục..."
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
        <textarea
          {...register('description')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
          placeholder="Nhập mô tả..."
          rows={3}
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn ảnh (Cloudinary URL)</label>
        <input
          {...register('imageUrl')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
          placeholder="https://res.cloudinary.com/..."
        />
        {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>}
        <p className="text-xs text-gray-500 mt-1">Hỗ trợ tính năng chọn ảnh từ Cloudinary sẽ được cập nhật sau.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự hiển thị</label>
          <input
            type="number"
            {...register('order', { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
          />
          {errors.order && <p className="mt-1 text-sm text-red-600">{errors.order.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              {...register('isActive')}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Hiển thị danh mục này</span>
          </div>
          {errors.isActive && <p className="mt-1 text-sm text-red-600">{errors.isActive.message}</p>}
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3 border-t mt-6 border-gray-100">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {initialData ? 'Cập nhật' : 'Thêm mới'}
        </button>
      </div>
    </form>
  );
};

export default MenuCategoryForm;
