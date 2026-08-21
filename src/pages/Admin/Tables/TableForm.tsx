import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ITable } from '../../../types/admin/table.type';
import { IBranch } from '../../../types/admin/branch.type';
import { ITableType } from '../../../types/admin/table-type.type';

const tableSchema = z.object({
  tableNumber: z.string().min(1, 'Số bàn là bắt buộc'),
  floor: z.number().min(0, 'Tầng phải lớn hơn hoặc bằng 0'),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'DIRTY']),
  note: z.string().optional(),
  branchId: z.string().min(1, 'Vui lòng chọn chi nhánh'),
  tableTypeId: z.string().min(1, 'Vui lòng chọn loại bàn'),
});

export type TableFormData = z.infer<typeof tableSchema>;

interface TableFormProps {
  initialData?: ITable | null;
  branches: IBranch[];
  tableTypes: ITableType[];
  onSubmit: (data: TableFormData) => Promise<void>;
  isLoading?: boolean;
  selectedBranchId?: string;
}

const TableForm: React.FC<TableFormProps> = ({ initialData, branches, tableTypes, onSubmit, isLoading = false, selectedBranchId = '' }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      tableNumber: '',
      floor: 1,
      status: 'AVAILABLE',
      note: '',
      branchId: '',
      tableTypeId: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        tableNumber: initialData.tableNumber,
        floor: initialData.floor,
        status: initialData.status,
        note: initialData.note || '',
        branchId: initialData.branchId,
        tableTypeId: initialData.tableTypeId,
      });
    } else {
      reset({
        tableNumber: '',
        floor: 1,
        status: 'AVAILABLE',
        note: '',
        branchId: selectedBranchId || branches[0]?.id || '',
        tableTypeId: tableTypes[0]?.id || '',
      });
    }
  }, [initialData, branches, tableTypes, selectedBranchId, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số/Tên Bàn *</label>
          <input
            {...register('tableNumber')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
            placeholder="VD: B01, T1-01..."
          />
          {errors.tableNumber && <p className="mt-1 text-sm text-red-600">{errors.tableNumber.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tầng *</label>
          <input
            type="number"
            min="0"
            {...register('floor', { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
          />
          {errors.floor && <p className="mt-1 text-sm text-red-600">{errors.floor.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chi nhánh *</label>
          <select
            {...register('branchId')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
          >
            <option value="">Chọn chi nhánh</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {errors.branchId && <p className="mt-1 text-sm text-red-600">{errors.branchId.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Loại bàn *</label>
          <select
            {...register('tableTypeId')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
          >
            <option value="">Chọn loại bàn</option>
            {tableTypes.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.capacity} chỗ)</option>
            ))}
          </select>
          {errors.tableTypeId && <p className="mt-1 text-sm text-red-600">{errors.tableTypeId.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
        <select
          {...register('status')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
        >
          <option value="AVAILABLE">Bàn trống (Available)</option>
          <option value="OCCUPIED">Đang phục vụ (Occupied)</option>
          <option value="MAINTENANCE">Đang bảo trì (Maintenance)</option>
          <option value="DIRTY">Cần dọn dẹp (Dirty)</option>
        </select>
        {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (Note)</label>
        <textarea
          {...register('note')}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors custom-scrollbar"
          placeholder="Ghi chú thêm..."
        />
        {errors.note && <p className="mt-1 text-sm text-red-600">{errors.note.message}</p>}
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

export default TableForm;
