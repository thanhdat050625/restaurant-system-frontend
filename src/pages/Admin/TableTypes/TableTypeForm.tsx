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
  onCancel?: () => void;
  isLoading?: boolean;
}

const TableTypeForm: React.FC<TableTypeFormProps> = ({ initialData, onSubmit, onCancel, isLoading = false }) => {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans">
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Tên loại bàn <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name')}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
          placeholder="VD: Bàn VIP, Bàn ngoài trời..."
        />
        {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Số chỗ ngồi (Capacity) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="1"
          {...register('capacity', { valueAsNumber: true })}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
        />
        {errors.capacity && <p className="mt-1 text-xs text-red-600 font-medium">{errors.capacity.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Mô tả
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs custom-scrollbar resize-none"
          placeholder="Mô tả thêm về loại bàn này..."
        />
        {errors.description && <p className="mt-1 text-xs text-red-600 font-medium">{errors.description.message}</p>}
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

export default TableTypeForm;
