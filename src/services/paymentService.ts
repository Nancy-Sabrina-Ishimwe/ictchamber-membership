import { api } from '../lib/api';
import type { Payment } from '../types/payment';

export type MobileMoneyCarrier = 'MTN' | 'AIRTEL';

export interface InitiatePaymentPayload {
  /** Phone number of the payer, e.g. "0788000111" */
  accountIdentifier: string;
  /** Mobile money carrier — must be uppercase */
  carrier: MobileMoneyCarrier;
  /** Email used during registration (identifies the user) */
  email: string;
  /** Tier label as stored in the DB, e.g. "Gold" */
  membershipType: string;
}

export interface InitiatePaymentResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

type PaymentApiItem = {
  id?: string | number;
  companyName?: string;
  tier?: string;
  period?: string;
  amount?: number | string;
  datePaid?: string;
  method?: string;
  reference?: string;
  status?: string;
};

function normalizeStatus(status?: string): Payment['status'] {
  if (status === 'Paid' || status === 'Pending' || status === 'Failed') {
    return status;
  }
  return 'Pending';
}

function normalizePayment(item: PaymentApiItem, index: number): Payment {
  const amountNumber =
    typeof item.amount === 'number'
      ? item.amount
      : Number(String(item.amount ?? '0').replace(/[^\d.-]/g, ''));

  return {
    id: String(item.id ?? `payment-${index + 1}`),
    companyName: item.companyName ?? 'Unknown Company',
    tier: item.tier ?? 'Membership Tier',
    period: item.period ?? '-',
    amount: Number.isFinite(amountNumber) ? amountNumber : 0,
    datePaid: item.datePaid ?? '-',
    method: item.method ?? '-',
    reference: item.reference ?? '-',
    status: normalizeStatus(item.status),
  };
}

/**
 * GET /api/payments
 * Fetches payments for the admin payments ledger page.
 */
export async function getPayments(): Promise<Payment[]> {
  const { data } = await api.get<PaymentApiItem[] | { data?: PaymentApiItem[] }>('/payments');
  const records = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return records.map(normalizePayment);
}

/**
 * POST /api/irembopay/payments/mobile-money
 * Initiates a mobile-money membership payment via IremboPay.
 * The account is activated asynchronously once the webhook confirms payment.
 */
export async function initiatePaymentApi(
  payload: InitiatePaymentPayload,
): Promise<InitiatePaymentResponse> {
  const { data } = await api.post<InitiatePaymentResponse>(
    '/irembopay/payments/mobile-money',
    payload,
  );
  return data;
}
