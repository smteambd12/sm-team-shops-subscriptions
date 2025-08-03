
import React from 'react';
import PromoCodeInput from './PromoCodeInput';

interface OrderSummaryProps {
  subtotal: number;
  appliedPromo: {code: string, discount: number} | null;
  onCheckout: () => void;
  onPromoApplied: (code: string, discount: number) => void;
  onPromoRemoved: () => void;
  comboSavings?: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  subtotal,
  appliedPromo,
  onCheckout,
  onPromoApplied,
  onPromoRemoved,
  comboSavings = 0
}) => {
  const promoDiscount = appliedPromo ? appliedPromo.discount : 0;
  const total = Math.max(0, subtotal - promoDiscount);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 sticky top-4">
      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">অর্ডার সামারি</h2>
      
      {/* Promo Code */}
      <div className="mb-4 sm:mb-6">
        <PromoCodeInput
          orderAmount={subtotal}
          onPromoApplied={onPromoApplied}
          onPromoRemoved={onPromoRemoved}
          appliedPromo={appliedPromo}
        />
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-4 sm:mb-6">
        <div className="flex justify-between text-sm sm:text-base">
          <span>সাবটোটাল:</span>
          <span>৳{subtotal.toLocaleString()}</span>
        </div>
        
        {/* Combo Savings Display */}
        {comboSavings > 0 && (
          <div className="flex justify-between text-purple-600 text-sm sm:text-base bg-purple-50 px-3 py-2 rounded-lg">
            <span>🎁 কম্বো সাশ্রয়:</span>
            <span className="font-semibold">-৳{comboSavings.toLocaleString()}</span>
          </div>
        )}
        
        {promoDiscount > 0 && (
          <div className="flex justify-between text-green-600 text-sm sm:text-base bg-green-50 px-3 py-2 rounded-lg">
            <span>🎫 প্রোমো ছাড়:</span>
            <span className="font-semibold">-৳{promoDiscount.toLocaleString()}</span>
          </div>
        )}
        
        <div className="border-t pt-3">
          <div className="flex justify-between text-lg sm:text-xl font-bold">
            <span>মোট:</span>
            <span>৳{total.toLocaleString()}</span>
          </div>
          
          {/* Total Savings Summary */}
          {(comboSavings > 0 || promoDiscount > 0) && (
            <div className="mt-2 text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200">
              <p className="text-sm text-gray-600 mb-1">🎉 মোট সাশ্রয়</p>
              <p className="text-lg font-bold text-green-600">
                ৳{(comboSavings + promoDiscount).toLocaleString()}
              </p>
            </div>
          )}
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
