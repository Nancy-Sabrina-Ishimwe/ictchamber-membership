import React from 'react';
import { useRegistrationStore } from '../../../store/registrationStore';
import { Button } from '../ui/ui';

export const TrustSealModal: React.FC = () => {
  const { formData, updateTrustSeal, setShowTrustSealModal, nextStep } = useRegistrationStore();
  const selected = formData.trustSeal.hasTrustSeal;

  const handleContinue = () => {
    setShowTrustSealModal(false);
    nextStep();
  };

  const handleBack = () => {
    setShowTrustSealModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleBack} />

      <div className="relative w-full max-w-[620px] overflow-hidden rounded-lg bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="px-5 pt-4 pb-3 sm:px-8 sm:pt-6 sm:pb-4">
          <div className="mb-3.5 flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
              <svg className="h-5 w-5 text-[#EF9F27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-[24px] font-bold leading-tight text-center text-gray-900">
            Trust Seal Certification
          </h2>
          <p className="mt-1.5 text-center text-sm leading-relaxed text-gray-500">
            A Trust Seal demonstrates your commitment to data protection and professional standards.
          </p>

          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-900">
              Do you currently hold a valid Data Protection Trust Seal?
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => updateTrustSeal({ hasTrustSeal: true })}
                className={[
                  'relative rounded-xl border px-4 py-4 text-left transition-all duration-150',
                  selected === true
                    ? 'border-[#EF9F27] bg-amber-50/40 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                ].join(' ')}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={[
                      'mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border',
                      selected === true ? 'border-[#EF9F27] bg-white text-[#EF9F27]' : 'border-gray-300 text-gray-300',
                    ].join(' ')}
                  >
                    {selected === true && (
                      <svg className="h-2.5 w-2.5 text-[#EF9F27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Yes, I have one</div>
                    <p className="mt-2 text-xs leading-relaxed text-gray-500">
                      I already hold a valid Trust Seal.
                    </p>
                  </div>
                </div>

                {selected === true && (
                  <span className="absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#EF9F27]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => updateTrustSeal({ hasTrustSeal: false })}
                className={[
                  'relative rounded-xl border px-4 py-4 text-left transition-all duration-150',
                  selected === false
                    ? 'border-[#EF9F27] bg-amber-50/40 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                ].join(' ')}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={[
                      'mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border',
                      selected === false ? 'border-[#EF9F27] bg-white text-[#EF9F27]' : 'border-gray-300 text-gray-300',
                    ].join(' ')}
                  >
                    {selected === false && (
                      <svg className="h-2.5 w-2.5 text-[#EF9F27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">No, I don't</div>
                    <p className="mt-2 text-xs leading-relaxed text-gray-500">
                      I haven't acquired it yet.
                    </p>
                  </div>
                </div>

                {selected === false && (
                  <span className="absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#EF9F27]" />
                )}
              </button>
            </div>

            {selected === false && (
              <div className="mt-5 text-center">
                <a
                  href="https://dbi.rw/certification-2/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 underline underline-offset-4 hover:text-[#EF9F27]"
                >
                  Apply Certificate
                </a>
                <span className="ml-1 text-xs text-gray-500">(optional but recommended for credibility)</span>
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-gray-100" />

          <div className="flex items-center justify-between px-0 pt-2.5 pb-0">
            <Button
              variant="secondary"
              onClick={handleBack}
              iconLeft={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              }
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleContinue}
              disabled={selected === null}
              iconRight={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            >
              Save & Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
