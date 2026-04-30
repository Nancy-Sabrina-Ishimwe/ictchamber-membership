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

export interface CreateInlineInvoicePayload {
  email: string;
  membershipType: string;
}

export interface CreateInlineInvoiceResponse {
  success: boolean;
  message: string;
  invoiceNumber?: string;
  data?: {
    data?: {
      invoiceNumber?: string;
    };
  };
}

export interface ActivateInlinePaymentResponse {
  success: boolean;
  message: string;
}

export interface PaymentCardsAnalytics {
  totalCollectedYtd: number;
  pendingAmount: number;
  failedTransactions: number;
  totalTransactions: number;
  currency: string;
  year: number;
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
 * GET /api/payments/analytics/cards
 * Fetches payment KPI cards for admin payments page.
 */
export async function getPaymentCardsAnalytics(): Promise<PaymentCardsAnalytics> {
  const { data } = await api.get<{ data?: Partial<PaymentCardsAnalytics> }>('/payments/analytics/cards');
  const cards = data?.data ?? {};
  return {
    totalCollectedYtd: Number(cards.totalCollectedYtd ?? 0),
    pendingAmount: Number(cards.pendingAmount ?? 0),
    failedTransactions: Number(cards.failedTransactions ?? 0),
    totalTransactions: Number(cards.totalTransactions ?? 0),
    currency: String(cards.currency ?? 'RWF'),
    year: Number(cards.year ?? new Date().getFullYear()),
  };
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

/**
 * POST /api/irembopay/invoices
 * Creates an IremboPay inline checkout invoice linked to a registered member and tier.
 */
export async function createInlinePaymentInvoice(
  payload: CreateInlineInvoicePayload,
): Promise<CreateInlineInvoiceResponse> {
  const { data } = await api.post<CreateInlineInvoiceResponse>('/irembopay/invoices', payload);
  return data;
}

/**
 * POST /api/irembopay/invoices/activate
 * Finalizes a successful inline checkout and sends the member credentials email.
 */
export async function activateInlinePayment(
  invoiceNumber: string,
): Promise<ActivateInlinePaymentResponse> {
  const { data } = await api.post<ActivateInlinePaymentResponse>('/irembopay/invoices/activate', {
    invoiceNumber,
  });
  return data;
}
