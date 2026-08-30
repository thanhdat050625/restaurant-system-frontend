import React, { useState, useEffect } from 'react';
import { IStaff } from '../../../types/admin/staff.type';
import { IBranch } from '../../../types/admin/branch.type';
import { staffService } from '../../../services/admin/staffService';
import { branchService } from '../../../services/admin/branchService';
import { StaffModal } from './StaffModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import Pagination from '../../../components/common/Pagination';
import { PaginationMeta } from '../../../types/api-response.type';
import {
  Plus,
  Search,
  Filter,
  Building2,
  Phone,
  Edit2,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Staff: React.FC = () => {
  const [staffs, setStaffs] = useState<IStaff[]>([]);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination & Filter state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  // Modal States
  const [isStaffModalOpen, setIsStaffModalOpen] = useState<boolean>(false);
  const [staffToEdit, setStaffToEdit] = useState<IStaff | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState<boolean>(false);
  const [staffToReset, setStaffToReset] = useState<IStaff | null>(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchStaffs();
  }, [page, limit, search, branchFilter, statusFilter]);

  const fetchBranches = async () => {
    try {
      const res = await branchService.getBranches({ limit: 100 });
      const branchList = Array.isArray(res) ? res : (res as any)?.data || [];
      setBranches(branchList);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchStaffs = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);

      const params: any = {
        page,
        limit,
        ...(search.trim() && { search: search.trim() }),
        ...(branchFilter !== 'ALL' && { branchId: branchFilter }),
        ...(statusFilter !== 'ALL' && { isActive: statusFilter === 'ACTIVE' }),
      };

      const res = await staffService.getStaffs(params);
      const data = res.data || (res as any);

      if (data && data.items) {
        setStaffs(data.items);
        setMeta({
          totalItems: data.total,
          itemCount: data.items.length,
          itemsPerPage: data.limit,
          totalPages: data.totalPages,
          currentPage: data.page,
          page: data.page,
          limit: data.limit,
          hasNextPage: data.page < data.totalPages,
          hasPrevPage: data.page > 1,
        });
      } else if (Array.isArray(data)) {
        setStaffs(data);
        setMeta(null);
      }
    } catch (error) {
      console.error('Error fetching staffs:', error);
      toast.error('Lỗi khi tải danh sách nhân viên');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleBranchFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBranchFilter(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleToggleStatus = async (staff: IStaff) => {
    const actionName = staff.isActive ? 'khóa' : 'mở khóa';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản của nhân viên "${staff.fullName}"?`)) {
      return;
    }

    try {
      await staffService.toggleStaffStatus(staff.id);
      toast.success(`Đã ${actionName} tài khoản thành công`);
      fetchStaffs(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Không thể ${actionName} tài khoản`);
    }
  };

  const openCreateModal = () => {
    setStaffToEdit(null);
    setIsStaffModalOpen(true);
  };

  const openEditModal = (staff: IStaff) => {
    setStaffToEdit(staff);
    setIsStaffModalOpen(true);
  };

  const openResetPasswordModal = (staff: IStaff) => {
    setStaffToReset(staff);
    setIsResetPasswordOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Danh sách Nhân viên</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý tài khoản và phân bổ nhân sự theo từng chi nhánh</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus size={18} />
          <span>Thêm nhân viên</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
        {/* Ô tìm kiếm */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Tìm theo tên, email, SĐT..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        {/* Lọc theo Chi nhánh */}
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400 shrink-0" />
          <select
            value={branchFilter}
            onChange={handleBranchFilterChange}
            className="w-full py-2 px-3 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
          >
            <option value="ALL">Tất cả chi nhánh</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Lọc theo Trạng thái */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full py-2 px-3 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
          >
            <option value="ALL">Tất cả trạng thái hoạt động</option>
            <option value="ACTIVE">Đang làm việc</option>
            <option value="INACTIVE">Đã khóa</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                  <th className="p-3 font-medium">Nhân viên</th>
                  <th className="p-3 font-medium">Số điện thoại</th>
                  <th className="p-3 font-medium">Chi nhánh công tác</th>
                  <th className="p-3 font-medium text-center">Trạng thái</th>
                  <th className="p-3 font-medium text-center">Ngày tạo</th>
                  <th className="p-3 font-medium text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {staffs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500 text-sm">
                      <Users size={32} className="mx-auto mb-2 text-gray-300" />
                      Không tìm thấy nhân viên nào phù hợp
                    </td>
                  </tr>
                ) : (
                  staffs.map((staff) => {
                    const avatarSrc =
                      staff.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.fullName)}&background=3B82F6&color=fff&bold=true`;

                    return (
                      <tr key={staff.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        {/* Nhân viên info */}
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={avatarSrc}
                              alt={staff.fullName}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-400/20 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{staff.fullName}</p>
                              <p className="text-xs text-gray-500 truncate">{staff.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Số điện thoại */}
                        <td className="p-3 text-sm text-gray-600">
                          {staff.phone ? (
                            <span className="flex items-center gap-1.5">
                              <Phone size={14} className="text-gray-400" />
                              {staff.phone}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic text-xs">Chưa có SĐT</span>
                          )}
                        </td>

                        {/* Chi nhánh công tác */}
                        <td className="p-3 text-sm">
                          {staff.branch ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 font-medium text-xs border border-orange-200/60">
                              <Building2 size={14} className="shrink-0 text-orange-600" />
                              <span>{staff.branch.name}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-xs">Chưa phân chi nhánh</span>
                          )}
                        </td>

                        {/* Trạng thái */}
                        <td className="p-3 text-sm text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                              staff.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {staff.isActive ? (
                              <>
                                <ShieldCheck size={13} /> Đang làm việc
                              </>
                            ) : (
                              <>
                                <ShieldAlert size={13} /> Đã khóa
                              </>
                            )}
                          </span>
                        </td>

                        {/* Ngày tạo */}
                        <td className="p-3 text-sm text-gray-500 text-center">
                          {new Date(staff.createdAt).toLocaleDateString('vi-VN')}
                        </td>

                        {/* Thao tác */}
                        <td className="p-3 text-sm text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Sửa */}
                            <button
                              onClick={() => openEditModal(staff)}
                              title="Sửa thông tin / Điều chuyển chi nhánh"
                              className="text-info hover:text-blue-700 font-medium text-xs px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors inline-flex items-center gap-1"
                            >
                              <Edit2 size={13} />
                              Sửa
                            </button>

                            {/* Đổi mật khẩu */}
                            <button
                              onClick={() => openResetPasswordModal(staff)}
                              title="Đặt lại mật khẩu"
                              className="text-amber-700 hover:text-amber-800 font-medium text-xs px-2.5 py-1 bg-amber-50 hover:bg-amber-100 rounded transition-colors inline-flex items-center gap-1"
                            >
                              <KeyRound size={13} />
                              Mật khẩu
                            </button>

                            {/* Khóa / Mở khóa */}
                            <button
                              onClick={() => handleToggleStatus(staff)}
                              title={staff.isActive ? 'Khóa tài khoản' : 'Kích hoạt lại'}
                              className={`font-medium text-xs px-2.5 py-1 rounded transition-colors inline-flex items-center gap-1 ${
                                staff.isActive
                                  ? 'text-error hover:text-red-700 bg-red-50 hover:bg-red-100'
                                  : 'text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100'
                              }`}
                            >
                              {staff.isActive ? 'Khóa' : 'Mở khóa'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {meta && (
            <Pagination
              meta={meta}
              onPageChange={(newPage) => setPage(newPage)}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          )}
        </>
      )}

      {/* Modals */}
      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSuccess={() => fetchStaffs(false)}
        staffToEdit={staffToEdit}
        branches={branches}
      />

      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        staff={staffToReset}
      />
    </div>
  );
};

export default Staff;
