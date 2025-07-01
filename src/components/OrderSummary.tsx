
import React, { useState } from 'react';
import PromoCodeInput from './PromoCodeInput';

interface OrderSummaryProps {
  subtotal: number;
  appliedPromo: {code: string, discount: number} | null;
  onCheckout: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  subtotal,
  appliedPromo,
  onCheckout
}) => {
  const [localPromoDiscount, setLocalPromoDiscount] = useState(0);
  const [localAppliedPromoCode, setLocalAppliedPromoCode] = useState('');

  // Use local promo state if available, otherwise use prop
  const promoDiscount = localPromoDiscount || (appliedPromo ? appliedPromo.discount : 0);
  const appliedPromoData = localAppliedPromoCode ? 
    { code: localAppliedPromoCode, discount: localPromoDiscount } : 
    appliedPromo;
  
  const total = Math.max(0, subtotal - promoDiscount);

  console.log('OrderSummary state:', {
    subtotal,
    promoDiscount,
    total,
    appliedPromoData
  });

  const handlePromoApplied = (code: string, discountAmount: number) => {
    console.log('Promo applied:', { code, discountAmount });
    setLocalAppliedPromoCode(code);
    setLocalPromoDiscount(discountAmount);
  };

  const handlePromoRemoved = () => {
    console.log('Promo removed');
    setLocalAppliedPromoCode('');
    setLocalPromoDiscount(0);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 sticky top-4">
      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">অর্ডার সামারি</h2>
      
      {/* Promo Code */}
      <div className="mb-4 sm:mb-6">
        <PromoCodeInput
          orderAmount={subtotal}
          onPromoApplied={handlePromoApplied}
          onPromoRemoved={handlePromoRemoved}
          appliedPromo={appliedPromoData}
        />
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-4 sm:mb-6">
        <div className="flex justify-between text-sm sm:text-base">
          <span>সাবটোটাল:</span>
          <span>৳{subtotal.toLocaleString()}</span>
        </div>
        {promoDiscount > 0 && (
          <div className="flex justify-between text-green-600 text-sm sm:text-base">
            <span>প্রোমো ছাড়:</span>
            <span>-৳{promoDiscount.toLocaleString()}</span>
          </div>
        )}
        <div className="border-t pt-3">
          <div className="flex justify-between text-lg sm:text-xl font-bold">
            <span>মোট:</span>
            <span>৳{total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 sm:py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
      >
        চেকআউট করুন
      </button>
    </div>
  );
};

export default OrderSummary;
