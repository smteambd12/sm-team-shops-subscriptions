
import React, { useState, useEffect } from 'react';
import { usePromoCode } from '@/hooks/usePromoCode';
import PromoCodeInput from './PromoCodeInput';

interface OrderSummaryProps {
  subtotal: number;
  onPromoApplied?: (code: string, discount: number) => void;
  onPromoRemoved?: () => void;
  onCheckout: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  subtotal,
  onPromoApplied,
  onPromoRemoved,
  onCheckout
}) => {
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number} | null>(null);

  const total = subtotal - (appliedPromo ? appliedPromo.discount : 0);

  const handlePromoApplied = (code: string, discountAmount: number) => {
    const promoData = { code, discount: discountAmount };
    setAppliedPromo(promoData);
    onPromoApplied?.(code, discountAmount);
  };

  const handlePromoRemoved = () => {
    setAppliedPromo(null);
    onPromoRemoved?.();
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
        />
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-4 sm:mb-6">
        <div className="flex justify-between text-sm sm:text-base">
          <span>সাবটোটাল:</span>
          <span>৳{subtotal.toLocaleString()}</span>
        </div>
        {appliedPromo && appliedPromo.discount > 0 && (
          <div className="flex justify-between text-green-600 text-sm sm:text-base">
            <span>প্রোমো ছাড় ({appliedPromo.code}):</span>
            <span>-৳{appliedPromo.discount.toLocaleString()}</span>
          </div>
        )}
        <div className="border-t pt-3">
          <div className="flex justify-between text-lg sm:text-xl font-bold">
            <span>মোট:</span>
            <span>৳{Math.max(0, total).toLocaleString()}</span>
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
