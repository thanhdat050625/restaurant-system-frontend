import apiClient from './api';
import { ApiResponse, PaginationMeta } from '../types/api-response.type';
import {
  ICreatePickupOrderRequest,
  IPickupOrder,
  IPickupOrdersResponse,
  IQueryPickupOrderParams,
  PickupOrderStatus,
} from '../types/pickup-order.type';

/**
 * Backend TransformInterceptor trải { items, meta } thành { data: items, meta }.
 * Hàm này chuẩn hóa cả hai cấu trúc trả về để các màn hình Admin/Staff/Customer đọc an toàn.
 */
export const extractPickupOrdersPage = (
  res: ApiResponse<IPickupOrder[] | IPickupOrdersResponse> | undefined | null,
): { items: IPickupOrder[]; meta: PaginationMeta | null } => {
  const payload = res?.data;
  if (Array.isArray(payload)) {
    return { items: payload, meta: res?.meta ?? null };
  }
  if (payload && typeof payload === 'object' && Array.isArray(payload.items)) {
    return { items: payload.items, meta: payload.meta ?? res?.meta ?? null };
  }
  return { items: [], meta: res?.meta ?? null };
};

export const pickupOrderService = {
  createPickupOrder: async (data: ICreatePickupOrderRequest) => {
    return apiClient.post<ApiResponse<IPickupOrder>>('/pickup-orders', data);
  },

  getMyPickupOrders: async (params?: { page?: number; limit?: number }) => {
    return apiClient.get<ApiResponse<IPickupOrder[] | IPickupOrdersResponse>>(
      '/pickup-orders/my-history',
      { params },
    );
  },

  getPickupOrders: async (params?: IQueryPickupOrderParams) => {
    return apiClient.get<ApiResponse<IPickupOrder[] | IPickupOrdersResponse>>('/pickup-orders', {
      params,
    });
  },

  getPickupOrderById: async (id: string) => {
    return apiClient.get<ApiResponse<IPickupOrder>>(`/pickup-orders/${id}`);
  },

  cancelPickupOrder: async (id: string, reason?: string) => {
    return apiClient.patch<ApiResponse<IPickupOrder>>(`/pickup-orders/${id}/cancel`, {
      reason,
    });
  },

  updatePickupOrderStatus: async (
    id: string,
    status: PickupOrderStatus,
    cancelledReason?: string,
  ) => {
    return apiClient.patch<ApiResponse<IPickupOrder>>(`/pickup-orders/${id}/status`, {
      status,
      cancelledReason,
    });
  },

  verifyPickupCode: async (orderCode: string) => {
    return apiClient.post<ApiResponse<IPickupOrder>>('/pickup-orders/verify-code', {
      orderCode,
    });
  },
};
