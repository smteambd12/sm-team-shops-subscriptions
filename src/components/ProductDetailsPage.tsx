
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Share2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();

  const product = products.find(p => p.id === productId);

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    toast.success('প্রোডাক্ট লিংক কপি হয়েছে!');
  };

  const handleAddToCart = (packageId: string, price: number) => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price,
        packageId,
        duration: '1month', // Default
        image: product.image,
        features: product.features
      });
      toast.success('কার্টে যোগ করা হয়েছে!');
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">প্রোডাক্ট খুঁজে পাওয়া যায়নি</h1>
        <Button onClick={() => navigate('/')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          হোম পেজে ফিরে যান
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            ফিরে যান
          </Button>
          
          <Button onClick={handleShare} variant="outline" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <img
                  src={product.image || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-80 lg:h-96 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-4">{product.category}</Badge>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">বৈশিষ্ট্যসমূহ:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <Star className="w-4 h-4 text-yellow-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Packages */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">প্যাকেজ সিলেক্ট করুন:</h3>
              <div className="space-y-3">
                {product.packages.map((pkg) => (
                  <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">
                            {pkg.duration === '1month' && '১ মাস'}
                            {pkg.duration === '3month' && '৩ মাস'}
                            {pkg.duration === '6month' && '৬ মাস'}
                            {pkg.duration === 'lifetime' && 'লাইফটাইম'}
                          </h4>
                          <div className="flex items-center gap-2">
                            {pkg.originalPrice && (
                              <span className="text-gray-500 line-through">
                                ৳{pkg.originalPrice}
                              </span>
                            )}
                            <span className="text-2xl font-bold text-green-600">
                              ৳{pkg.price}
                            </span>
                            {pkg.discount && (
                              <Badge variant="secondary" className="text-red-600">
                                {pkg.discount}% ছাড়
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleAddToCart(pkg.id, pkg.price)}
                          className="flex items-center gap-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          কার্টে যোগ করুন
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
