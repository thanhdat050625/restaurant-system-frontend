import React from 'react';
import { IBranchCapacityStats } from '../../../types/admin/branch-operating-hours.type';
import { Users, LayoutGrid, Clock } from 'lucide-react';

interface BranchCapacitySectionProps {
  capacity: IBranchCapacityStats | null;
  slotDurationMinutes: number;
  branchName?: string;
}

export const BranchCapacitySection: React.FC<BranchCapacitySectionProps> = ({
  capacity,
  slotDurationMinutes,
  branchName,
}) => {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
        <Users size={16} className="text-primary" />
        <span>Năng Lực Sức Chứa Phục Vụ {branchName ? `(${branchName})` : ''}</span>
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
            <LayoutGrid size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase">Tổng Bàn Hoạt Động</span>
            <p className="text-2xl font-black text-gray-900">
              {capacity ? capacity.totalTables : 0}{' '}
              <span className="text-xs font-medium text-gray-500">bàn</span>
            </p>
          </div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase">
              Tổng Sức Chứa (Ghế Ngồi)
            </span>
            <p className="text-2xl font-black text-gray-900">
              {capacity ? capacity.totalSeats : 0}{' '}
              <span className="text-xs font-medium text-gray-500">khách tối đa</span>
            </p>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold text-amber-700 uppercase">
              Thời Lượng Slot Chuẩn
            </span>
            <p className="text-2xl font-black text-gray-900">
              {slotDurationMinutes}{' '}
              <span className="text-xs font-medium text-gray-500">phút / lượt dùng</span>
            </p>
          </div>
        </div>
      </div>

      {capacity?.byTableType && capacity.byTableType.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs text-gray-500 font-medium">Cơ cấu bàn ăn:</span>
          {capacity.byTableType.map((tt) => (
            <span
              key={tt.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200"
            >
              <strong className="text-gray-900">{tt.name}</strong>
              <span className="text-gray-400">|</span>
              <span>{tt.tableCount} bàn</span>
              <span className="text-gray-500 font-normal">({tt.totalSeats} chỗ)</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default BranchCapacitySection;
