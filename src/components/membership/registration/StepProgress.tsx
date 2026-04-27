import React from 'react';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const StepProgress: React.FC<StepProgressProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="mb-8">
      <p className="text-sm text-gray-500 mb-2">
        Step {currentStep} of {totalSteps}
      </p>
      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full overflow-hidden bg-gray-200"
          >
            <div
              className={[
                'h-full rounded-full transition-all duration-500',
                i < currentStep ? 'bg-[#EF9F27] w-full' : 'w-0',
              ].join(' ')}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
