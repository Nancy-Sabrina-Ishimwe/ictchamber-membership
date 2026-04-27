import React from 'react';
import { useRegistrationStore } from '../../store/registrationStore';
import { StepProgress } from '../../components/membership/registration/StepProgress';
import {
  RegistrationNav,
  RegistrationBanner,
  RegistrationFooter,
} from '../../components/membership/registration/RegistrationLayout';
import { RegistrationStep1 } from '../../components/membership/registration/RegistrationStep1';
import { RegistrationStep2 } from '../../components/membership/registration/RegistrationStep2';
import { TrustSealModal } from '../../components/membership/registration/TrustSealModal';
import { RegistrationCompleteModal } from '../../components/membership/registration/RegistrationCompleteModal';

export const RegistrationPage: React.FC = () => {
  const { step, showTrustSealModal, showSuccessModal } = useRegistrationStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <RegistrationNav />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <RegistrationBanner />
          <StepProgress currentStep={step} totalSteps={2} />
          {step === 1 && <RegistrationStep1 />}
          {step === 2 && <RegistrationStep2 />}
        </div>
      </main>
      <RegistrationFooter />
      {showTrustSealModal && <TrustSealModal />}
      {showSuccessModal && <RegistrationCompleteModal />}
    </div>
  );
};
