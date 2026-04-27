import React from 'react';
import { PortalLayout } from '../../../components/membership/portal/PortalLayout';
import { BenefitBar } from '../../../components/membership/portal/PortalUI';
import { usePortalStore } from '../../../store/portalStore';
import { TIER_PRICES, TIER_LABELS } from '../../../types/portal';
import type { MembershipTier } from '../../../types/portal';

const TIER_DEFS: {
  id: MembershipTier;
  tagline: string;
  note: string;
  features: string[];
}[] = [
  {
    id: 'bronze',
    tagline: 'Essential access for growing startups.',
    note: 'Core benefits include:',
    features: ['Basic Member Directory Listing', 'Monthly Industry Newsletter', 'Access to Public Chamber Events'],
  },
  {
    id: 'silver',
    tagline: 'Enhanced visibility and networking.',
    note: 'Includes previous tier benefits, plus:',
    features: ['1 Exhibition Booth at Annual Summit', '2 Premium Job Board Postings', 'Standard Support Ticketing'],
  },
  {
    id: 'gold',
    tagline: 'Comprehensive business support.',
    note: 'Includes previous tier benefits, plus:',
    features: ['3 Exhibition Booths at Annual Summit', '10 Hrs Legal/Tax Consultation', 'Priority Email & Phone Support'],
  },
  {
    id: 'platinum',
    tagline: 'Maximum exposure and VIP treatment.',
    note: 'Includes previous tier benefits, plus:',
    features: ['Unlimited Exhibition Space', 'Dedicated Account Manager', 'VIP Gala Dinner Tickets (x4)'],
  },
];

export const BenefitsPage: React.FC = () => {
  const { member, benefitUsage } = usePortalStore();

  return (
    <PortalLayout title="Benefits">
      <div className="mx-auto max-w-[950px]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[22px] font-bold leading-tight text-gray-900">My Benefits</h2>
            <p className="mt-1 text-xs text-gray-400">Manage your membership perks and track usage.</p>
          </div>
          <button className="flex items-center gap-2 rounded-sm border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-900 transition-colors hover:border-gray-300">
            <svg className="h-3 w-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Download Benefits Guide
          </button>
        </div>

        <div className="mb-7 overflow-hidden rounded-sm border border-gray-200 bg-white p-4 sm:p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
            <div>
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.25em] text-gray-400">CURRENT STATUS</p>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                  <svg className="h-4 w-4 text-[#EAB308]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold leading-none text-gray-900">{TIER_LABELS[member.tier]}</span>
                  <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-900">Active</span>
                </div>
              </div>

              <div className="mb-5 flex w-fit items-center gap-2 rounded-sm border border-gray-200 bg-white px-3 py-2">
                <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span className="text-[11px] text-gray-400">
                  Renews on <span className="font-semibold text-gray-900">{member.expiryDate}</span>
                </span>
              </div>

              <p className="max-w-md text-xs leading-5 text-gray-400">
                You are currently enjoying our comprehensive business support tier. Make sure to utilize all your allocated benefits before the renewal period.
              </p>
            </div>

            <div className="pt-0 lg:pt-7">
              <div className="mb-3 flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
                <h3 className="text-sm font-semibold text-gray-900">Benefit Usage this Year</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {benefitUsage.map((b) => (
                  <BenefitBar key={b.label} label={b.label} used={b.used} total={b.total} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-[20px] font-bold text-gray-900">Membership Tiers</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {TIER_DEFS.map((tier) => {
            const isCurrent = tier.id === member.tier;
            const isUpgrade = ['bronze', 'silver', 'gold', 'platinum'].indexOf(tier.id) >
              ['bronze', 'silver', 'gold', 'platinum'].indexOf(member.tier);

            return (
              <div
                key={tier.id}
                className={[
                  'relative flex min-h-[400px] flex-col rounded-sm border bg-white p-4',
                  isCurrent ? 'border-[#EAB308]' : 'border-gray-200',
                ].join(' ')}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="whitespace-nowrap rounded-full bg-[#EAB308] px-3 py-1 text-[10px] font-semibold text-black">
                      Your Current Plan
                    </span>
                  </div>
                )}

                <div className="mb-3">
                  <h4 className="mb-2 text-lg font-bold text-gray-900">
                    {tier.id.charAt(0).toUpperCase() + tier.id.slice(1)}
                  </h4>
                  <div className="mb-3 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-gray-900">
                      {TIER_PRICES[tier.id].toLocaleString()}
                    </span>
                    <span className="text-[11px] text-gray-400">/ year</span>
                  </div>
                  <p className="text-[11px] leading-5 text-gray-400">{tier.tagline}</p>
                </div>

                <div className="flex-1">
                  <p className="border-t border-gray-200 pt-3 text-[11px] font-semibold text-gray-900">{tier.note}</p>
                  <ul className="mt-3 flex flex-col gap-2.5">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[11px] leading-5 text-gray-400">
                        <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#EAB308]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5">
                  {isCurrent ? (
                    <button className="w-full rounded-sm border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-400" type="button">
                      Current Tier Active
                    </button>
                  ) : isUpgrade ? (
                    <button className="flex w-full items-center justify-center rounded-sm bg-[#EAB308] px-4 py-2 text-xs font-semibold text-black transition-all hover:bg-[#d49e00] cursor-pointer" type="button">
                      Upgrade to {tier.id.charAt(0).toUpperCase() + tier.id.slice(1)}
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  ) : (
                    <button className="w-full rounded-sm border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-900 transition-colors hover:border-gray-300 cursor-pointer" type="button">
                      Switch to {tier.id.charAt(0).toUpperCase() + tier.id.slice(1)}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 pt-3.5">
          <p className="text-xs text-gray-400">© 2026 Rwanda ICT Chamber. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            {['Support', 'Privacy Policy', 'Terms of Service'].map((l) => (
              <a key={l} href="#" className="text-xs text-gray-400 transition-colors hover:text-gray-600">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};
