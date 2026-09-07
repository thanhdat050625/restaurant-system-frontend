import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { IBranch, IProvince, IWard } from '../../../types/admin/branch.type';
import { branchService } from '../../../services/admin/branchService';

const branchSchema = z.object({
  name: z.string().min(1, 'Tên chi nhánh là bắt buộc'),
  address: z.object({
    provinceCode: z.string().min(1, 'Tỉnh/Thành là bắt buộc'),
    wardCode: z.string().min(1, 'Phường/Xã là bắt buộc'),
    detail: z.string().min(1, 'Địa chỉ chi tiết là bắt buộc'),
  }),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  latitude: z.number().min(-90, 'Vĩ độ phải từ -90 đến 90').max(90, 'Vĩ độ phải từ -90 đến 90'),
  longitude: z.number().min(-180, 'Kinh độ phải từ -180 đến 180').max(180, 'Kinh độ phải từ -180 đến 180'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'CLOSED']),
});

export type BranchFormData = z.infer<typeof branchSchema>;

interface BranchFormProps {
  initialData?: IBranch | null;
  onSubmit: (data: BranchFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const BranchForm: React.FC<BranchFormProps> = ({ initialData, onSubmit, onCancel, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: '',
      address: {
        provinceCode: '',
        wardCode: '',
        detail: '',
      },
      phone: '',
      latitude: 0,
      longitude: 0,
      status: 'ACTIVE',
    },
  });

  const [provinces, setProvinces] = React.useState<IProvince[]>([]);
  const [wards, setWards] = React.useState<IWard[]>([]);
  const selectedProvinceCode = watch('address.provinceCode');

  useEffect(() => {
    branchService.getProvinces().then(res => {
      const data = (res as any)?.data !== undefined ? (res as any).data : res;
      setProvinces(Array.isArray(data) ? data : []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedProvinceCode) {
      branchService.getWardsByProvince(selectedProvinceCode).then(res => {
        const data = (res as any)?.data !== undefined ? (res as any).data : res;
        setWards(Array.isArray(data) ? data : []);
      }).catch(console.error);
    } else {
      setWards([]);
    }
  }, [selectedProvinceCode]);

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        address: {
          provinceCode: initialData.provinceCode ? initialData.provinceCode : '',
          wardCode: initialData.wardCode ? initialData.wardCode : '',
          detail: initialData.streetAddress ? initialData.streetAddress : '',
        },
        phone: initialData.phone,
        latitude: initialData.latitude,
        longitude: initialData.longitude,
        status: initialData.status,
      });
    } else {
      reset({
        name: '',
        address: {
          provinceCode: '',
          wardCode: '',
          detail: '',
        },
        phone: '',
        latitude: 0,
        longitude: 0,
        status: 'ACTIVE',
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans">
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Tên chi nhánh <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name')}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
          placeholder="Nhập tên chi nhánh..."
        />
        {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Tỉnh/Thành phố <span className="text-red-500">*</span>
          </label>
          <select
            {...register('address.provinceCode')}
            onChange={(e) => {
              register('address.provinceCode').onChange(e);
              setValue('address.wardCode', '');
            }}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
          >
            <option value="">Chọn Tỉnh/Thành phố</option>
            {provinces.map(p => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
          {errors.address?.provinceCode && <p className="mt-1 text-xs text-red-600 font-medium">{errors.address.provinceCode.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Phường/Xã <span className="text-red-500">*</span>
          </label>
          <select
            {...register('address.wardCode')}
            disabled={!selectedProvinceCode}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">Chọn Phường/Xã</option>
            {wards.map(w => (
              <option key={w.code} value={w.code}>{w.name}</option>
            ))}
          </select>
          {errors.address?.wardCode && <p className="mt-1 text-xs text-red-600 font-medium">{errors.address.wardCode.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Địa chỉ chi tiết (Số nhà, đường) <span className="text-red-500">*</span>
        </label>
        <input
          {...register('address.detail')}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
          placeholder="Nhập địa chỉ chi tiết..."
        />
        {errors.address?.detail && <p className="mt-1 text-xs text-red-600 font-medium">{errors.address.detail.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <input
          {...register('phone')}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
          placeholder="Nhập số điện thoại liên hệ..."
        />
        {errors.phone && <p className="mt-1 text-xs text-red-600 font-medium">{errors.phone.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Vĩ độ (Latitude)
          </label>
          <input
            type="number"
            step="any"
            {...register('latitude', { valueAsNumber: true })}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
          />
          {errors.latitude && <p className="mt-1 text-xs text-red-600 font-medium">{errors.latitude.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Kinh độ (Longitude)
          </label>
          <input
            type="number"
            step="any"
            {...register('longitude', { valueAsNumber: true })}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all shadow-2xs"
          />
          {errors.longitude && <p className="mt-1 text-xs text-red-600 font-medium">{errors.longitude.message}</p>}
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
          <option value="ACTIVE">Hoạt động</option>
          <option value="INACTIVE">Ngừng hoạt động</option>
        </select>
        {errors.status && <p className="mt-1 text-xs text-red-600 font-medium">{errors.status.message}</p>}
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

export default BranchForm;
