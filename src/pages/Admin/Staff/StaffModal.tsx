import React, { useState, useEffect } from 'react';
import { IStaff, ICreateStaffDto, IUpdateStaffDto } from '../../../types/admin/staff.type';
import { IBranch } from '../../../types/admin/branch.type';
import { staffService } from '../../../services/admin/staffService';
import { X, User, Mail, Lock, Phone, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  staffToEdit?: IStaff | null;
  branches: IBranch[];
}

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  staffToEdit,
  branches,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    branchId: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (staffToEdit) {
      setFormData({
        fullName: staffToEdit.fullName || '',
        email: staffToEdit.email || '',
        password: '',
        phone: staffToEdit.phone || '',
        gender: (staffToEdit.gender as any) || 'MALE',
        branchId: staffToEdit.branchId || (branches[0]?.id || ''),
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        gender: 'MALE',
        branchId: branches[0]?.id || '',
      });
    }
  }, [staffToEdit, branches, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error('Vui lòng nhập họ và tên nhân viên');
      return;
    }

    if (!staffToEdit && !formData.email.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }

    if (!staffToEdit && (!formData.password || formData.password.length < 6)) {
      toast.error('Mật khẩu ban đầu phải có ít nhất 6 ký tự');
      return;
    }

    if (!formData.branchId) {
      toast.error('Vui lòng chọn chi nhánh làm việc');
      return;
    }

    try {
      setLoading(true);
      if (staffToEdit) {
        const updatePayload: IUpdateStaffDto = {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim() || undefined,
          gender: formData.gender,
          branchId: formData.branchId,
        };
        await staffService.updateStaff(staffToEdit.id, updatePayload);
        toast.success('Cập nhật thông tin nhân viên thành công');
      } else {
        const createPayload: ICreateStaffDto = {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim() || undefined,
          gender: formData.gender,
          branchId: formData.branchId,
        };
        await staffService.createStaff(createPayload);
        toast.success('Tạo tài khoản nhân viên mới thành công');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <User size={18} className="text-primary" />
            {staffToEdit ? 'Cập Nhật / Điều Chuyển Nhân Viên' : 'Thêm Nhân Viên Chi Nhánh Mới'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Họ và tên */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Họ Và Tên <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Ví dụ: Nguyễn Văn An"
                className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Đăng Nhập {!staffToEdit && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required={!staffToEdit}
                disabled={!!staffToEdit}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@foodhub.vn"
                className={`w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-hidden transition-all ${
                  staffToEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20'
                }`}
              />
            </div>
            {staffToEdit && (
              <p className="text-[11px] text-gray-400 mt-1">Email đăng nhập cố định không thể thay đổi</p>
            )}
          </div>

          {/* Mật khẩu khi tạo mới */}
          {!staffToEdit && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Mật Khẩu Ban Đầu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                />
              </div>
            </div>
          )}

          {/* Chi nhánh làm việc & Số điện thoại */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Chi Nhánh Làm Việc <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>-- Chọn chi nhánh --</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              {staffToEdit && (
                <p className="text-[11px] text-orange-600 mt-1">Chọn chi nhánh khác để điều chuyển</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Số Điện Thoại
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0901234567"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                />
              </div>
            </div>
          </div>

          {/* Giới tính */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Giới Tính
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="MALE"
                  checked={formData.gender === 'MALE'}
                  onChange={() => setFormData({ ...formData, gender: 'MALE' })}
                  className="text-primary focus:ring-primary"
                />
                Nam
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="FEMALE"
                  checked={formData.gender === 'FEMALE'}
                  onChange={() => setFormData({ ...formData, gender: 'FEMALE' })}
                  className="text-primary focus:ring-primary"
                />
                Nữ
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="OTHER"
                  checked={formData.gender === 'OTHER'}
                  onChange={() => setFormData({ ...formData, gender: 'OTHER' })}
                  className="text-primary focus:ring-primary"
                />
                Khác
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>{staffToEdit ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
