import apiClient from './api';
import { ApiResponse } from '../types/api-response.type';
import {
  ICheckoutInvoiceDto,
  ICreateOrderBatchDto,
  ICreateOrderBatchResponse,
  IInvoice,
  IOpenTableSessionDto,
  ITableSessionResponse,
} from '../types/dine-in.type';

export const dineInService = {
  /**
   * Lấy thông tin phiên ăn tại bàn, hóa đơn đang mở và thực đơn của chi nhánh
   */
  getTableSession: async (tableId: string): Promise<ApiResponse<ITableSessionResponse>> => {
    return apiClient.get<ApiResponse<ITableSessionResponse>>(`/dine-in/tables/${tableId}/session`);
  },

  /**
   * Mở phiên ăn mới (Invoice) cho bàn
   */
  openTableSession: async (
    tableId: string,
    dto: IOpenTableSessionDto,
  ): Promise<ApiResponse<IInvoice>> => {
    return apiClient.post<ApiResponse<IInvoice>>(`/dine-in/tables/${tableId}/open`, dto);
  },

  /**
   * Gửi một đợt gọi món mới vào bàn ăn (chuyển thẳng xuống Bếp)
   */
  createOrderBatch: async (
    tableId: string,
    dto: ICreateOrderBatchDto,
  ): Promise<ApiResponse<ICreateOrderBatchResponse>> => {
    return apiClient.post<ApiResponse<ICreateOrderBatchResponse>>(
      `/dine-in/tables/${tableId}/orders`,
      dto,
    );
  },

  /**
   * Khách tại bàn bấm nút Yêu cầu thanh toán
   */
  requestPayment: async (tableId: string): Promise<ApiResponse<IInvoice>> => {
    return apiClient.post<ApiResponse<IInvoice>>(`/dine-in/tables/${tableId}/request-payment`);
  },

  /**
   * Nhân viên/Thu ngân xác nhận thanh toán hóa đơn bàn ăn
   */
  checkoutInvoice: async (
    invoiceId: string,
    dto: ICheckoutInvoiceDto,
  ): Promise<ApiResponse<IInvoice>> => {
    return apiClient.post<ApiResponse<IInvoice>>(`/dine-in/invoices/${invoiceId}/checkout`, dto);
  },

  /**
   * Lấy chi tiết hóa đơn bàn ăn theo ID
   */
  getInvoiceById: async (invoiceId: string): Promise<ApiResponse<IInvoice>> => {
    return apiClient.get<ApiResponse<IInvoice>>(`/dine-in/invoices/${invoiceId}`);
  },
};
