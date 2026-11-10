import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ChevronRight, MapPin, Phone, Layers } from 'lucide-react';
import { IDashboardBranchTable } from '../types/dashboard.type';

interface BranchTableSummaryProps {
  loading: boolean;
  tablesPerBranch: IDashboardBranchTable[];
}

export const BranchTableSummary: React.FC<BranchTableSummaryProps> = ({
  loading,
  tablesPerBranch,
}) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-xs p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Các Chi Nhánh Trong Chuỗi</h2>
            <p className="text-xs text-gray-500">Danh sách các cơ sở nhà hàng và quy mô bàn ăn</p>
          </div>
        </div>
        <Link
          to="/admin/branches"
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
        >
          Quản lý chi nhánh <ChevronRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-400 text-sm">Đang tải danh sách chi nhánh...</div>
      ) : tablesPerBranch.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-sm">Chưa có chi nhánh nào được tạo.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {tablesPerBranch.map((branch) => (
            <div
              key={branch.id}
              className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-orange-200 hover:shadow-xs transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-gray-900 text-sm">{branch.name}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    branch.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {branch.status === 'ACTIVE' ? 'Đang mở' : 'Tạm dừng'}
                </span>
              </div>

              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400 shrink-0" />
                  <span className="truncate">{(branch as any).address || branch.streetAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-400 shrink-0" />
                  <span>{branch.phone}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700 flex items-center gap-1">
                  <Layers size={13} className="text-blue-500" /> {branch.tableCount} Bàn phục vụ
                </span>
                <Link
                  to="/admin/tables"
                  className="text-orange-600 hover:underline font-medium"
                >
                  Sơ đồ bàn &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
