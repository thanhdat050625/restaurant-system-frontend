export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuCategoryInput {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateMenuCategoryInput extends Partial<CreateMenuCategoryInput> {}

export interface QueryMenuCategoriesParams {
  page?: number;
  limit?: number;
  includeInactive?: boolean;
}
