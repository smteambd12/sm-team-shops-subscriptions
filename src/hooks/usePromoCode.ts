
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
        toast({
          title: "ত্রুটি",
          description: "প্রোমো কোড যাচাই করতে সমস্যা হয়েছে।",
          variant: "destructive",
        });
        return null;
      }

      // Handle the response data
      let result: PromoCodeResult;
      
      if (typeof data === 'string') {
        try {
          result = JSON.parse(data) as PromoCodeResult;
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          toast({
            title: "ত্রুটি",
            description: "প্রোমো কোড যাচাই করতে সমস্যা হয়েছে।",
            variant: "destructive",
          });
          return null;
        }
      } else if (typeof data === 'object' && data !== null) {
        result = data as PromoCodeResult;
      } else {
        console.error('Unexpected data type from promo validation:', typeof data, data);
        toast({
          title: "ত্রুটি",
          description: "প্রোমো কোড যাচাই করতে সমস্যা হয়েছে।",
          variant: "destructive",
        });
        return null;
      }
      
      console.log('Parsed promo result:', result);
      
      // Validate the result structure
      if (typeof result !== 'object' || result === null || typeof result.valid !== 'boolean') {
        console.error('Invalid result structure:', result);
        toast({
          title: "ত্রুটি",
          description: "প্রোমো কোড যাচাই করতে সমস্যা হয়েছে।",
          variant: "destructive",
        });
        return null;
      }
      
      if (result.valid && result.discount_amount) {
        setAppliedPromo({
          code: result.code || code,
          discount_amount: result.discount_amount
        });
        toast({
          title: "সফল!",
          description: `৳${result.discount_amount} ছাড় প্রয়োগ হয়েছে।`,
        });
      } else {
        toast({
          title: "প্রোমো কোড ত্রুটি",
          description: result.message || "প্রোমো কোড অবৈধ বা মেয়াদ শেষ।",
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
