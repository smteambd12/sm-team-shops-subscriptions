
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, Gift, ShoppingCart, Clock, Star, Play } from 'lucide-react';
import { OfferProduct } from '@/types/popularProducts';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';

interface OfferProductCardProps {
  product: OfferProduct;
}

const OfferProductCard = ({ product }: OfferProductCardProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { products } = useProducts();

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
    
    console.log('Offer product clicked:', product);
    console.log('Offer items:', product.offer_items);
    
    // Check if offer has items
    if (!product.offer_items || product.offer_items.length === 0) {
      toast.error('এই অফারে কোন পণ্য নেই');
      return;
    }

    try {
      // Add all offer items to cart using proper product and package IDs
      product.offer_items.forEach(item => {
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

  // Check if the media URL is a video
  const isVideo = product.image_url && (
    product.image_url.includes('.mp4') || 
    product.image_url.includes('.webm') || 
    product.image_url.includes('.ogg') ||
    product.image_url.includes('video')
  );

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 border border-orange-200 bg-gradient-to-br from-orange-50/50 to-yellow-50/50 backdrop-blur-sm min-w-[280px] max-w-[280px] transform hover:scale-102 relative overflow-hidden"
      onClick={handleViewOffer}
    >
      <CardContent className="p-0 relative">
        <div className="relative overflow-hidden rounded-t-lg">
          {product.image_url ? (
            <div className="relative">
              {isVideo ? (
                <div className="relative w-full h-40">
                  <video
                    src={product.image_url}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full">
                    <Play className="w-3 h-3" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-40 object-cover transition-all duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-40 bg-gradient-to-r from-orange-300 via-red-300 to-yellow-300 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 animate-pulse"></div>
              <Gift className="w-16 h-16 text-orange-600 z-10" />
            </div>
          )}
          
          <div className="absolute top-2 left-2 flex gap-1">
            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md animate-pulse border-0 text-xs px-2 py-1">
              🔥 {product.discount_percentage}% ছাড়
            </Badge>
          </div>
          
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
            {product.shareable_slug && (
              <button
                onClick={handleShare}
                className="w-8 h-8 bg-white/95 rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 shadow-md transform hover:scale-110"
              >
                <Share2 className="w-3 h-3 text-orange-600" />
              </button>
            )}
          </div>

          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            <span>সীমিত সময়</span>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-base text-gray-900 line-clamp-2 leading-tight group-hover:text-orange-700 transition-colors flex-1">
              {product.title}
            </h3>
            <div className="flex items-center gap-1 ml-2">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            </div>
          </div>
          
          {product.description && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              {product.original_price && (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500 line-through">
                    ৳{product.original_price}
                  </span>
                  <Badge variant="outline" className="text-red-600 border-red-600 text-xs px-1">
                    -{product.discount_percentage}%
                  </Badge>
                </div>
              )}
              {product.offer_price && (
                <span className="text-lg font-bold text-green-600">
                  ৳{product.offer_price}
                </span>
              )}
            </div>
            {discountAmount > 0 && (
              <div className="text-center">
                <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                  ৳{discountAmount} সাশ্রয়
                </Badge>
              </div>
            )}
          </div>

          {/* Offer items count */}
          {product.offer_items && product.offer_items.length > 0 && (
            <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-700 font-medium">
                  🎁 {product.offer_items.length} পণ্য
                </span>
                <span className="text-blue-600">
                  {product.offer_items.reduce((sum, item) => sum + item.quantity, 0)} পিস
                </span>
              </div>
            </div>
          )}
          
          <Button 
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md hover:shadow-lg transition-all duration-300 py-2 text-sm font-bold"
            onClick={handleBuyNow}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            এখনই কিনুন
          </Button>

          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              🚀 তাৎক্ষণিক ডেলিভারি • ✅ নিরাপদ
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfferProductCard;
