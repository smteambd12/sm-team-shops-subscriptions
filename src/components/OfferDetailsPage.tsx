
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, ShoppingCart, Clock, Gift, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOfferProducts } from '@/hooks/useOfferProducts';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { toast } from 'sonner';

const OfferDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { offerProducts, loading } = useOfferProducts();
  const { addToCart } = useCart();
  const { products } = useProducts();

  const offer = offerProducts.find(o => o.shareable_slug === slug);

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    toast.success('অফার লিংক কপি হয়েছে!');
  };

  const handleBuyNow = () => {
    if (!offer || !offer.offer_items || offer.offer_items.length === 0) {
      toast.error('এই অফারে কোন পণ্য নেই');
      return;
    }

    try {
      // Add all offer items to cart using proper product and package IDs
      offer.offer_items.forEach(item => {
        console.log('Adding to cart:', {
          productId: item.product_id,
          packageId: item.package_id
        });
        
        // Find the actual product to verify it exists
        const actualProduct = products.find(p => p.id === item.product_id);
        if (actualProduct) {
          const actualPackage = actualProduct.packages.find(pkg => pkg.id === item.package_id);
          if (actualPackage) {
            addToCart(item.product_id, item.package_id);
            console.log('Successfully added to cart:', {
              productName: actualProduct.name,
              packageDuration: actualPackage.duration,
              price: actualPackage.price
            });
          } else {
            console.error('Package not found:', item.package_id);
            toast.error(`প্যাকেজ খুঁজে পাওয়া যায়নি: ${item.package_id}`);
          }
        } else {
          console.error('Product not found:', item.product_id);
          toast.error(`পণ্য খুঁজে পাওয়া যায়নি: ${item.product_id}`);
        }
      });

      toast.success(`${offer.title} কার্টে যোগ করা হয়েছে!`);
      navigate('/checkout');
    } catch (error) {
      console.error('Error adding offer to cart:', error);
      toast.error('কার্টে যোগ করতে সমস্যা হয়েছে');
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
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">অফার খুঁজে পাওয়া যায়নি</h1>
        <Button onClick={() => navigate('/')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          হোম পেজে ফিরে যান
        </Button>
      </div>
    );
  }

  const discountAmount = offer.original_price && offer.offer_price 
    ? offer.original_price - offer.offer_price 
    : 0;

  // Check if the media URL is a video
  const isVideo = offer.image_url && (
    offer.image_url.includes('.mp4') || 
    offer.image_url.includes('.webm') || 
    offer.image_url.includes('.ogg') ||
    offer.image_url.includes('video')
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
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
          {/* Offer Image/Video */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-2 border-orange-200">
              <CardContent className="p-0">
                {offer.image_url ? (
                  <div className="relative">
                    {isVideo ? (
                      <div className="relative">
                        <video
                          src={offer.image_url}
                          className="w-full h-80 lg:h-96 object-cover"
                          controls
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                        <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={offer.image_url}
                        alt={offer.title}
                        className="w-full h-80 lg:h-96 object-cover"
                      />
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-500 text-white text-lg px-4 py-2 animate-pulse">
                        {offer.discount_percentage}% ছাড়
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-80 lg:h-96 bg-gradient-to-r from-orange-300 to-yellow-300 flex items-center justify-center">
                    <Gift className="w-24 h-24 text-orange-600" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Offer Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-red-500" />
                <Badge className="bg-red-500 text-white">সীমিত সময়ের অফার</Badge>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {offer.title}
              </h1>
              
              {offer.description && (
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {offer.description}
                </p>
              )}
            </div>

            {/* Price Section */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {offer.original_price && (
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl text-gray-500 line-through">
                          ৳{offer.original_price}
                        </span>
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          -{offer.discount_percentage}%
                        </Badge>
                      </div>
                    )}
                    {offer.offer_price && (
                      <span className="text-4xl font-bold text-green-600">
                        ৳{offer.offer_price}
                      </span>
                    )}
                  </div>
                  {discountAmount > 0 && (
                    <div className="text-center">
                      <div className="text-sm text-gray-600">আপনি সাশ্রয় করবেন</div>
                      <div className="text-2xl font-bold text-orange-600">
                        ৳{discountAmount}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Offer Items */}
            {offer.offer_items && offer.offer_items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-orange-500" />
                    এই অফারে যা পাবেন
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {offer.offer_items.map((item, index) => {
                      // Find the actual product to show its name
                      const actualProduct = products.find(p => p.id === item.product_id);
                      const actualPackage = actualProduct?.packages.find(pkg => pkg.id === item.package_id);
                      
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium">
                              {actualProduct ? actualProduct.name : `প্রোডাক্ট #${index + 1}`}
                            </span>
                            {actualPackage && (
                              <div className="text-sm text-gray-600">
                                {actualPackage.duration === '1month' && '১ মাস'}
                                {actualPackage.duration === '3month' && '৩ মাস'}
                                {actualPackage.duration === '6month' && '৬ মাস'}
                                {actualPackage.duration === 'lifetime' && 'লাইফটাইম'}
                                {' - ৳'}{actualPackage.price}
                              </div>
                            )}
                          </div>
                          <Badge variant="secondary">
                            {item.quantity} পিস
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-700">
                        মোট পণ্য: {offer.offer_items.length} ধরনের
                      </span>
                      <span className="font-bold text-blue-600">
                        মোট পিস: {offer.offer_items.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Buy Button */}
            <Button 
              onClick={handleBuyNow}
              className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 hover:from-orange-600 hover:via-red-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 py-8 text-xl font-bold"
            >
              <ShoppingCart className="w-6 h-6 mr-3" />
              এখনই কিনুন - ৳{offer.offer_price}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                🚀 তাৎক্ষণিক ডেলিভারি • ✅ ১০০% নিরাপদ পেমেন্ট • 🔄 ৭ দিন রিফান্ড গ্যারান্টি
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetailsPage;
