import React from 'react';
import { useRegistrationStore } from '../../../store/registrationStore';
import { TIER_PRICES } from '../../../types/registration';
import { Button } from '../ui/ui';

const TIER_LABELS: Record<string, string> = {
  bronze: 'Bronze Member',
  silver: 'Silver Member',
  gold: 'Gold Member',
  platinum: 'Platinum Member',
};

const METHOD_LABELS: Record<string, string> = {
  card: 'Credit / Debit Card',
  mobile_money: 'Mobile Money',
  bank_transfer: 'Bank Transfer',
};

export const RegistrationCompleteModal: React.FC = () => {
  const { formData, setShowSuccessModal, reset } = useRegistrationStore();
  const { tier, period, paymentMethod } = formData.tierPayment;
  const companyName = formData.companyInfo.officialName || 'Your Company';

  const amount = tier ? TIER_PRICES[tier] * period : 0;
  const [membershipId] = React.useState(
    () => `ICT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  );

  const handleClose = () => {
    setShowSuccessModal(false);
    reset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-[600px] rounded-xl bg-white px-5 py-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300 sm:px-6 sm:py-7">
        <div className="mx-auto flex max-w-[520px] flex-col">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-800">
              <svg className="h-4.5 w-4.5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-[22px] font-bold text-gray-900 sm:text-[24px]">
              Registration Complete!
            </h2>
          </div>

          <p className="mx-auto mb-8 max-w-[470px] text-center text-sm leading-7 text-gray-500">
            Thank you for applying to join the Rwanda ICT Chamber. Your payment has been
            received and your application is currently under review.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-50">
                  <svg className="h-3.5 w-3.5 text-[#EF9F27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-900">Membership Details</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-gray-400">Membership ID</span>
                  <span className="font-semibold text-gray-900">{membershipId}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-gray-400">Company</span>
                  <span className="max-w-[160px] truncate text-right font-semibold text-gray-900">
                    {companyName}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-gray-400">Selected Tier</span>
                  {tier && (
                    <span className="rounded-full bg-[#F2B400] px-2.5 py-0.5 text-[10px] font-bold text-black">
                      {TIER_LABELS[tier]}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-50">
                  <svg className="h-3.5 w-3.5 text-[#EF9F27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-900">Payment Summary</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-gray-400">Status</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                    Paid
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-gray-400">Amount</span>
                  <span className="font-semibold text-gray-900">{amount.toLocaleString()} RWF</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-gray-400">Method</span>
                  <span className="font-semibold text-gray-900">{METHOD_LABELS[paymentMethod]}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-gray-50 p-5">
            <h4 className="mb-4 text-sm font-semibold text-gray-900">What happens next?</h4>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md border border-gray-200 bg-white">
                <svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Welcome Package</p>
                <p className="mt-1 text-xs leading-6 text-gray-500">
                  You will receive an email with Membership certificate, payment receipt and
                  your login credentials to the Member Portal and details about upcoming
                  networking events.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 flex justify-center">
            <Button
              variant="secondary"
              className="min-w-[96px] px-6"
              onClick={handleClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
