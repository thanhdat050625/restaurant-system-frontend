import apiClient from './api';
import { ApiResponse } from '../types/api-response.type';
import {
  ICreateReservationDto,
  IReservation,
  IAvailableSlotsResponse,
} from '../types/reservation.type';

export const reservationService = {
  createReservation: async (
    data: ICreateReservationDto,
  ): Promise<ApiResponse<IReservation>> => {
    return await apiClient.post('/reservations', data);
  },

  getAvailableSlots: async (params: {
    branchId: string;
    date: string;
    guestCount?: number;
  }): Promise<ApiResponse<IAvailableSlotsResponse>> => {
    return await apiClient.get('/reservations/available-slots', { params });
  },

  getReservations: async (params?: Record<string, any>): Promise<ApiResponse<{ items: IReservation[]; meta: any }>> => {
    return await apiClient.get('/reservations', { params });
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
};
