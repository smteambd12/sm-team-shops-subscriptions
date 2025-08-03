
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X, Tag, Loader2, CheckCircle, Gift } from 'lucide-react';
import { usePromoCode } from '@/hooks/usePromoCode';

interface PromoCodeInputProps {
  orderAmount: number;
  onPromoApplied: (code: string, discountAmount: number) => void;
  onPromoRemoved: () => void;
  appliedPromo?: {code: string, discount: number} | null;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  orderAmount,
  onPromoApplied,
  onPromoRemoved,
  appliedPromo
}) => {
  const [promoInput, setPromoInput] = useState('');
  const { loading, validatePromoCode, removePromoCode } = usePromoCode();

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) {
      return;
    }
    
    console.log('Applying promo code:', promoInput, 'for amount:', orderAmount);
    
    const result = await validatePromoCode(promoInput.trim().toUpperCase(), orderAmount);
    console.log('Promo validation result:', result);
    
    if (result?.valid && result.discount_amount) {
      onPromoApplied(result.code || promoInput.trim().toUpperCase(), result.discount_amount);
      setPromoInput('');
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    onPromoRemoved();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleApplyPromo();
    }
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg">
      <CardContent className="p-4">
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-purple-700 font-semibold text-base">
            <Gift className="h-5 w-5 text-purple-600" />
            🎉 প্রোমো কোড দিয়ে বিশেষ ছাড় পান
          </Label>
          
          {appliedPromo ? (
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-full">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-green-800 text-lg">{appliedPromo.code}</p>
                  <p className="text-sm text-green-700 font-medium">
                    🎉 অভিনন্দন! আপনি ৳{appliedPromo.discount.toLocaleString()} ছাড় পেয়েছেন!
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemovePromo}
                className="h-8 w-8 p-0 text-green-700 hover:text-red-600 hover:bg-red-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                  <Input
                    placeholder="প্রোমো কোড লিখুন (যেমন: SAVE20, DISCOUNT50)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    className="pl-10 border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-white text-purple-800 font-medium"
                  />
                </div>
                <Button
                  onClick={handleApplyPromo}
                  disabled={!promoInput.trim() || loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 font-semibold transition-all duration-200 hover:shadow-lg"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    '✨ প্রয়োগ'
                  )}
                </Button>
              </div>
              
              <div className="bg-purple-100 rounded-lg p-3 border border-purple-200">
                <div className="flex items-start gap-2">
                  <Gift className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-purple-700">
                    <p className="font-medium mb-1">🔥 বিশেষ অফার:</p>
                    <ul className="space-y-1">
                      <li>• SAVE10 - ১০% ছাড় পান</li>
                      <li>• MEGA20 - ২০% ছাড় পান</li>
                      <li>• SUPER50 - ৫০ টাকা ছাড়</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PromoCodeInput;
