
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PopularProduct } from '@/types/popularProducts';

export const usePopularProducts = () => {
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPopularProducts();
  }, []);

  const fetchPopularProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching popular products...');
      
      const { data, error } = await supabase
        .from('popular_products')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      console.log('Popular products fetch result:', { data, error });

      if (error) {
        console.error('Error fetching popular products:', error);
        throw error;
      }

      // Type assertion to ensure the data conforms to our PopularProduct interface
      const typedData = (data || []).map(item => ({
        ...item,
        media_type: item.media_type as 'image' | 'video'
      })) as PopularProduct[];

      setPopularProducts(typedData);
    } catch (error) {
      console.error('Error fetching popular products:', error);
      setError('পপুলার পণ্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return { popularProducts, loading, error, refetch: fetchPopularProducts };
};
