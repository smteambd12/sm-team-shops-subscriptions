
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X, Tag, Loader2 } from 'lucide-react';
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
    
    const result = await validatePromoCode(promoInput, orderAmount);
    console.log('Promo validation result:', result);
    
    if (result?.valid) {
      onPromoApplied(result.code || promoInput, result.discount_amount || 0);
      setPromoInput('');
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    onPromoRemoved();
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            প্রোমো কোড
          </Label>
          
          {appliedPromo ? (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="font-medium text-green-800">{appliedPromo.code}</p>
                <p className="text-sm text-green-600">
                  ৳{appliedPromo.discount.toLocaleString()} ছাড় পেয়েছেন
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemovePromo}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="প্রোমো কোড লিখুন"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
              />
              <Button
                onClick={handleApplyPromo}
                disabled={!promoInput.trim() || loading}
                variant="outline"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'প্রয়োগ'
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PromoCodeInput;
