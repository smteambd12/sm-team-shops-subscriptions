
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { OrderCommunication } from '@/types/communications';

export const useOrderCommunications = (orderId: string) => {
  const { user } = useAuth();
  const [communications, setCommunications] = useState<OrderCommunication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && orderId) {
      console.log('useOrderCommunications: Starting fetch for order:', orderId, 'user:', user.id);
      fetchCommunications();
    } else {
      console.log('useOrderCommunications: Missing user or orderId', { user: !!user, orderId });
      setLoading(false);
    }
  }, [user, orderId]);

  const fetchCommunications = async () => {
    if (!user || !orderId) {
      console.log('fetchCommunications: Missing prerequisites', { user: !!user, orderId });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching communications for order:', orderId, 'user:', user.id);
      
      const { data, error } = await supabase
        .from('order_communications')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching communications:', error);
        toast.error('মেসেজ লোড করতে সমস্যা হয়েছে: ' + error.message);
        setCommunications([]);
        return;
      }
      
      console.log('Communications fetched successfully:', data?.length || 0, 'messages');
      setCommunications(data || []);
    } catch (error: any) {
      console.error('Unexpected error fetching communications:', error);
      toast.error('মেসেজ লোড করতে অপ্রত্যাশিত সমস্যা হয়েছে');
      setCommunications([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    communications,
    loading,
    refetch: fetchCommunications,
  };
};
