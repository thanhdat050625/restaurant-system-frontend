import apiClient from './api';
import { ApiResponse } from '../types/api-response.type';
import {
  ICreatePickupOrderRequest,
  IPickupOrder,
  IPickupOrdersResponse,
  IQueryPickupOrderParams,
  PickupOrderStatus,
} from '../types/pickup-order.type';

export const pickupOrderService = {
  createPickupOrder: async (data: ICreatePickupOrderRequest) => {
    return apiClient.post<ApiResponse<IPickupOrder>>('/pickup-orders', data);
  },

  getMyPickupOrders: async (params?: { page?: number; limit?: number }) => {
    return apiClient.get<ApiResponse<IPickupOrdersResponse>>('/pickup-orders/my-history', {
      params,
    });
  },

  getPickupOrders: async (params?: IQueryPickupOrderParams) => {
    return apiClient.get<ApiResponse<IPickupOrdersResponse>>('/pickup-orders', {
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
