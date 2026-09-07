export interface IDailyOperatingHour {
  id?: string;
  branchId?: string;
  dayOfWeek: number; // 0: Chủ Nhật, 1: Thứ Hai, 2: Thứ Ba, 3: Thứ Tư, 4: Thứ Năm, 5: Thứ Sáu, 6: Thứ Bảy
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface IBranchOperatingHours {
  branchId: string;
  branchName: string;
  openingTime: string;
  closingTime: string;
  slotDurationMinutes: number;
  dailyHours: IDailyOperatingHour[];
}

export interface IUpdateBranchOperatingHours {
  openingTime?: string;
  closingTime?: string;
  slotDurationMinutes?: number;
  dailyHours?: IDailyOperatingHour[];
}

export interface ITableTypeCapacity {
  id: string;
  name: string;
  capacity: number;
  tableCount: number;
  totalSeats: number;
}

export interface IBranchCapacityStats {
  branchId: string;
  branchName: string;
  openingTime: string;
  closingTime: string;
  slotDurationMinutes: number;
  totalTables: number;
  totalSeats: number;
  byTableType: ITableTypeCapacity[];
}
