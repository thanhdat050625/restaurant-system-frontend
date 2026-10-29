import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from '../../../components/ui/Select';
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
  onCancel?: () => void;
  isLoading?: boolean;
  selectedBranchId?: string;
}

const BulkTableForm: React.FC<BulkTableFormProps> = ({
  branches,
  tableTypes,
  onSubmit,
  onCancel,
  isLoading = false,
  selectedBranchId = '',
}) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BulkTableFormData>({
    resolver: zodResolver(bulkTableSchema),
    defaultValues: {
      branchId: selectedBranchId ? selectedBranchId : (branches.length > 0 ? branches[0].id : ''),
      tableTypeId: tableTypes.length > 0 ? tableTypes[0].id : '',
      quantity: 1,
      startNumber: 1,
      prefix: 'T1',
      floor: 1,
      status: 'AVAILABLE',
      note: '',
    },
  });

  useEffect(() => {
    reset({
      branchId: selectedBranchId ? selectedBranchId : (branches.length > 0 ? branches[0].id : ''),
      tableTypeId: tableTypes.length > 0 ? tableTypes[0].id : '',
      quantity: 1,
      startNumber: 1,
      prefix: 'T1',
      floor: 1,
      status: 'AVAILABLE',
      note: '',
    });
  }, [branches, tableTypes, selectedBranchId, reset]);

  const selectedTableTypeId = watch('tableTypeId');
  const selectedFloor = watch('floor');
  const watchedPrefix = watch('prefix') || 'T1';
  const watchedStartNumber = watch('startNumber') || 1;
  const watchedQuantity = watch('quantity') || 5;

  useEffect(() => {
    let base = 'T';
    if (selectedTableTypeId) {
      const selectedType = tableTypes.find(t => t.id === selectedTableTypeId);
      if (selectedType) {
        const name = selectedType.name.toUpperCase();
        if (name.includes('VIP')) {
          base = 'VIP';
        }
      }
    }
    const floorNum = Number(selectedFloor);
    const prefixVal = !isNaN(floorNum) ? `${base}${floorNum}` : `${base}1`;
    setValue('prefix', prefixVal, { shouldValidate: true });
  }, [selectedTableTypeId, selectedFloor, tableTypes, setValue]);

  // Sinh danh sách bàn mẫu để preview trực quan
  const sampleCount = Math.min(Math.max(watchedQuantity, 1), 4);
  const sampleTables = Array.from({ length: sampleCount }).map((_, i) => {
    const num = (watchedStartNumber || 1) + i;
    const formatted = num < 10 ? `0${num}` : `${num}`;
    return `${watchedPrefix}${formatted}`;
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Chi nhánh <span className="text-red-500">*</span>
          </label>
          <Controller
            name="branchId"
            control={control}
            render={({ field }) => (
              <Select
                tone="light"
                value={field.value ?? ''}
                onBlur={field.onBlur}
                onChange={field.onChange}
                invalid={!!errors.branchId}
                placeholder="Chọn chi nhánh"
                options={branches.map((b) => ({ value: b.id, label: b.name }))}
              />
            )}
          />
          {errors.branchId && <p className="mt-1 text-xs text-red-600 font-medium">{errors.branchId.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Loại bàn <span className="text-red-500">*</span>
          </label>
          <Controller
            name="tableTypeId"
            control={control}
            render={({ field }) => (
              <Select
                tone="light"
                value={field.value ?? ''}
                onBlur={field.onBlur}
                onChange={field.onChange}
                invalid={!!errors.tableTypeId}
                placeholder="Chọn loại bàn"
                options={tableTypes.map((t) => ({ value: t.id, label: t.name, description: `${t.capacity} chỗ ngồi` }))}
              />
            )}
          />
          {errors.tableTypeId && <p className="mt-1 text-xs text-red-600 font-medium">{errors.tableTypeId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Tiền tố <span className="text-red-500">*</span>
          </label>
          <input
            {...register('prefix')}
            readOnly
            tabIndex={-1}
            className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-300 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-hidden transition-all shadow-2xs"
            placeholder="VD: T, B, VIP"
          />
          {errors.prefix && <p className="mt-1 text-xs text-red-600 font-medium">{errors.prefix.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Số lượng <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            {...register('quantity', { valueAsNumber: true })}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
          />
          {errors.quantity && <p className="mt-1 text-xs text-red-600 font-medium">{errors.quantity.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Số bắt đầu <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            {...register('startNumber', { valueAsNumber: true })}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
          />
          {errors.startNumber && <p className="mt-1 text-xs text-red-600 font-medium">{errors.startNumber.message}</p>}
        </div>
      </div>
      
      <p className="text-xs text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-dark-surface/60 p-2.5 rounded-lg border border-gray-200 dark:border-dark-border">
        💡 Ví dụ: Tầng {selectedFloor ?? 1}, Tiền tố "{watchedPrefix}", Bắt đầu "{watchedStartNumber}" sẽ tự sinh các bàn: {sampleTables.join(', ')}...
      </p>

      <div className="grid grid-cols-2 gap-4">
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
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Trạng thái
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                tone="light"
                value={field.value ?? ''}
                onBlur={field.onBlur}
                onChange={field.onChange}
                options={[
                  { value: 'AVAILABLE', label: 'Bàn trống', description: 'Available' },
                  { value: 'OCCUPIED', label: 'Đang phục vụ', description: 'Occupied' },
                  { value: 'MAINTENANCE', label: 'Đang bảo trì', description: 'Maintenance' },
                  { value: 'DIRTY', label: 'Cần dọn dẹp', description: 'Dirty' },
                ]}
              />
            )}
          />
          {errors.status && <p className="mt-1 text-xs text-red-600 font-medium">{errors.status.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Ghi chú chung (Note)
        </label>
        <textarea
          {...register('note')}
          rows={2}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs custom-scrollbar resize-none"
          placeholder="Ghi chú thêm cho nhóm bàn này..."
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
          <span>Tạo hàng loạt</span>
        </button>
      </div>
    </form>
  );
};

export default BulkTableForm;
