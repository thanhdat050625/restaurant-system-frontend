import { MenuCategory } from './menuCategory.type';

export interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  originalPrice?: number | string | null;
  imageUrl?: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTime?: number | null;
  isActive: boolean;
  categoryId: string;
  category?: MenuCategory;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemInput {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  preparationTime?: number;
  categoryId: string;
  isActive?: boolean;
}

export interface UpdateMenuItemInput extends Partial<CreateMenuItemInput> {}

export interface QueryMenuItemsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  includeInactive?: boolean;
}
