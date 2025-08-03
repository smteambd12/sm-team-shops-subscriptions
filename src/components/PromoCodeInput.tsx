
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X, Tag, Loader2, CheckCircle } from 'lucide-react';
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
    if (!promoInput.trim()) return;
    
    console.log('Applying promo code:', promoInput, 'for amount:', orderAmount);
    
    const result = await validatePromoCode(promoInput, orderAmount);
    console.log('Promo validation result:', result);
    
    if (result?.valid && result.discount_amount) {
      onPromoApplied(result.code || promoInput, result.discount_amount);
      setPromoInput('');
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    onPromoRemoved();
  };

  return (
    <Card className="border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardContent className="p-4">
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-purple-700 font-medium">
            <Tag className="h-4 w-4" />
            প্রোমো কোড
          </Label>
          
          {appliedPromo ? (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-bold text-green-800 text-lg">{appliedPromo.code}</p>
                  <p className="text-sm text-green-600">
                    🎉 ৳{appliedPromo.discount.toLocaleString()} ছাড় পেয়েছেন!
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemovePromo}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="প্রোমো কোড লিখুন (যেমন: SAVE20)"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && handleApplyPromo()}
                  disabled={loading}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
                <Button
                  onClick={handleApplyPromo}
                  disabled={!promoInput.trim() || loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'প্রয়োগ'
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Tag size={10} />
                বিশেষ ছাড়ের জন্য প্রোমো কোড ব্যবহার করুন
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PromoCodeInput;
