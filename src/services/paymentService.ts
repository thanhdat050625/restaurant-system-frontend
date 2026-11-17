import apiClient from './api';
import { ApiResponse } from '../types/api-response.type';
import {
  ICreatePaymentRequest,
  IPaymentTransaction,
  IQueryPaymentParams,
} from '../types/payment.type';

export const paymentService = {
  createPayment: async (data: ICreatePaymentRequest) => {
    return apiClient.post<ApiResponse<IPaymentTransaction>>('/payments/create', data);
  },

  verifyMomoReturn: async (params: Record<string, unknown>) => {
    return apiClient.get<ApiResponse<IPaymentTransaction>>('/payments/momo/verify', {
      params,
    });
  },

  verifySepayReturn: async (params: Record<string, unknown>) => {
    return apiClient.get<ApiResponse<IPaymentTransaction>>('/payments/sepay/verify', {
      params,
    });
  },

  getPaymentsByTarget: async (params: IQueryPaymentParams) => {
    return apiClient.get<ApiResponse<IPaymentTransaction[]>>('/payments', {
      params,
    });
  },

  getTransactionByCode: async (transactionCode: string) => {
    return apiClient.get<ApiResponse<IPaymentTransaction>>(`/payments/${transactionCode}`);
  },
};
