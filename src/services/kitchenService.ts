import apiClient from './api';
import { ApiResponse } from '../types/api-response.type';
import { IDineInOrderBatch, IDineInOrderItem } from '../types/dine-in.type';
import {
  IKitchenPickupOrder,
  IKitchenQueueResponse,
  IQueryKitchenQueueParams,
  IUpdateKitchenBatchStatusDto,
  IUpdateKitchenItemStatusDto,
} from '../types/kitchen.type';
import { PickupOrderStatus } from '../types/pickup-order.type';

export const kitchenService = {
  /**
   * Lấy danh sách hàng đợi bếp của chi nhánh (món tại bàn + đơn mang về)
   */
  getKitchenQueue: async (
    params?: IQueryKitchenQueueParams,
  ): Promise<ApiResponse<IKitchenQueueResponse>> => {
    return apiClient.get<ApiResponse<IKitchenQueueResponse>>('/kitchen/queue', { params });
  },

  /**
   * Cập nhật trạng thái của từng món ăn riêng lẻ
   */
  updateOrderItemStatus: async (
    orderItemId: string,
    dto: IUpdateKitchenItemStatusDto,
  ): Promise<ApiResponse<IDineInOrderItem>> => {
    return apiClient.patch<ApiResponse<IDineInOrderItem>>(
      `/kitchen/items/${orderItemId}/status`,
      dto,
    );
  },

  /**
   * Cập nhật nhanh trạng thái cho toàn bộ món trong một đợt gọi món
   */
  updateOrderBatchStatus: async (
    batchId: string,
    dto: IUpdateKitchenBatchStatusDto,
  ): Promise<ApiResponse<IDineInOrderBatch>> => {
    return apiClient.patch<ApiResponse<IDineInOrderBatch>>(
      `/kitchen/batches/${batchId}/status`,
      dto,
    );
  },

  /**
   * Cập nhật trạng thái đơn mang về từ màn hình Bếp
   */
  updatePickupOrderStatus: async (
    pickupOrderId: string,
    status: PickupOrderStatus,
  ): Promise<ApiResponse<IKitchenPickupOrder>> => {
    return apiClient.patch<ApiResponse<IKitchenPickupOrder>>(
      `/kitchen/pickup-orders/${pickupOrderId}/status`,
      { status },
    );
  },
};
