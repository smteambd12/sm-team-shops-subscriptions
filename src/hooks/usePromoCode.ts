
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PromoCodeResult {
  valid: boolean;
  discount_amount?: number;
  code?: string;
  message?: string;
}

export const usePromoCode = () => {
  const [loading, setLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount_amount: number;
  } | null>(null);
  const { toast } = useToast();

  const validatePromoCode = async (code: string, orderAmount: number): Promise<PromoCodeResult | null> => {
    if (!code.trim()) return null;

    try {
      setLoading(true);
      console.log('Validating promo code:', { code: code.trim().toUpperCase(), orderAmount });
      
      const { data, error } = await supabase.rpc('validate_promo_code', {
        code_text: code.trim().toUpperCase(),
        order_amount: orderAmount
      });

      console.log('Promo validation response:', { data, error });

      if (error) {
        console.error('Promo validation error:', error);
        throw error;
      }

      // Parse the JSON response
      let result: PromoCodeResult;
      if (typeof data === 'string') {
        result = JSON.parse(data);
      } else {
        result = data;
      }
      
      console.log('Parsed promo result:', result);
      
      if (result.valid) {
        setAppliedPromo({
          code: result.code || code,
          discount_amount: result.discount_amount || 0
        });
        toast({
          title: "প্রোমো কোড প্রয়োগ হয়েছে!",
          description: `৳${result.discount_amount} ছাড় পেয়েছেন।`,
        });
      } else {
        toast({
          title: "প্রোমো কোড ত্রুটি",
          description: result.message || "প্রোমো কোড অবৈধ",
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      console.error('Error validating promo code:', error);
      toast({
        title: "ত্রুটি",
        description: "প্রোমো কোড যাচাই করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    toast({
      title: "প্রোমো কোড সরানো হয়েছে",
      description: "প্রোমো কোড বাতিল করা হয়েছে।",
    });
  };

  const incrementPromoUsage = async (code: string) => {
    try {
      console.log('Incrementing promo usage for code:', code);
      const { error } = await supabase.rpc('increment_promo_usage', {
        promo_code: code
      });
      
      if (error) {
        console.error('Error incrementing promo usage:', error);
        throw error;
      }
      
      console.log('Promo usage incremented successfully');
    } catch (error) {
      console.error('Error incrementing promo usage:', error);
    }
  };

  return {
    loading,
    appliedPromo,
    validatePromoCode,
    removePromoCode,
    incrementPromoUsage
  };
};
