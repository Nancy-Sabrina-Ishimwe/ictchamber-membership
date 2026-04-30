import React, { useEffect, useState } from 'react';
import { useRegistrationStore } from '../../../store/registrationStore';
import { TIER_PRICES } from '../../../types/registration';
import type { MembershipTier } from '../../../types/registration';
import { Button, Card } from '../ui/ui';
import { activateInlinePayment, createInlinePaymentInvoice } from '../../../services/paymentService';

// ─── Tier data ────────────────────────────────────────────────────────────────
const TIERS: {
  id: MembershipTier;
  label: string;
  features: { category: string; items: string[] }[];
}[] = [
  {
    id: 'bronze',
    label: 'Bronze',
    features: [
      {
        category: 'Advocacy',
        items: [
          'Strategic policy engagement (Public Private Dialogue Units)',
          'Membership to a sector-specific cluster/association',
          'Private tech sector issue escalation and resolution',
        ],
      },
      {
        category: 'Access to Markets',
        items: [
          'Subsidized exhibition booths at local events',
          'Discounted flight tickets for specific airlines through ITA/BCD Rwanda',
        ],
      },
    ],
  },
  {
    id: 'silver',
    label: 'Silver',
    features: [
      {
        category: 'Access to Markets',
        items: [
          'Business/Product pitching and exhibition opportunities',
          'Promotion via Rwanda ICT Chamber platforms (social media, website, newsletter, etc.)',
        ],
      },
      {
        category: 'Access to Finance',
        items: [
          'Access to information about available grant opportunities',
          'Investor linkages and matchmaking',
          'Recommendation to funding and tenders',
        ],
      },
      {
        category: 'Capacity Building',
        items: ['Merit-based Trust Seal acquisition', 'Legal & Business Clinics'],
      },
    ],
  },
  {
    id: 'gold',
    label: 'Gold',
    features: [
      {
        category: 'Access to Markets',
        items: [
          'Media exposure (Tech Launchpad, EdTech Mondays, The New Times audio-visual platforms, etc.)',
          'Facilitated attendance of relevant international events',
        ],
      },
      {
        category: 'Capacity Building',
        items: ['Digital talent access facilitation'],
      },
    ],
  },
  {
    id: 'platinum',
    label: 'Platinum',
    features: [
      {
        category: 'Joint Project Development',
        items: [
          'Market and policy intelligence sharing',
          'Access to Rwanda ICT Chamber market data and communities',
          'Stakeholder mapping and engagement support',
        ],
      },
    ],
  },
];

// ─── Tier Card ────────────────────────────────────────────────────────────────
const TierCard: React.FC<{
  tier: (typeof TIERS)[0];
  selected: boolean;
  onSelect: () => void;
}> = ({ tier, selected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    className={[
      'p-4 rounded-sm border-2 text-center transition-all duration-150 flex flex-col justify-center min-h-[104px]',
      selected
        ? 'border-[#EF9F27] bg-amber-50/30 shadow-md shadow-amber-100'
        : 'border-gray-200 hover:border-gray-300 bg-white',
    ].join(' ')}
  >
    {/* Tier name + price */}
    <div className="flex flex-col gap-0.5">
      <span
        className={[
          'text-xs font-bold tracking-widest uppercase',
          selected ? 'text-[#EF9F27]' : 'text-gray-400',
        ].join(' ')}
      >
        {tier.label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-gray-900">
          RWF {TIER_PRICES[tier.id].toLocaleString()}
        </span>
      </div>
      <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Per year</p>
    </div>
  </button>
);

const IREMBO_INLINE_SCRIPT = 'https://dashboard.sandbox.irembopay.com/assets/payment/inline.js';
const IREMBO_PUBLIC_KEY = 'pk_live_c8744de681df47c892985084d6c92abb';

const TIER_LABELS: Record<MembershipTier, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
};

type IremboPayResponse = { [key: string]: unknown };

declare global {
  interface Window {
    IremboPay?: {
      locale: { EN: string };
      initiate: (options: {
        publicKey: string;
        invoiceNumber: string;
        locale: string;
        callback: (err: unknown, resp: IremboPayResponse) => void;
      }) => void;
    };
  }
}

// ─── Step 2 ────────────────────────────────────────────────────────────────────
export const RegistrationStep2: React.FC = () => {
  const { formData, updateTierPayment, prevStep, setShowSuccessModal } = useRegistrationStore();
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tierError, setTierError] = useState('');
  const [apiError, setApiError] = useState('');
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);

  const { tier, period } = formData.tierPayment;
  const totalAmount = tier ? TIER_PRICES[tier] * period : 0;

  useEffect(() => {
    const existingScript = document.querySelector(`script[src="${IREMBO_INLINE_SCRIPT}"]`);
    if (existingScript) {
      setIsSdkReady(Boolean(window.IremboPay));
      return;
    }

    const script = document.createElement('script');
    script.src = IREMBO_INLINE_SCRIPT;
    script.async = true;
    script.onload = () => setIsSdkReady(true);
    script.onerror = () => setIsSdkReady(false);
    document.body.appendChild(script);
  }, []);

  const fetchInvoice = async (): Promise<string | null> => {
    try {
      if (!tier) return null;
      const data = await createInlinePaymentInvoice({
        email: formData.companyInfo.email,
        membershipType: TIER_LABELS[tier],
      });
      return data.invoiceNumber ?? data.data?.data?.invoiceNumber ?? null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!tier) {
      setTierError('Please select a membership tier to continue.');
      return;
    }
    setTierError('');
    setApiError('');
    if (!window.IremboPay) {
      setApiError('IremboPay SDK is not loaded yet. Please try again.');
      return;
    }

    setSubmitting(true);
    const invoiceNumber = await fetchInvoice();
    if (!invoiceNumber) {
      setApiError('Unable to create invoice. Please try again.');
      setSubmitting(false);
      return;
    }

    window.IremboPay.initiate({
      publicKey: IREMBO_PUBLIC_KEY,
      invoiceNumber,
      locale: window.IremboPay.locale.EN,
      callback: async (err) => {
        if (err) {
          setApiError('Payment failed. Please try again.');
          setSubmitting(false);
          return;
        }

        try {
          await activateInlinePayment(invoiceNumber);
          setShowSuccessModal(true);
        } catch (error) {
          setApiError(
            error instanceof Error
              ? error.message
              : 'Payment succeeded, but account activation failed. Please contact support.',
          );
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Select Your Membership Tier</h2>
        <p className="text-gray-500 text-sm">
          Choose the membership plan that best aligns with your company's size and strategic goals.
        </p>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
        {TIERS.map((t) => (
          <TierCard
            key={t.id}
            tier={t}
            selected={tier === t.id}
            onSelect={() => {
              updateTierPayment({ tier: t.id });
              setTierError('');
            }}
          />
        ))}
      </div>
      <div className="mb-4 flex justify-center">
        <button
          type="button"
          onClick={() => setShowBenefitsModal(true)}
          className="rounded-sm bg-[#EAB308] px-8 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#d49e00]"
        >
          View Benefits
        </button>
      </div>
      {tierError && <p className="text-xs text-red-500 mb-4">{tierError}</p>}
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
          {apiError}
        </div>
      )}

      {/* Membership Period */}
      {/* <Card className="mb-5">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Membership Period</h3>
        <p className="text-xs text-gray-500 mb-4">Select how long you want to commit.</p>
        <div className="grid grid-cols-3 gap-3">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => updateTierPayment({ period: p.value })}
              className={[
                'p-4 rounded-sm border-2 text-left transition-all duration-150',
                period === p.value
                  ? 'border-[#EF9F27] bg-amber-50/30'
                  : 'border-gray-200 hover:border-gray-300',
              ].join(' ')}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-900">{p.label}</span>
                {period === p.value && (
                  <div className="w-5 h-5 rounded-full bg-[#EF9F27] flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400">{p.sub}</p>
            </button>
          ))}
        </div>
      </Card> */}

      {/* Payment */}
      <Card className="mb-8">
        <div className="rounded-sm border border-gray-200 bg-white p-4">
          <h4 className="text-2xl font-semibold text-gray-900 mb-2">Payment</h4>
          <p className="text-sm text-gray-500 leading-relaxed mb-5">
            Continue to IremboPay secure checkout and complete your membership payment.
          </p>

          {tier && (
            <div className="mb-5 rounded-sm border border-gray-200 bg-gray-50 px-3.5 py-3">
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                Secure checkout guaranteed. Total amount to be charged:
                <span className="font-bold text-gray-900">RWF {totalAmount.toLocaleString()}</span>
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isSdkReady || submitting || !tier}
            className="w-full flex items-center justify-center gap-2 rounded-sm bg-[#EAB308] px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#d49e00] disabled:opacity-60"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            {submitting ? 'Processing Payment...' : `Pay RWF ${totalAmount.toLocaleString()}`}
          </button>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={prevStep}
          iconLeft={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          }
        >
          Back
        </Button>
        {!tier && (
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            iconRight={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            }
          >
            Save & Continue
          </Button>
        )}
      </div>

      {showBenefitsModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 sm:p-6"
          onClick={() => setShowBenefitsModal(false)}
        >
          <div
            className="relative w-full max-w-5xl rounded-lg bg-white p-3 sm:p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowBenefitsModal(false)}
              className="absolute right-3 top-3 rounded bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow hover:bg-gray-50"
              aria-label="Close benefits image"
            >
              Close
            </button>
            <img
              src="/benefits.png"
              alt="Membership benefits by tier"
              className="mx-auto h-auto max-h-[80vh] w-auto max-w-full rounded object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
