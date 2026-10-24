import { IDailyOperatingHour } from './branch-operating-hours.type';

export interface IProvince {
  code: string;
  name: string;
  level: string;
}

export interface IWard {
  code: string;
  name: string;
  fullName: string;
  level: string;
  provinceCode: string;
}

export interface IBranch {
  id: string;
  name: string;
  streetAddress: string;
  provinceCode: string;
  wardCode: string;
  province?: IProvince;
  ward?: IWard;
  phone: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  openingTime?: string;
  closingTime?: string;
  slotDurationMinutes?: number;
  status: 'ACTIVE' | 'CLOSED' | 'INACTIVE';
  todayHours?: string;
  isOpenNow?: boolean;
  distanceKm?: number | null;
  operatingHours?: IDailyOperatingHour[];
}

export interface QueryBranchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  provinceCode?: string;
  wardCode?: string;
  lat?: number;
  lng?: number;
  isOpenNow?: boolean;
}
