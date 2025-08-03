
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Gift, ShoppingCart, Percent } from 'lucide-react';
import { useCoins } from '@/hooks/useCoins';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const PromoCodeShop = () => {
  const { user } = useAuth();
  const { coins, purchasablePromoCodes, loading, purchasePromoCode } = useCoins();

  const handlePurchase = async (promoCodeId: string) => {
    if (!user) {
      toast.error('প্রোমো কোড কিনতে প্রথমে লগইন করুন।');
      return;
    }

    await purchasePromoCode(promoCodeId);
  };

  const canAfford = (cost: number) => {
    return coins ? coins.total_coins >= cost : false;
  };

  const getDiscountText = (type: string, value: number) => {
    return type === 'percentage' ? `${value}% ছাড়` : `৳${value} ছাড়`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <Gift className="h-6 w-6 text-purple-600" />
          প্রোমো কোড শপ
        </h2>
        <p className="text-gray-600">কয়েন দিয়ে বিশেষ প্রোমো কোড কিনুন</p>
      </div>

      {purchasablePromoCodes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">কোনো প্রোমো কোড নেই</h3>
            <p className="text-gray-500">এই মুহূর্তে কোনো প্রোমো কোড পাওয়া যাচ্ছে না।</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {purchasablePromoCodes.map((promoCode) => (
            <Card key={promoCode.id} className="relative overflow-hidden border-2 hover:border-purple-300 transition-all duration-200">
              {/* Discount Badge */}
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {getDiscountText(promoCode.discount_type, promoCode.discount_value)}
                </Badge>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Percent className="h-5 w-5" />
                  {promoCode.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {promoCode.description && (
                  <p className="text-sm text-gray-600">{promoCode.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">কোড:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                      {promoCode.code}
                    </code>
                  </div>
                  
                  {promoCode.min_order_amount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">সর্বনিম্ন অর্ডার:</span>
                      <span className="text-sm font-medium">৳{promoCode.min_order_amount}</span>
                    </div>
                  )}

                  {promoCode.max_uses && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">বাকি:</span>
                      <span className="text-sm font-medium">
                        {promoCode.max_uses - promoCode.used_count} টি
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">মূল্য:</span>
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold text-yellow-600">{promoCode.coin_cost}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handlePurchase(promoCode.id)}
                    disabled={loading || !canAfford(promoCode.coin_cost) || (promoCode.max_uses && promoCode.used_count >= promoCode.max_uses)}
                    className="w-full"
                    variant={canAfford(promoCode.coin_cost) ? "default" : "secondary"}
                  >
                    {loading ? (
                      'কিনছি...'
                    ) : !canAfford(promoCode.coin_cost) ? (
                      'অপর্যাপ্ত কয়েন'
                    ) : promoCode.max_uses && promoCode.used_count >= promoCode.max_uses ? (
                      'শেষ'
                    ) : (
                      'কিনুন'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromoCodeShop;
