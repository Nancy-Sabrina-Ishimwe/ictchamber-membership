import React, { useState } from 'react';
import { PortalLayout } from '../../../components/membership/portal/PortalLayout';
import { Toggle } from '../../../components/membership/portal/PortalUI';
import { usePortalStore } from '../../../store/portalStore';
import { TIER_LABELS, TIER_PRICES } from '../../../types/portal';

const PAGE_SIZE = 5;

export const PaymentsPage: React.FC = () => {
  const { member, payments, toggleAutomatedReminders } = usePortalStore();
  const [duration, setDuration] = useState<1 | 2>(1);
  const [page, setPage] = useState(0);
  const [processingRenewal, setProcessingRenewal] = useState(false);

  const basePrice = TIER_PRICES[member.tier];
  const renewalPrices = { 1: basePrice, 2: Math.round(basePrice * 1.8) };
  const total = renewalPrices[duration];

  const pageCount = Math.ceil(payments.length / PAGE_SIZE);
  const paginatedPayments = payments.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleRenew = async () => {
    setProcessingRenewal(true);
    await new Promise((r) => setTimeout(r, 1200));
    setProcessingRenewal(false);
  };

  return (
    <PortalLayout title="Payments & Renewals">
      <div className="mx-auto max-w-[1080px]">
        <div className="mb-5">
          <h2 className="text-[22px] font-bold leading-tight text-gray-900">Payments & Renewals</h2>
          <p className="mt-1 text-xs font-semibold text-gray-400">
            Manage your membership status, billing preferences, and view transaction history.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <section className="rounded-sm border border-gray-200 bg-[#FFFFFF] p-4 shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Current Status</h3>
              <span className="text-xs font-medium text-gray-900">Active</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <svg className="h-4 w-4 text-[#EAB308]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>

              <div>
                <p className="text-[11px] font-medium text-gray-400">Membership Tier</p>
                <p className="text-xl font-bold leading-tight text-gray-900">{TIER_LABELS[member.tier]}</p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-0 rounded-sm border border-gray-200 bg-white">
              <div className="border-r border-gray-200 px-3.5 py-3.5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Valid From
                </div>
                <p className="mt-1 text-xs font-semibold text-gray-900">{member.validFrom}</p>
              </div>

              <div className="px-3.5 py-3.5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Next Expiry
                </div>
                <p className="mt-1 text-xs font-semibold text-gray-900">{member.expiryDate}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-sm border border-gray-200 bg-white px-3.5 py-3.5">
              <div>
                <p className="text-xs font-semibold text-gray-900">Automated Reminders</p>
                <p className="text-xs text-gray-500 mt-0.5">Receive emails before expiry.</p>
              </div>
              <Toggle checked={member.automatedReminders} onChange={toggleAutomatedReminders} />
            </div>
          </section>

          <section className="rounded-sm border border-gray-200 bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Renew Membership</h3>
              <p className="mt-1 text-xs font-semibold text-gray-400">Select a plan to extend your {TIER_LABELS[member.tier]} Membership.</p>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="mb-3 text-xs font-semibold text-gray-900">Select Duration</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDuration(1)}
                  className={[
                    'rounded-sm border px-3.5 py-3.5 text-left transition-all',
                    duration === 1 ? 'border-[#EAB308] bg-[#FFF8E6]' : 'border-gray-200 hover:border-gray-300 bg-white',
                  ].join(' ')}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">1 Year Renewal</span>
                    {duration === 1 && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#EAB308] bg-[#EAB308] text-[10px] text-white">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-400">Standard annual term</p>
                  <p className="mt-4 text-lg font-bold uppercase text-gray-900">
                    rwf {renewalPrices[1].toLocaleString()}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDuration(2)}
                  className={[
                    'rounded-sm border px-3.5 py-3.5 text-left transition-all',
                    duration === 2 ? 'border-[#EAB308] bg-[#FFF8E6]' : 'border-gray-200 hover:border-gray-300 bg-white',
                  ].join(' ')}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">2 Year Renewal</span>
                    {duration === 2 && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#EAB308] bg-[#EAB308] text-[10px] text-white">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-400">Save with a longer term</p>
                  <p className="mt-4 text-lg font-bold uppercase text-gray-900">
                    rwf {renewalPrices[2].toLocaleString()}
                  </p>
                </button>
              </div>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Total Due Today</span>
                <span className="text-xl font-bold text-gray-900">RWF {total.toLocaleString()}</span>
              </div>

              <button
                onClick={handleRenew}
                disabled={processingRenewal}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-sm bg-[#EAB308] px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-[#d49e00] disabled:opacity-60"
              >
                {processingRenewal ? 'Processing...' : 'Proceed to Payment'}
                {!processingRenewal && (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                )}
              </button>

              <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-gray-400">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                Secure encrypted checkout
              </div>
            </div>
          </section>

          <section className="col-span-1 rounded-sm bg-white px-4 py-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
              <div>
                <p className="text-xs font-semibold text-gray-900">Need to update payment method?</p>
                <p className="mt-1 text-[11px] text-gray-400">You can add a new card during the renewal checkout process below.</p>
              </div>
            </div>
          </section>

          <section className="xl:col-span-2 overflow-hidden rounded-sm border border-gray-200 bg-white shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 px-4 sm:px-5 py-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Payment History</h3>
                <p className="text-xs text-gray-500 mt-0.5">A record of your past transactions and downloadable invoices.</p>
              </div>
              <button className="flex items-center gap-2 rounded-sm border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 transition-colors hover:border-gray-300 cursor-pointer">
                <svg className="h-3.5 w-3.5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Export All
              </button>
            </div>

            <div className="hidden md:grid grid-cols-[120px_1fr_165px_110px_90px_52px] gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-2.5">
              {['DATE', 'DESCRIPTION', 'METHOD', 'AMOUNT', 'STATUS', 'RECEIPT'].map((h) => (
                <p key={h} className="text-[10px] font-bold tracking-widest text-gray-400">{h}</p>
              ))}
            </div>

            <div className="divide-y divide-gray-100">
              {paginatedPayments.map((p) => (
                <div key={p.id}>
                  <div className="md:hidden px-4 py-3.5 hover:bg-gray-50/40 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{p.description}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p.invoiceId}</p>
                      </div>
                      <span className="inline-flex w-fit rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>{p.date}</span>
                      <span>{p.method}</span>
                      <span className="font-semibold text-gray-900">{p.amount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="hidden md:grid grid-cols-[120px_1fr_165px_110px_90px_52px] gap-3 px-5 py-3.5 items-center hover:bg-gray-50/40 transition-colors">
                    <span className="text-xs font-medium text-gray-400">{p.date}</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{p.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.invoiceId}</p>
                    </div>
                    <span className="text-xs text-gray-400">{p.method}</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {p.amount.toLocaleString()}
                    </span>
                    <span className="inline-flex w-fit rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                    <button className="justify-self-end rounded-sm p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 cursor-pointer">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 px-4 py-2.5">
              <p className="text-xs font-medium text-gray-400">
                Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, payments.length)} of {payments.length} entries
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  disabled={page >= pageCount - 1}
                  className="rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PortalLayout>
  );
};
