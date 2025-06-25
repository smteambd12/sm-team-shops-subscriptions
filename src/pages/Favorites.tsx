
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Trash2, Sparkles } from 'lucide-react';
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
    addToCart(product.id, packageId);
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <ArrowLeft size={16} />
            হোমে ফিরুন
          </Button>
          <h1 className="text-4xl font-bold flex items-center gap-3 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            <Heart className="text-red-500 animate-pulse" size={40} />
            আমার প্রিয় পণ্য
          </h1>
        </div>

        {favoriteProducts.length === 0 ? (
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="relative mb-6">
                <Heart className="mx-auto h-20 w-20 text-gray-300 mb-4" />
                <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-400 animate-bounce" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-700">কোন প্রিয় পণ্য নেই</h3>
              <p className="text-gray-600 mb-6 text-lg">আপনার এখনো কোন পণ্য প্রিয় তালিকায় যোগ করেননি।</p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-full text-lg font-semibold hover:scale-105 transition-all duration-300"
              >
                পণ্য দেখুন
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favoriteProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-3 right-3 rounded-full hover:scale-110 transition-transform"
                    onClick={() => removeFavorite(product.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                      {product.category === 'web' && '🌐 ওয়েব সার্ভিস'}
                      {product.category === 'mobile' && '📱 মোবাইল অ্যাপ'}
                      {product.category === 'tutorial' && '📚 টিউটোরিয়াল'}
                    </div>
                  </div>
                </div>
                
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
                        <Sparkles size={16} className="text-yellow-500" />
                        প্যাকেজ সমূহ:
                      </h4>
                      <div className="space-y-3">
                        {product.packages.map((pkg) => (
                          <div key={pkg.id} className="flex items-center justify-between p-3 border border-purple-100 rounded-xl hover:bg-purple-50 transition-colors group/package">
                            <div>
                              <span className="font-medium text-gray-700">
                                {pkg.duration === '1month' && '⏰ ১ মাস'}
                                {pkg.duration === '3month' && '📅 ৩ মাস'}
                                {pkg.duration === '6month' && '🗓️ ৬ মাস'}
                                {pkg.duration === 'lifetime' && '♾️ আজীবন'}
                              </span>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xl font-bold text-purple-600">
                                  ৳{pkg.price.toLocaleString()}
                                </span>
                                {pkg.originalPrice && (
                                  <span className="text-sm text-gray-500 line-through">
                                    ৳{pkg.originalPrice.toLocaleString()}
                                  </span>
                                )}
                                {pkg.discount && (
                                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                                    {pkg.discount}% ছাড়
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddToCart(product, pkg.id)}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:scale-110 transition-all duration-300 rounded-full"
                            >
                              <ShoppingCart size={14} className="mr-1" />
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
    </div>
  );
};

export default Favorites;
