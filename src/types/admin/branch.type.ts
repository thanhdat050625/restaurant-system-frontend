export interface IBranch {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  status: 'ACTIVE' | 'INACTIVE';
}
