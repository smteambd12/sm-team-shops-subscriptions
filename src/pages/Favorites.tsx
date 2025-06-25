
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Product } from '@/types';

interface Favorite {
  id: string;
  product_id: string;
  created_at: string;
}

const Favorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchFavorites();
    loadProducts();
  }, [user, navigate]);

  const loadProducts = () => {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
  };

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFavorites(data || []);
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "ত্রুটি",
        description: "প্রিয় পণ্য লোড করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user?.id)
        .eq('product_id', productId);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => fav.product_id !== productId));

      toast({
        title: "সফল",
        description: "প্রিয় তালিকা থেকে সরানো হয়েছে।",
      });
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      toast({
        title: "ত্রুটি",
        description: "প্রিয় তালিকা থেকে সরাতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  };

  const getFavoriteProducts = () => {
    return favorites.map(fav => {
      const product = products.find(p => p.id === fav.product_id);
      return product ? { ...product, favoriteId: fav.id } : null;
    }).filter(Boolean) as (Product & { favoriteId: string })[];
  };

  const handleAddToCart = (product: Product, packageId: string) => {
    addToCart(product.id, packageId, 1);
    toast({
      title: "কার্টে যোগ করা হয়েছে",
      description: `${product.name} কার্টে যোগ করা হয়েছে।`,
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const favoriteProducts = getFavoriteProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          হোমে ফিরুন
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Heart className="text-red-500" />
          আমার প্রিয় পণ্য
        </h1>
      </div>

      {favoriteProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">কোন প্রিয় পণ্য নেই</h3>
            <p className="text-gray-600 mb-4">আপনার এখনো কোন পণ্য প্রিয় তালিকায় যোগ করেননি।</p>
            <Button onClick={() => navigate('/')}>
              পণ্য দেখুন
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => removeFavorite(product.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">প্যাকেজ সমূহ:</h4>
                    <div className="space-y-2">
                      {product.packages.map((pkg) => (
                        <div key={pkg.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">
                              {pkg.duration === '1month' && '১ মাস'}
                              {pkg.duration === '3month' && '৩ মাস'}
                              {pkg.duration === '6month' && '৬ মাস'}
                              {pkg.duration === 'lifetime' && 'আজীবন'}
                            </span>
                            <div className="text-lg font-bold text-purple-600">
                              ৳{pkg.price.toLocaleString()}
                              {pkg.originalPrice && (
                                <span className="text-sm text-gray-500 line-through ml-2">
                                  ৳{pkg.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product, pkg.id)}
                            className="flex items-center gap-1"
                          >
                            <ShoppingCart size={14} />
                            কার্ট
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
