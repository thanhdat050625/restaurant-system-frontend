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
  onCancel?: () => void;
  isLoading?: boolean;
  selectedBranchId?: string;
}

const TableForm: React.FC<TableFormProps> = ({
  initialData,
  branches,
  tableTypes,
  onSubmit,
  onCancel,
  isLoading = false,
  selectedBranchId = '',
}) => {
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
        note: initialData.note ? initialData.note : '',
        branchId: initialData.branchId,
        tableTypeId: initialData.tableTypeId,
      });
    } else {
      reset({
        tableNumber: '',
        floor: 1,
        status: 'AVAILABLE',
        note: '',
        branchId: selectedBranchId ? selectedBranchId : (branches.length > 0 ? branches[0].id : ''),
        tableTypeId: tableTypes.length > 0 ? tableTypes[0].id : '',
      });
    }
  }, [initialData, branches, tableTypes, selectedBranchId, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Số/Tên Bàn <span className="text-red-500">*</span>
          </label>
          <input
            {...register('tableNumber')}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
            placeholder="VD: B01, T1-01..."
          />
          {errors.tableNumber && <p className="mt-1 text-xs text-red-600 font-medium">{errors.tableNumber.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Tầng <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            {...register('floor', { valueAsNumber: true })}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
          />
          {errors.floor && <p className="mt-1 text-xs text-red-600 font-medium">{errors.floor.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Chi nhánh <span className="text-red-500">*</span>
          </label>
          <select
            {...register('branchId')}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
          >
            <option value="">Chọn chi nhánh</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {errors.branchId && <p className="mt-1 text-xs text-red-600 font-medium">{errors.branchId.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Loại bàn <span className="text-red-500">*</span>
          </label>
          <select
            {...register('tableTypeId')}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
          >
            <option value="">Chọn loại bàn</option>
            {tableTypes.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.capacity} chỗ)</option>
            ))}
          </select>
          {errors.tableTypeId && <p className="mt-1 text-xs text-red-600 font-medium">{errors.tableTypeId.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Trạng thái
        </label>
        <select
          {...register('status')}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
        >
          <option value="AVAILABLE">Bàn trống (Available)</option>
          <option value="OCCUPIED">Đang phục vụ (Occupied)</option>
          <option value="MAINTENANCE">Đang bảo trì (Maintenance)</option>
          <option value="DIRTY">Cần dọn dẹp (Dirty)</option>
        </select>
        {errors.status && <p className="mt-1 text-xs text-red-600 font-medium">{errors.status.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Ghi chú (Note)
        </label>
        <textarea
          {...register('note')}
          rows={2}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs custom-scrollbar resize-none"
          placeholder="Ghi chú thêm về bàn này..."
        />
        {errors.note && <p className="mt-1 text-xs text-red-600 font-medium">{errors.note.message}</p>}
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

export default TableForm;
