
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

interface DatabaseProduct {
  id: string;
  name: string;
  description: string | null;
  category: 'web' | 'mobile' | 'tutorial';
  image: string | null;
  features: string[] | null;
  is_active: boolean;
  packages?: DatabasePackage[];
}

interface DatabasePackage {
  id: string;
  duration: '1month' | '3month' | '6month' | 'lifetime';
  price: number;
  original_price: number | null;
  discount: number | null;
  is_active: boolean;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          packages:product_packages(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database data to match our Product interface
      const transformedProducts: Product[] = (data || []).map((product: DatabaseProduct) => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        category: product.category,
        image: product.image || '',
        features: product.features || [],
        packages: (product.packages || [])
          .filter(pkg => pkg.is_active)
          .map(pkg => ({
            id: pkg.id,
            duration: pkg.duration,
            price: pkg.price,
            originalPrice: pkg.original_price || undefined,
            discount: pkg.discount || undefined,
          }))
      }));

      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts };
};
