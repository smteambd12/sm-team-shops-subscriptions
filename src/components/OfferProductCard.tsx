import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, Gift, ShoppingCart, Clock, Star } from 'lucide-react';
import { OfferProduct } from '@/types/popularProducts';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface OfferProductCardProps {
  product: OfferProduct;
}

const OfferProductCard = ({ product }: OfferProductCardProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.shareable_slug) {
      const shareUrl = `${window.location.origin}/#/offer/${product.shareable_slug}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('অফার লিঙ্ক কপি হয়েছে!');
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if offer has items
    if (!product.offer_items || product.offer_items.length === 0) {
      toast.error('এই অফারে কোন পণ্য নেই');
      return;
    }

    try {
      // Add all offer items to cart
      product.offer_items.forEach(item => {
        addToCart(item.product_id, item.package_id);
      });

      toast.success(`${product.title} কার্টে যোগ করা হয়েছে!`);
      
      // Navigate to checkout after a short delay
      setTimeout(() => {
        navigate('/checkout');
      }, 1000);
    } catch (error) {
      console.error('Error adding offer to cart:', error);
      toast.error('কার্টে যোগ করতে সমস্যা হয়েছে');
    }
  };

  const handleViewOffer = () => {
    if (product.shareable_slug) {
      navigate(`/offer/${product.shareable_slug}`);
    }
  };

  const discountAmount = product.original_price && product.offer_price 
    ? product.original_price - product.offer_price 
    : 0;

  const savings = product.original_price && product.offer_price
    ? Math.round(((product.original_price - product.offer_price) / product.original_price) * 100)
    : 0;

  return (
    <Card 
      className="group cursor-pointer hover:shadow-2xl transition-all duration-500 border-2 border-gradient-to-r from-orange-200 via-red-200 to-yellow-200 bg-gradient-to-br from-orange-50 via-red-50/30 to-yellow-50 backdrop-blur-sm min-w-[320px] transform hover:scale-105 relative overflow-hidden"
      onClick={handleViewOffer}
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardContent className="p-0 relative z-10">
        <div className="relative overflow-hidden rounded-t-lg">
          {product.image_url ? (
            <div className="relative">
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-56 object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>
          ) : (
            <div className="w-full h-56 bg-gradient-to-r from-orange-300 via-red-300 to-yellow-300 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 animate-pulse"></div>
              <Gift className="w-20 h-20 text-orange-600 z-10 animate-bounce" />
            </div>
          )}
          
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg animate-pulse border-0">
              🔥 {product.discount_percentage}% ছাড়
            </Badge>
            {savings > 0 && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg border-0">
                💰 {savings}% সাশ্রয়
              </Badge>
            )}
          </div>
          
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            {product.shareable_slug && (
              <button
                onClick={handleShare}
                className="w-10 h-10 bg-white/95 rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
              >
                <Share2 className="w-4 h-4 text-orange-600" />
              </button>
            )}
          </div>

          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            <span>সীমিত সময়</span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-xl text-gray-900 line-clamp-2 leading-tight group-hover:text-orange-700 transition-colors flex-1">
              {product.title}
            </h3>
            <div className="flex items-center gap-1 ml-3">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-gray-700">অফার</span>
            </div>
          </div>
          
          {product.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              {product.original_price && (
                <div className="flex items-center gap-2">
                  <span className="text-lg text-gray-500 line-through">
                    ৳{product.original_price}
                  </span>
                  <Badge variant="outline" className="text-red-600 border-red-600 text-xs">
                    -{product.discount_percentage}%
                  </Badge>
                </div>
              )}
              {product.offer_price && (
                <span className="text-2xl font-bold text-green-600">
                  ৳{product.offer_price}
                </span>
              )}
            </div>
            {discountAmount > 0 && (
              <div className="text-center">
                <Badge variant="outline" className="text-green-600 border-green-600 mb-1">
                  ৳{discountAmount} সাশ্রয়
                </Badge>
              </div>
            )}
          </div>

          {/* Offer items count */}
          {product.offer_items && product.offer_items.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700 font-medium">
                  🎁 এই অফারে {product.offer_items.length} টি পণ্য রয়েছে
                </span>
                <span className="text-blue-600">
                  মোট: {product.offer_items.reduce((sum, item) => sum + item.quantity, 0)} পিস
                </span>
              </div>
            </div>
          )}
          
          <Button 
            className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 hover:from-orange-600 hover:via-red-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 py-6 text-lg font-bold"
            onClick={handleBuyNow}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            এখনই কিনুন
          </Button>

          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              🚀 তাৎক্ষণিক ডেলিভারি • ✅ ১০০% নিরাপদ
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfferProductCard;
