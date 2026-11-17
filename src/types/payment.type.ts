export type PaymentProvider = 'MOMO' | 'CASH';

export type PaymentPurpose =
  | 'RESERVATION_DEPOSIT'
  | 'RESERVATION_SETTLEMENT'
  | 'PICKUP_ORDER';

export type PaymentStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'EXPIRED'
  | 'REFUNDED';

export interface IPaymentTransaction {
  id: string;
  transactionCode: string;
  provider: PaymentProvider;
  purpose: PaymentPurpose;
  status: PaymentStatus;
  amount: number;
  payUrl?: string | null;
  gatewayTransId?: string | null;
  gatewayResponseCode?: string | null;
  paidAt?: string | null;
  refundedAt?: string | null;
  refundReason?: string | null;
  expiresAt: string;
  createdAt: string;
  pickupOrderId?: string | null;
  reservationId?: string | null;
}

export interface ICreatePaymentRequest {
  provider: PaymentProvider;
  purpose: PaymentPurpose;
  pickupOrderId?: string;
  reservationId?: string;
}

export interface IQueryPaymentParams {
  pickupOrderId?: string;
  reservationId?: string;
}
