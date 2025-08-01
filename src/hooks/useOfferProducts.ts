
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OfferProduct } from '@/types/popularProducts';

export const useOfferProducts = () => {
  const [offerProducts, setOfferProducts] = useState<OfferProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOfferProducts();
  }, []);

  const fetchOfferProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching offer products...');
      
      const { data, error } = await supabase
        .from('offer_products')
        .select(`
          *,
          offer_items:offer_product_items(*)
        `)
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      console.log('Offer products fetch result:', { data, error });

      if (error) {
        console.error('Error fetching offer products:', error);
        throw error;
      }

      setOfferProducts(data || []);
    } catch (error) {
      console.error('Error fetching offer products:', error);
      setError('অফার পণ্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return { offerProducts, loading, error, refetch: fetchOfferProducts };
};
