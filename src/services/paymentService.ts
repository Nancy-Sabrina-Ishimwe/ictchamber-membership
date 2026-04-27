import { api } from '../lib/api';

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
