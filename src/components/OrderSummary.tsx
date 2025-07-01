
import React, { useState } from 'react';
import { toast } from 'sonner';

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
  const [promoCode, setPromoCode] = useState('');

  const promoDiscount = appliedPromo ? appliedPromo.discount : 0;
  const total = subtotal - promoDiscount;

  const handleApplyPromo = () => {
    // প্রোমো কোড যাচাইয়ের লজিক পরে যোগ করা হবে
    toast.error('প্রোমো কোড ফিচার শীঘ্রই আসছে!');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 sticky top-4">
      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">অর্ডার সামারি</h2>
      
      {/* Promo Code */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">প্রোমো কোড</label>
        <div className="flex">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="প্রোমো কোড লিখুন"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
          />
          <button
            onClick={handleApplyPromo}
            className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-r-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
          >
            প্রয়োগ
          </button>
        </div>
        {appliedPromo && (
          <p className="text-green-600 text-sm mt-2">✓ {appliedPromo.code} প্রয়োগ হয়েছে</p>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-4 sm:mb-6">
        <div className="flex justify-between text-sm sm:text-base">
          <span>সাবটোটাল:</span>
          <span>৳{subtotal}</span>
        </div>
        {appliedPromo && (
          <div className="flex justify-between text-green-600 text-sm sm:text-base">
            <span>প্রোমো ছাড়:</span>
            <span>-৳{promoDiscount}</span>
          </div>
        )}
        <div className="border-t pt-3">
          <div className="flex justify-between text-lg sm:text-xl font-bold">
            <span>মোট:</span>
            <span>৳{total}</span>
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
