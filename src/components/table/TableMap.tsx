import React, { useState, useMemo } from 'react';
import { ITable } from '../../types/admin/table.type';
import { Users, Lock, Clock, CheckCircle2, AlertTriangle, Sparkles, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TableMapProps {
  tables: ITable[];
  mode?: 'customer' | 'admin';
  selectedTableId?: string | null;
  onSelectTable?: (table: ITable) => void;
  onTableAction?: (table: ITable) => void;
  partySize?: number;
  loading?: boolean;
}

export const TableMap: React.FC<TableMapProps> = ({
  tables,
  mode = 'customer',
  selectedTableId = null,
  onSelectTable,
  onTableAction,
  partySize = 1,
  loading = false,
}) => {
  // 1. Phân nhóm bàn theo từng tầng
  const floorMap = useMemo(() => {
    const map = new Map<number, ITable[]>();
    tables.forEach((t) => {
      const floor = t.floor || 1;
      if (!map.has(floor)) {
        map.set(floor, []);
      }
      map.get(floor)!.push(t);
    });

    // Sắp xếp số tầng tăng dần
    const sortedFloors = Array.from(map.keys()).sort((a, b) => a - b);
    return { map, floors: sortedFloors };
  }, [tables]);

  const [activeFloor, setActiveFloor] = useState<number>(() => {
    return floorMap.floors[0] || 1;
  });

  // Đồng bộ activeFloor nếu danh sách tầng thay đổi
  React.useEffect(() => {
    if (floorMap.floors.length > 0 && !floorMap.floors.includes(activeFloor)) {
      setActiveFloor(floorMap.floors[0]);
    }
  }, [floorMap.floors, activeFloor]);

  const currentFloorTables = useMemo(() => {
    const list = floorMap.map.get(activeFloor) || [];
    return list.sort((a, b) => a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true }));
  }, [floorMap.map, activeFloor]);

  // Thống kê nhanh tình trạng bàn của chi nhánh
  const stats = useMemo(() => {
    let available = 0;
    let locked = 0;
    let occupied = 0;
    let dirty = 0;
    let maintenance = 0;

    tables.forEach((t) => {
      if (t.lockStatus?.isLocked) {
        locked++;
      } else if (t.status === 'AVAILABLE') {
        available++;
      } else if (t.status === 'OCCUPIED') {
        occupied++;
      } else if (t.status === 'DIRTY') {
        dirty++;
      } else {
        maintenance++;
      }
    });

    return { total: tables.length, available, locked, occupied, dirty, maintenance };
  }, [tables]);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải sơ đồ bàn...</p>
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-dark-card rounded-2xl border border-dashed border-gray-300 dark:border-dark-border">
        <Coffee className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-60" />
        <p className="text-base font-semibold text-gray-700 dark:text-gray-200">Chưa có bàn nào tại chi nhánh này</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vui lòng chọn chi nhánh khác hoặc liên hệ bộ phận hỗ trợ.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── 1. BẢNG CHÚ THÍCH & THỐNG KÊ NHANH ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-dark-surface/60 rounded-xl border border-gray-200 dark:border-dark-border text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-md bg-emerald-500 shadow-sm" />
            <span className="text-gray-700 dark:text-gray-300">Bàn trống ({stats.available})</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-md bg-amber-500 animate-pulse shadow-sm" />
            <span className="text-gray-700 dark:text-gray-300">Đang giữ chỗ ({stats.locked})</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-md bg-rose-500 shadow-sm" />
            <span className="text-gray-700 dark:text-gray-300">Có khách ({stats.occupied})</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-md bg-yellow-500 shadow-sm" />
            <span className="text-gray-700 dark:text-gray-300">Chờ dọn ({stats.dirty})</span>
          </div>
        </div>

        {mode === 'customer' && (
          <div className="text-text-secondary dark:text-gray-400 font-medium flex items-center gap-1.5">
            <Sparkles size={14} className="text-primary" />
            <span>Click vào bàn màu xanh để chọn và giữ bàn trong 10 phút</span>
          </div>
        )}
      </div>

      {/* ─── 2. TABS CHUYỂN TẦNG ─── */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-dark-border pb-2 overflow-x-auto">
        {floorMap.floors.map((floor) => {
          const count = floorMap.map.get(floor)?.length || 0;
          const isActive = floor === activeFloor;
          return (
            <button
              key={floor}
              onClick={() => setActiveFloor(floor)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]'
                  : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border'
              }`}
            >
              <span>Tầng {floor}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-dark-border text-gray-600 dark:text-gray-400'
                }`}
              >
                {count} bàn
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── 3. SƠ ĐỒ BÀN (GRID MAP) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <AnimatePresence mode="popLayout">
          {currentFloorTables.map((table) => {
            const capacity = table.tableType?.capacity || 2;
            const isSelected = selectedTableId === table.id;
            const isLockedByOthers = table.lockStatus?.isLocked && !table.lockStatus?.lockedByMe;
            const isLockedByMe = table.lockStatus?.isLocked && table.lockStatus?.lockedByMe;
            const isOccupied = table.status === 'OCCUPIED';
            const isDirty = table.status === 'DIRTY';
            const isMaintenance = table.status === 'MAINTENANCE';
            const isAvailable = table.status === 'AVAILABLE' && !isLockedByOthers;
            const isUnderCapacity = mode === 'customer' && partySize > capacity;

            // Xác định màu sắc & viền
            let cardStyle = 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border text-gray-700';
            let badgeBg = 'bg-gray-100 text-gray-700 dark:bg-dark-border dark:text-gray-300';
            let statusText = 'Trống';

            if (isSelected || isLockedByMe) {
              cardStyle = 'bg-primary/10 border-primary ring-2 ring-primary text-primary shadow-lg shadow-primary/15';
              badgeBg = 'bg-primary text-white';
              statusText = 'Bạn đang giữ bàn';
            } else if (isLockedByOthers) {
              cardStyle = 'bg-amber-500/10 border-amber-400 text-amber-700 dark:text-amber-300 ring-1 ring-amber-400/50';
              badgeBg = 'bg-amber-500 text-white animate-pulse';
              statusText = table.lockStatus?.expiresIn
                ? `Giữ chỗ (${Math.floor(table.lockStatus.expiresIn / 60)}p)`
                : 'Đang giữ chỗ';
            } else if (isOccupied) {
              cardStyle = 'bg-rose-500/10 border-rose-300 text-rose-700 dark:text-rose-400 opacity-75';
              badgeBg = 'bg-rose-500 text-white';
              statusText = 'Có khách';
            } else if (isDirty) {
              cardStyle = 'bg-yellow-500/10 border-yellow-300 text-yellow-700 dark:text-yellow-400 opacity-80';
              badgeBg = 'bg-yellow-500 text-white';
              statusText = 'Cần dọn';
            } else if (isMaintenance) {
              cardStyle = 'bg-gray-100 dark:bg-dark-surface border-gray-300 text-gray-400 opacity-50';
              badgeBg = 'bg-gray-400 text-white';
              statusText = 'Bảo trì';
            } else if (isAvailable) {
              cardStyle =
                'bg-emerald-500/10 border-emerald-400/60 hover:border-emerald-500 hover:shadow-md hover:scale-[1.02] text-emerald-800 dark:text-emerald-300 cursor-pointer';
              badgeBg = 'bg-emerald-500 text-white';
              statusText = 'Sẵn sàng';
            }

            const canClickCustomer = isAvailable || isLockedByMe;

            return (
              <motion.div
                key={table.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  if (mode === 'customer') {
                    if (canClickCustomer && onSelectTable) {
                      onSelectTable(table);
                    }
                  } else {
                    if (onTableAction) {
                      onTableAction(table);
                    }
                  }
                }}
                className={`relative rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between min-h-[145px] ${cardStyle}`}
              >
                {/* Ghế minh họa phía trên bàn */}
                <div className="flex justify-center gap-1.5 mb-2 opacity-60">
                  {Array.from({ length: Math.min(capacity, 4) }).map((_, idx) => (
                    <span key={idx} className="w-2.5 h-1.5 rounded-t-sm bg-current" />
                  ))}
                </div>

                {/* Nội dung trung tâm */}
                <div className="text-center my-auto">
                  <div className="flex items-center justify-center gap-1">
                    <h4 className="text-lg font-black tracking-tight font-mono">{table.tableNumber}</h4>
                    {table.tableType?.name?.toLowerCase().includes('vip') && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400 text-amber-950 uppercase">
                        VIP
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium opacity-75 mt-0.5 flex items-center justify-center gap-1">
                    <Users size={12} />
                    <span>{capacity} chỗ</span>
                  </p>
                </div>

                {/* Ghế minh họa phía dưới bàn */}
                <div className="flex justify-center gap-1.5 mt-2 mb-2 opacity-60">
                  {Array.from({ length: Math.min(capacity, 4) }).map((_, idx) => (
                    <span key={idx} className="w-2.5 h-1.5 rounded-b-sm bg-current" />
                  ))}
                </div>

                {/* Badge trạng thái */}
                <div className="mt-auto pt-2 border-t border-current/15 flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeBg}`}>
                    {statusText}
                  </span>

                  {isLockedByMe && (
                    <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">
                      <CheckCircle2 size={12} />
                      Đã chọn
                    </span>
                  )}

                  {isLockedByOthers && (
                    <Lock size={12} className="text-amber-500 shrink-0" />
                  )}
                </div>

                {/* Cảnh báo nếu số khách đông hơn sức chứa bàn */}
                {isUnderCapacity && isAvailable && (
                  <div className="absolute top-2 right-2" title={`Bàn ${capacity} chỗ có thể chật so với ${partySize} khách`}>
                    <AlertTriangle size={14} className="text-amber-500" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TableMap;
