import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { IBranch } from '../../../types/admin/branch.type';
import { ITableType } from '../../../types/admin/table-type.type';

const bulkTableSchema = z.object({
  branchId: z.string().min(1, 'Vui lòng chọn chi nhánh'),
  tableTypeId: z.string().min(1, 'Vui lòng chọn loại bàn'),
  quantity: z.number().min(1, 'Số lượng phải lớn hơn hoặc bằng 1').max(100, 'Không tạo quá 100 bàn cùng lúc'),
  startNumber: z.number().min(1, 'Số bắt đầu phải lớn hơn hoặc bằng 1'),
  prefix: z.string().min(1, 'Tiền tố là bắt buộc (VD: T, B, VIP)'),
  floor: z.number().min(0, 'Tầng phải lớn hơn hoặc bằng 0'),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'DIRTY']),
  note: z.string().optional(),
});

export type BulkTableFormData = z.infer<typeof bulkTableSchema>;

interface BulkTableFormProps {
  branches: IBranch[];
  tableTypes: ITableType[];
  onSubmit: (data: BulkTableFormData) => Promise<void>;
  isLoading?: boolean;
  selectedBranchId?: string;
}

const BulkTableForm: React.FC<BulkTableFormProps> = ({ branches, tableTypes, onSubmit, isLoading = false, selectedBranchId = '' }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BulkTableFormData>({
    resolver: zodResolver(bulkTableSchema),
    defaultValues: {
      branchId: selectedBranchId || branches[0]?.id || '',
      tableTypeId: tableTypes[0]?.id || '',
      quantity: 1,
      startNumber: 1,
      prefix: 'T',
      floor: 1,
      status: 'AVAILABLE',
      note: '',
    },
  });

  useEffect(() => {
    reset({
      branchId: selectedBranchId || branches[0]?.id || '',
      tableTypeId: tableTypes[0]?.id || '',
      quantity: 1,
      startNumber: 1,
      prefix: 'T',
      floor: 1,
      status: 'AVAILABLE',
      note: '',
    });
  }, [branches, tableTypes, selectedBranchId, reset]);

  const selectedTableTypeId = watch('tableTypeId');

  useEffect(() => {
    if (selectedTableTypeId) {
      const selectedType = tableTypes.find(t => t.id === selectedTableTypeId);
      if (selectedType) {
        const name = selectedType.name.toUpperCase();
        if (name.includes('VIP')) {
          setValue('prefix', 'VIP');
        } else {
          setValue('prefix', 'T');
        }
      }
    }
  }, [selectedTableTypeId, tableTypes, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tiền tố *</label>
          <input
            {...register('prefix')}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed outline-none transition-colors"
            placeholder="VD: T, B, VIP"
          />
          {errors.prefix && <p className="mt-1 text-sm text-red-600">{errors.prefix.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng *</label>
          <input
            type="number"
            min="1"
            {...register('quantity', { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
          />
          {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số bắt đầu *</label>
          <input
            type="number"
            min="1"
            {...register('startNumber', { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
          />
          {errors.startNumber && <p className="mt-1 text-sm text-red-600">{errors.startNumber.message}</p>}
        </div>
      </div>
      
      <p className="text-xs text-gray-500 italic">
        VD: Tiền tố "T", Số lượng "5", Bắt đầu "1" sẽ tạo ra 5 bàn: T01, T02, T03, T04, T05.
      </p>

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú chung (Note)</label>
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
          Tạo hàng loạt
        </button>
      </div>
    </form>
  );
};

export default BulkTableForm;
