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
  isLoading?: boolean;
}

const BranchForm: React.FC<BranchFormProps> = ({ initialData, onSubmit, isLoading = false }) => {
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
      // API might return standard wrapper depending on backend interceptor
      const data = (res as any).data || res;
      setProvinces(Array.isArray(data) ? data : []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedProvinceCode) {
      branchService.getWardsByProvince(selectedProvinceCode).then(res => {
        const data = (res as any).data || res;
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
          provinceCode: initialData.provinceCode || '',
          wardCode: initialData.wardCode || '',
          detail: initialData.streetAddress || '',
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên chi nhánh *</label>
        <input
          {...register('name')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
          placeholder="Nhập tên chi nhánh..."
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố *</label>
          <select
            {...register('address.provinceCode')}
            onChange={(e) => {
              register('address.provinceCode').onChange(e);
              setValue('address.wardCode', '');
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
          >
            <option value="">Chọn Tỉnh/Thành phố</option>
            {provinces.map(p => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
          {errors.address?.provinceCode && <p className="mt-1 text-sm text-red-600">{errors.address.provinceCode.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã *</label>
          <select
            {...register('address.wardCode')}
            disabled={!selectedProvinceCode}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors bg-white disabled:bg-gray-100"
          >
            <option value="">Chọn Phường/Xã</option>
            {wards.map(w => (
              <option key={w.code} value={w.code}>{w.name}</option>
            ))}
          </select>
          {errors.address?.wardCode && <p className="mt-1 text-sm text-red-600">{errors.address.wardCode.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết (Số nhà, đường) *</label>
        <input
          {...register('address.detail')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
          placeholder="Nhập địa chỉ chi tiết..."
        />
        {errors.address?.detail && <p className="mt-1 text-sm text-red-600">{errors.address.detail.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
        <input
          {...register('phone')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
          placeholder="Nhập số điện thoại..."
        />
        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vĩ độ (Latitude)</label>
          <input
            type="number"
            step="any"
            {...register('latitude', { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
          />
          {errors.latitude && <p className="mt-1 text-sm text-red-600">{errors.latitude.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kinh độ (Longitude)</label>
          <input
            type="number"
            step="any"
            {...register('longitude', { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors"
          />
          {errors.longitude && <p className="mt-1 text-sm text-red-600">{errors.longitude.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
        <select
          {...register('status')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
        >
          <option value="ACTIVE">Hoạt động</option>
          <option value="INACTIVE">Ngừng hoạt động</option>
        </select>
        {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
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

export default BranchForm;
