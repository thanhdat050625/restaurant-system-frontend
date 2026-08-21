import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ITableType } from '../../../types/admin/table-type.type';

const tableTypeSchema = z.object({
  name: z.string().min(1, 'Tên loại bàn là bắt buộc'),
  capacity: z.number().min(1, 'Số chỗ ngồi phải lớn hơn 0'),
  description: z.string().optional(),
});

export type TableTypeFormData = z.infer<typeof tableTypeSchema>;

interface TableTypeFormProps {
  initialData?: ITableType | null;
  onSubmit: (data: TableTypeFormData) => Promise<void>;
  isLoading?: boolean;
}

const TableTypeForm: React.FC<TableTypeFormProps> = ({ initialData, onSubmit, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TableTypeFormData>({
    resolver: zodResolver(tableTypeSchema),
    defaultValues: {
      name: '',
      capacity: 1,
      description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        capacity: initialData.capacity,
        description: initialData.description || '',
      });
    } else {
      reset({
        name: '',
        capacity: 1,
        description: '',
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên loại bàn *</label>
        <input
          {...register('name')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
          placeholder="VD: Bàn VIP, Bàn ngoài trời..."
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Số chỗ ngồi (Capacity) *</label>
        <input
          type="number"
          min="1"
          {...register('capacity', { valueAsNumber: true })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
        />
        {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors custom-scrollbar"
          placeholder="Mô tả thêm về loại bàn này..."
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
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

export default TableTypeForm;
