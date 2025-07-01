
import React from 'react';
import CheckoutForm from './CheckoutForm';

interface CheckoutSectionProps {
  appliedPromo?: {code: string, discount: number} | null;
  onGoBack: () => void;
}

const CheckoutSection: React.FC<CheckoutSectionProps> = ({ appliedPromo, onGoBack }) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <CheckoutForm appliedPromo={appliedPromo} />
      <button
        onClick={onGoBack}
        className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
      >
        ফিরে যান
      </button>
    </div>
  );
};

export default CheckoutSection;
