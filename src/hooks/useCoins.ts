
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserCoins {
  id: string;
  user_id: string;
  total_coins: number;
  earned_coins: number;
  spent_coins: number;
  created_at: string;
  updated_at: string;
}

interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'earned' | 'spent' | 'admin_added' | 'admin_removed';
  source: string;
  description?: string;
  created_at: string;
}

interface PurchasablePromoCode {
  id: string;
  code: string;
  title: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  coin_cost: number;
  min_order_amount: number;
  max_uses?: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCoins = () => {
  const { user } = useAuth();
  const [coins, setCoins] = useState<UserCoins | null>(null);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [purchasablePromoCodes, setPurchasablePromoCodes] = useState<PurchasablePromoCode[]>([]);
  const [userPromoCodes, setUserPromoCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's coin balance
  const fetchCoins = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_coins')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCoins(data);
    } catch (error) {
      console.error('Error fetching coins:', error);
    }
  };

  // Fetch coin transactions
  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Fetch purchasable promo codes
  const fetchPurchasablePromoCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('purchasable_promo_codes')
        .select('*')
        .eq('is_active', true)
        .order('coin_cost', { ascending: true });

      if (error) throw error;
      setPurchasablePromoCodes(data || []);
    } catch (error) {
      console.error('Error fetching purchasable promo codes:', error);
    }
  };

  // Fetch user's purchased promo codes
  const fetchUserPromoCodes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_promo_codes')
        .select('*, purchasable_promo_codes(*)')
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      setUserPromoCodes(data || []);
    } catch (error) {
      console.error('Error fetching user promo codes:', error);
    }
  };

  // Purchase promo code with coins
  const purchasePromoCode = async (promoCodeId: string): Promise<boolean> => {
    if (!user) {
      toast.error('লগইন প্রয়োজন');
      return false;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('purchase_promo_code', {
        p_user_id: user.id,
        p_promo_code_id: promoCodeId
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string; code?: string };

      if (result.success) {
        toast.success(`প্রোমো কোড সফলভাবে কিনেছেন: ${result.code}`);
        await Promise.all([
          fetchCoins(),
          fetchTransactions(),
          fetchUserPromoCodes(),
          fetchPurchasablePromoCodes()
        ]);
        return true;
      } else {
        toast.error(result.message);
        return false;
      }
    } catch (error: any) {
      console.error('Error purchasing promo code:', error);
      toast.error('প্রোমো কোড কিনতে সমস্যা হয়েছে।');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Award coins for activities
  const awardCoins = async (amount: number, source: string, description?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('award_coins', {
        p_user_id: user.id,
        p_amount: amount,
        p_source: source,
        p_description: description
      });

      if (error) throw error;

      await Promise.all([fetchCoins(), fetchTransactions()]);
    } catch (error) {
      console.error('Error awarding coins:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCoins();
      fetchTransactions();
      fetchUserPromoCodes();
    }
    fetchPurchasablePromoCodes();
  }, [user]);

  return {
    coins,
    transactions,
    purchasablePromoCodes,
    userPromoCodes,
    loading,
    fetchCoins,
    fetchTransactions,
    fetchPurchasablePromoCodes,
    fetchUserPromoCodes,
    purchasePromoCode,
    awardCoins
  };
};
