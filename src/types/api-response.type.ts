export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  itemCount?: number;
  itemsPerPage?: number;
  currentPage?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  meta: PaginationMeta;
}>;
