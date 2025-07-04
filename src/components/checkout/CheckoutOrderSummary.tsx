
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Trash2, Plus, Minus, ShoppingCart, Tag, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import PromoCodeInput from '@/components/PromoCodeInput';
import type { CartItem } from '@/types';

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  products: any[];
  subtotal: number;
  promoDiscount: number;
  finalTotal: number;
  appliedPromoCode: string;
  onPromoApplied: (code: string, discount: number) => void;
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
  const { removeFromCart, updateQuantity } = useCart();

  const getDurationLabel = (duration: string) => {
    const labels = {
      '1month': '১ মাস',
      '3month': '৩ মাস',
      '6month': '৬ মাস',
      'lifetime': 'লাইফটাইম'
    };
    return labels[duration as keyof typeof labels] || duration;
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString('bn-BD')}`;
  };

  return (
    <Card className="h-fit sticky top-4">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          অর্ডার সামারি
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Cart Items - Mobile Optimized */}
        <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
          {items.map((item) => {
            const product = products.find(p => p.id === item.productId);
            const pkg = product?.packages.find(p => p.id === item.packageId);
            
            if (!product || !pkg) return null;

            return (
              <div key={`${item.productId}-${item.packageId}`} className="p-3 bg-gray-50 rounded-lg border">
                {/* Mobile-first layout */}
                <div className="space-y-3">
                  {/* Product Image and Info */}
                  <div className="flex items-start gap-3">
                    {product.image && (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm sm:text-base text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getDurationLabel(pkg.duration)}
                        </Badge>
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(pkg.price)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Remove button - Always visible on mobile */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.productId, item.packageId)}
                      className="p-1 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quantity Controls and Total */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">পরিমাণ:</span>
                      <div className="flex items-center gap-1 border rounded-md">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.packageId, Math.max(1, item.quantity - 1))}
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.packageId, item.quantity + 1)}
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(pkg.price * item.quantity)}
                      </p>
                      {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                        <p className="text-xs text-gray-500 line-through">
                          {formatCurrency(pkg.originalPrice * item.quantity)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Promo Code Section - Mobile Optimized */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">প্রোমো কোড</span>
          </div>
          
          {appliedPromoCode ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-600">
                  {appliedPromoCode}
                </Badge>
                <span className="text-sm text-green-700">
                  ছাড়: {formatCurrency(promoDiscount)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onPromoRemoved}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <PromoCodeInput
              onPromoApplied={onPromoApplied}
              orderAmount={subtotal}
            />
          )}
        </div>

        <Separator />

        {/* Order Summary - Mobile Optimized */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">সাবটোটাল:</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          
          {promoDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">প্রোমো ছাড়:</span>
              <span className="font-medium text-green-600">-{formatCurrency(promoDiscount)}</span>
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between text-base sm:text-lg font-bold">
            <span>সর্বমোট:</span>
            <span className="text-blue-600">{formatCurrency(finalTotal)}</span>
          </div>
        </div>

        {/* Mobile-specific notice */}
        <Alert className="mt-4">
          <Package className="h-4 w-4" />
          <AlertDescription className="text-xs sm:text-sm">
            অর্ডার করার পর আপনি আপনার সাবস্ক্রিপশন অ্যাক্সেস পাবেন।
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default CheckoutOrderSummary;
