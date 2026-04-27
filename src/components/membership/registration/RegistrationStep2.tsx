import React, { useState } from 'react';
import { useRegistrationStore } from '../../../store/registrationStore';
import { TIER_PRICES } from '../../../types/registration';
import type { MembershipTier, PaymentMethod } from '../../../types/registration';
import { Input, Button, Card } from '../ui/ui';
import { registerApi, demoMembershipPaymentApi } from '../../../services/authService';

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

// ─── Payment: Credit Card ─────────────────────────────────────────────────────
const CardPayment: React.FC<{
  totalAmount: number;
  submitting: boolean;
  onSubmit: () => void;
}> = ({ totalAmount, submitting, onSubmit }) => {
  const { formData, updateTierPayment } = useRegistrationStore();
  const details = formData.tierPayment.cardDetails ?? { nameOnCard: '', cardNumber: '', expiry: '', cvc: '' };

  const update = (field: string, value: string) =>
    updateTierPayment({ cardDetails: { ...details, [field]: value } });

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-5">
      <div className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4">
        <div>
          <h4 className="text-2xl font-semibold text-gray-900 mb-2">Credit or Debit Card</h4>
          <p className="text-sm text-gray-500 leading-relaxed">
            All card transactions are securely processed via our 256-bit encrypted payment gateway. Your card details are never stored on our servers.
          </p>
          <div className="flex gap-2 mt-4">
            {['VISA', 'MC', 'AMEX'].map((c) => (
              <span key={c} className="px-2 py-1 border border-gray-200 rounded text-[10px] font-bold text-gray-500 bg-gray-50">
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-sm border border-gray-200 bg-gray-50 px-3.5 py-3">
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            Secure checkout guaranteed. Total amount to be charged:
            <span className="font-bold text-gray-900">RWF {totalAmount.toLocaleString()}</span>
          </p>
        </div>
      </div>

      <div className="rounded-sm border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Name on Card"
            placeholder="e.g. John Doe"
            value={details.nameOnCard}
            onChange={(e) => update('nameOnCard', e.target.value)}
          />
          <Input
            label="Card Number"
            placeholder="0000 0000 0000 0000"
            value={details.cardNumber}
            onChange={(e) => update('cardNumber', formatCardNumber(e.target.value))}
            maxLength={19}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Expiry Date"
              placeholder="MM/YY"
              value={details.expiry}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                update('expiry', v.length > 2 ? `${v.slice(0,2)}/${v.slice(2)}` : v);
              }}
              maxLength={5}
            />
            <Input
              label="Security Code (CVC)"
              placeholder="123"
              type="password"
              value={details.cvc}
              onChange={(e) => update('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
            />
          </div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="mt-1 w-full flex items-center justify-center gap-2 rounded-sm bg-[#EAB308] px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#d49e00] disabled:opacity-60"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            {submitting ? 'Processing Payment...' : `Pay RWF ${totalAmount.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Payment: Mobile Money ────────────────────────────────────────────────────
const MobileMoneyPayment: React.FC = () => {
  const { formData, updateTierPayment } = useRegistrationStore();
  const details = formData.tierPayment.mobileMoneyDetails ?? { phone: '', provider: 'MTN' };

  const update = (field: string, value: string) =>
    updateTierPayment({ mobileMoneyDetails: { ...details, [field]: value } });

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-900 mb-4">Mobile Money</h4>
      <div className="flex flex-col gap-4">
        {/* Provider */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Provider</label>
          <div className="grid grid-cols-2 gap-3">
            {['MTN', 'Airtel'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => update('provider', p)}
                className={[
                  'px-4 py-3 rounded-sm border-2 text-sm font-semibold transition-all',
                  details.provider === p
                    ? 'border-[#EF9F27] bg-amber-50/50 text-[#EF9F27]'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300',
                ].join(' ')}
              >
                {p} Mobile Money
              </button>
            ))}
          </div>
        </div>
        <Input
          label="Phone Number"
          placeholder="+250 700 000 000"
          value={details.phone}
          onChange={(e) => update('phone', e.target.value)}
        />
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-sm">
          <p className="text-xs text-blue-700 leading-relaxed">
            You will receive a payment prompt on your phone. Please enter your PIN to complete the transaction.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Payment: Bank Transfer ───────────────────────────────────────────────────
const BankTransferPayment: React.FC = () => (
  <div>
    <h4 className="text-sm font-semibold text-gray-900 mb-4">Bank Transfer</h4>
    <div className="p-4 bg-gray-50 rounded-sm border border-gray-200 flex flex-col gap-3">
      {[
        { label: 'Bank Name', value: 'Bank of Kigali' },
        { label: 'Account Name', value: 'Rwanda ICT Chamber' },
        { label: 'Account Number', value: '00012345678901' },
        { label: 'Branch', value: 'KN 4 Ave, Kigali' },
        { label: 'SWIFT Code', value: 'BKIGRWRW' },
      ].map(({ label, value }) => (
        <div key={label} className="flex justify-between text-sm">
          <span className="text-gray-500">{label}</span>
          <span className="font-semibold text-gray-900">{value}</span>
        </div>
      ))}
    </div>
    <p className="text-xs text-gray-500 mt-3 leading-relaxed">
      Please use your company name as the payment reference. Send proof of payment to{' '}
      <span className="text-[#EF9F27]">membership@ictchamber.rw</span> to activate your membership.
    </p>
  </div>
);

// ─── Payment Tab ──────────────────────────────────────────────────────────────
const PAYMENT_TABS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  {
    id: 'card',
    label: 'Credit / Debit Card',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
      </svg>
    ),
  },
  {
    id: 'mobile_money',
    label: 'Mobile Money',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
      </svg>
    ),
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
      </svg>
    ),
  },
];

// ─── Step 2 ────────────────────────────────────────────────────────────────────
export const RegistrationStep2: React.FC = () => {
  const { formData, updateTierPayment, prevStep, setShowSuccessModal } = useRegistrationStore();
  const [submitting, setSubmitting] = useState(false);
  const [tierError, setTierError] = useState('');
  const [apiError, setApiError] = useState('');

  const { tier, period, paymentMethod } = formData.tierPayment;
  const totalAmount = tier ? TIER_PRICES[tier] * period : 0;

  const TIER_LABELS_MAP: Record<MembershipTier, string> = {
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
    platinum: 'Platinum',
  };

  const handleSubmit = async () => {
    if (!tier) {
      setTierError('Please select a membership tier to continue.');
      return;
    }
    setTierError('');
    setApiError('');
    setSubmitting(true);

    const { companyInfo, keyContacts, trustSeal } = formData;

    try {
      // 1. Register user (creates inactive account)
      await registerApi({
        email: companyInfo.email,
        role: 'MEMBER',
        companyName: companyInfo.officialName,
        address: companyInfo.address,
        clusterId: companyInfo.clusterId ?? 1,
        subclusterId: companyInfo.subclusterId ?? 1,
        hasSeal: trustSeal.hasTrustSeal ?? false,
        founders: keyContacts.founders.map(({ fullName, email, phone }) => ({
          fullName,
          email,
          phone,
        })),
        alternateRepresentative: {
          fullName: keyContacts.alternateRep.fullName,
          email: keyContacts.alternateRep.email,
          phone: keyContacts.alternateRep.phone,
          title: keyContacts.alternateRep.role,
        },
        logo: companyInfo.logoFile ?? undefined,
      });

      // 2. Trigger demo payment → activates account + sends email with credentials
      await demoMembershipPaymentApi(companyInfo.email, TIER_LABELS_MAP[tier]);

      setShowSuccessModal(true);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
        {/* Payment method tabs */}
        <div className="flex border-b border-gray-100 mb-6 -mx-6 px-6 gap-1 overflow-x-auto">
          {PAYMENT_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => updateTierPayment({ paymentMethod: tab.id })}
              className={[
                'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-all duration-150',
                paymentMethod === tab.id
                  ? 'border-[#EF9F27] text-[#EF9F27]'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {paymentMethod === 'card' && (
          <CardPayment
            totalAmount={totalAmount}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        )}
        {paymentMethod === 'mobile_money' && <MobileMoneyPayment />}
        {paymentMethod === 'bank_transfer' && <BankTransferPayment />}

        {/* Amount summary */}
        {tier && paymentMethod !== 'card' && (
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              Secure checkout guaranteed. Total amount to be charged:
            </div>
            <span className="text-sm font-bold text-gray-900">
              RWF {totalAmount.toLocaleString()}
            </span>
          </div>
        )}
      </Card>

      {/* Pay button */}
      {tier && paymentMethod !== 'card' && (
        <Button
          variant="primary"
          size="lg"
          className="w-full mb-8 py-4 text-base"
          loading={submitting}
          onClick={handleSubmit}
          iconLeft={
            !submitting ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            ) : undefined
          }
        >
          {submitting ? 'Processing Payment...' : `Pay RWF ${totalAmount.toLocaleString()}`}
        </Button>
      )}

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
    </div>
  );
};
