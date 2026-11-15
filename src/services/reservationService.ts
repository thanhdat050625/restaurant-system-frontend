import apiClient from './api';
import { ApiResponse } from '../types/api-response.type';
import { PaymentProvider } from '../types/payment.type';
import {
  ICreateReservationDto,
  IReservation,
  IAvailableSlotsResponse,
  IQueryAvailableSlotsParams,
  IPreOrderItem,
  IReservationBill,
} from '../types/reservation.type';

export const reservationService = {
  createReservation: async (
    data: ICreateReservationDto,
  ): Promise<ApiResponse<IReservation>> => {
    return await apiClient.post('/reservations', data);
  },

  getAvailableSlots: async (
    params: IQueryAvailableSlotsParams,
  ): Promise<ApiResponse<IAvailableSlotsResponse>> => {
    return await apiClient.get('/reservations/available-slots', { params });
  },

  getReservations: async (params?: Record<string, any>): Promise<ApiResponse<{ items: IReservation[]; meta: any }>> => {
    return await apiClient.get('/reservations', { params });
  },

  getMyReservations: async (params?: {
    timeline?: 'UPCOMING' | 'PAST';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ items: IReservation[]; meta: any }>> => {
    return await apiClient.get('/reservations/my-history', { params });
  },

  getReservationById: async (id: string): Promise<ApiResponse<IReservation>> => {
    return await apiClient.get(`/reservations/${id}`);
  },

  cancelReservation: async (
    id: string,
    reason?: string,
  ): Promise<ApiResponse<IReservation>> => {
    return await apiClient.patch(`/reservations/${id}/cancel`, { reason });
  },

  updateStatus: async (
    id: string,
    status: string,
    note?: string,
    tableId?: string,
  ): Promise<ApiResponse<IReservation>> => {
    return await apiClient.patch(`/reservations/${id}/status`, { status, note, tableId });
  },

  checkInQr: async (reservationCode: string): Promise<ApiResponse<IReservation>> => {
    return await apiClient.post('/reservations/check-in-qr', { reservationCode });
  },

  getPreOrders: async (reservationId: string): Promise<ApiResponse<any>> => {
    return await apiClient.get(`/reservations/${reservationId}/pre-orders`);
  },

  updatePreOrders: async (
    reservationId: string,
    items: IPreOrderItem[],
  ): Promise<ApiResponse<any>> => {
    return await apiClient.put(`/reservations/${reservationId}/pre-orders`, { items });
  },

  getBill: async (id: string): Promise<ApiResponse<IReservationBill>> => {
    return await apiClient.get(`/reservations/${id}/bill`);
  },

  settleBill: async (
    id: string,
    data: { paymentMethod: PaymentProvider; note?: string },
  ): Promise<ApiResponse<IReservationBill | { payUrl?: string; transactionCode?: string }>> => {
    return await apiClient.post(`/reservations/${id}/settle`, data);
  },
};
