
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OfferProduct } from '@/types/popularProducts';

// Sample offer products for demonstration
const sampleOfferProducts: OfferProduct[] = [
  {
    id: 'offer-1',
    title: 'ওয়েবসাইট ডিজাইন মেগা প্যাক',
    description: '১০টি প্রোফেশনাল ওয়েবসাইট টেমপ্লেট + বোনাস কনটেন্ট',
    image_url: '/placeholder.svg',
    discount_percentage: 50,
    original_price: 2000,
    offer_price: 1000,
    is_active: true,
    priority: 10,
    shareable_slug: 'website-design-mega-pack',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    offer_items: [
      {
        id: 'item-1',
        offer_product_id: 'offer-1',
        product_id: 'web-design-pro',
        package_id: '1',
        quantity: 1,
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 'offer-2',
    title: 'মোবাইল অ্যাপ ডেভেলপমেন্ট বান্ডেল',
    description: 'React Native + Flutter টিউটোরিয়াল সহ সোর্স কোড',
    image_url: '/placeholder.svg',
    discount_percentage: 40,
    original_price: 1500,
    offer_price: 900,
    is_active: true,
    priority: 9,
    shareable_slug: 'mobile-app-bundle',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    offer_items: [
      {
        id: 'item-2',
        offer_product_id: 'offer-2',
        product_id: 'mobile-app-basic',
        package_id: '1',
        quantity: 1,
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 'offer-3',
    title: 'গ্রাফিক ডিজাইন স্পেশাল',
    description: '১০০টি লোগো + ব্যানার + সোশ্যাল মিডিয়া পোস্ট',
    image_url: '/placeholder.svg',
    discount_percentage: 60,
    original_price: 3000,
    offer_price: 1200,
    is_active: true,
    priority: 8,
    shareable_slug: 'graphic-design-special',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    offer_items: [
      {
        id: 'item-3',
        offer_product_id: 'offer-3',
        product_id: 'tutorial-basic',
        package_id: '1',
        quantity: 1,
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 'offer-4',
    title: 'ডিজিটাল মার্কেটিং টুলকিট',
    description: 'সোশ্যাল মিডিয়া টেমপ্লেট + কনটেন্ট প্ল্যানার',
    image_url: '/placeholder.svg',
    discount_percentage: 35,
    original_price: 1800,
    offer_price: 1170,
    is_active: true,
    priority: 7,
    shareable_slug: 'digital-marketing-toolkit',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    offer_items: [
      {
        id: 'item-4',
        offer_product_id: 'offer-4',
        product_id: 'web-design-pro',
        package_id: '2',
        quantity: 2,
        created_at: new Date().toISOString()
      }
    ]
  }
];

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
        // If there's an error or no data, use sample data
        console.log('Using sample offer products data');
        setOfferProducts(sampleOfferProducts);
      } else {
        // If we have data from database, use it, otherwise use sample data
        const products = data && data.length > 0 ? data : sampleOfferProducts;
        console.log('Setting offer products:', products);
        setOfferProducts(products);
      }
    } catch (error) {
      console.error('Error fetching offer products:', error);
      console.log('Using sample offer products due to error');
      setOfferProducts(sampleOfferProducts);
      setError('অফার পণ্য লোড করতে সমস্যা হয়েছে - নমুনা ডেটা দেখানো হচ্ছে');
    } finally {
      setLoading(false);
    }
  };

  return { offerProducts, loading, error, refetch: fetchOfferProducts };
};
