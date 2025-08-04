
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface PromoCodeResult {
  valid: boolean;
  discount_amount?: number;
  code?: string;
  message?: string;
  user_promo_id?: string;
}

export const usePromoCode = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount_amount: number;
    user_promo_id?: string;
  } | null>(null);

  const validatePromoCode = async (code: string, orderAmount: number): Promise<PromoCodeResult | null> => {
    if (!code.trim()) {
      toast.error('প্রোমো কোড খালি থাকতে পারে না');
      return null;
    }

    if (!user) {
      toast.error('প্রোমো কোড ব্যবহারের জন্য লগইন করুন');
      return null;
    }

    try {
      setLoading(true);
      console.log('Validating user promo code:', { code: code.trim().toUpperCase(), orderAmount });
      
      // First try to validate user's purchased promo codes
      const { data: userPromoData, error: userPromoError } = await supabase.rpc('validate_user_promo_code', {
        p_code: code.trim().toUpperCase(),
        p_order_amount: orderAmount,
        p_user_id: user.id
      });

      console.log('User promo validation response:', { data: userPromoData, error: userPromoError });

      if (!userPromoError && userPromoData) {
        let result: PromoCodeResult;
        
        if (typeof userPromoData === 'string') {
          try {
            result = JSON.parse(userPromoData) as PromoCodeResult;
          } catch (parseError) {
            console.error('Error parsing user promo JSON response:', parseError);
            // Fall back to regular promo code validation
          }
        } else {
          result = userPromoData as PromoCodeResult;
        }
        
        if (result && result.valid) {
          setAppliedPromo({
            code: result.code || code,
            discount_amount: result.discount_amount || 0,
            user_promo_id: result.user_promo_id
          });
          toast.success(`🎉 অভিনন্দন! ৳${result.discount_amount} ছাড় প্রয়োগ হয়েছে।`);
          return result;
        }
      }

      // If user promo code validation fails, try regular promo codes
      const { data, error } = await supabase.rpc('validate_promo_code', {
        code_text: code.trim().toUpperCase(),
        order_amount: orderAmount
      });

      console.log('Regular promo validation response:', { data, error });

      if (error) {
        console.error('Promo validation error:', error);
        toast.error('প্রোমো কোড যাচাই করতে সমস্যা হয়েছে।');
        return null;
      }

      // Handle different types of responses
      let result: PromoCodeResult;
      
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          result = parsed as PromoCodeResult;
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          toast.error('প্রোমো কোড যাচাই করতে সমস্যা হয়েছে।');
          return null;
        }
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        result = data as unknown as PromoCodeResult;
      } else {
        console.error('Unexpected data type from promo validation:', typeof data, data);
        toast.error('প্রোমো কোড যাচাই করতে সমস্যা হয়েছে।');
        return null;
      }
      
      console.log('Parsed promo result:', result);
      
      // Validate the result structure
      if (!result || typeof result !== 'object' || typeof result.valid !== 'boolean') {
        console.error('Invalid result structure:', result);
        toast.error('প্রোমো কোড যাচাই করতে সমস্যা হয়েছে।');
        return null;
      }
      
      if (result.valid && result.discount_amount && result.discount_amount > 0) {
        setAppliedPromo({
          code: result.code || code,
          discount_amount: result.discount_amount
        });
        toast.success(`🎉 অভিনন্দন! ৳${result.discount_amount} ছাড় প্রয়োগ হয়েছে।`);
      } else {
        toast.error(result.message || 'প্রোমো কোড অবৈধ বা মেয়াদ শেষ।');
      }

      return result;
    } catch (error) {
      console.error('Error validating promo code:', error);
      toast.error('প্রোমো কোড যাচাই করতে সমস্যা হয়েছে।');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    toast.success('প্রোমো কোড সরানো হয়েছে।');
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

  const markUserPromoAsUsed = async (code: string, orderId: string) => {
    if (!user || !appliedPromo?.user_promo_id) return;

    try {
      console.log('Marking user promo code as used:', { code, orderId });
      const { error } = await supabase.rpc('mark_promo_code_used', {
        p_code: code,
        p_user_id: user.id,
        p_order_id: orderId
      });
      
      if (error) {
        console.error('Error marking user promo as used:', error);
        throw error;
      }
      
      console.log('User promo code marked as used successfully');
    } catch (error) {
      console.error('Error marking user promo as used:', error);
    }
  };

  return {
    loading,
    appliedPromo,
    validatePromoCode,
    removePromoCode,
    incrementPromoUsage,
    markUserPromoAsUsed
  };
};
