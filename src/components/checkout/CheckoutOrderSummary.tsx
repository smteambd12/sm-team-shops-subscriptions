
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { CartItem } from '@/types';
import { Product } from '@/types';
import PromoCodeInput from '../PromoCodeInput';

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  products: Product[];
  subtotal: number;
  promoDiscount: number;
  finalTotal: number;
  appliedPromoCode: string;
  onPromoApplied: (code: string, discountAmount: number) => void;
  onPromoRemoved: () => void;
}

const CheckoutOrderSummary: React.FC<CheckoutOrderSummaryProps> = ({
  items,
  products,
  subtotal,
  promoDiscount,
  finalTotal,
  appliedPromoCode,
  onPromoApplied,
  onPromoRemoved
}) => {
  const getDurationText = (duration: string) => {
    switch (duration) {
      case '1month': return '১ মাস';
      case '3month': return '৩ মাস';
      case '6month': return '৬ মাস';
      case 'lifetime': return 'লাইফটাইম';
      default: return duration;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            অর্ডার সামারি
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => {
            const product = products.find(p => p.id === item.productId);
            const pkg = product?.packages.find(p => p.id === item.packageId);
            
            if (!product || !pkg) {
              return null;
            }

            return (
              <div key={`${item.productId}-${item.packageId}`} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    src={product.image || 'https://via.placeholder.com/60x60'}
                    alt={product.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-medium text-sm sm:text-base">{product.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {getDurationText(pkg.duration)} × {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm sm:text-base">৳{(pkg.price * item.quantity).toLocaleString()}</p>
                  {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                    <p className="text-xs text-gray-500 line-through">৳{(pkg.originalPrice * item.quantity).toLocaleString()}</p>
                  )}
                </div>
              </div>
            );
          })}
          
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>সাবটোটাল:</span>
              <span>৳{subtotal.toLocaleString()}</span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>প্রোমো ছাড়:</span>
                <span>-৳{promoDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>মোট:</span>
              <span>৳{finalTotal.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <PromoCodeInput
        orderAmount={subtotal}
        onPromoApplied={onPromoApplied}
        onPromoRemoved={onPromoRemoved}
        appliedPromo={appliedPromoCode ? {code: appliedPromoCode, discount: promoDiscount} : null}
      />
    </div>
  );
};

export default CheckoutOrderSummary;
