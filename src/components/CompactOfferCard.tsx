
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, Gift, ShoppingCart, Star, Play } from 'lucide-react';
import { OfferProduct } from '@/types/popularProducts';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface CompactOfferCardProps {
  product: OfferProduct;
}

const CompactOfferCard = ({ product }: CompactOfferCardProps) => {
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
    
    if (!product.offer_items || product.offer_items.length === 0) {
      toast.error('এই অফারে কোন পণ্য নেই');
      return;
    }

    try {
      product.offer_items.forEach(item => {
        console.log('Adding offer item to cart:', {
          productId: String(item.product_id),
          packageId: String(item.package_id)
        });
        addToCart(String(item.product_id), String(item.package_id));
      });

      toast.success(`${product.title} কার্টে যোগ করা হয়েছে!`);
      setTimeout(() => {
        navigate('/cart');
      }, 500);
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

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 border border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 min-w-[280px] max-w-[300px]"
      onClick={handleViewOffer}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          {product.image_url ? (
            <div className="relative">
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-32 object-cover transition-all duration-300 group-hover:scale-105"
              />
              {product.discount_percentage && (
                <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs animate-pulse">
                  {product.discount_percentage}% ছাড়
                </Badge>
              )}
            </div>
          ) : (
            <div className="w-full h-32 bg-gradient-to-r from-orange-300 to-red-300 flex items-center justify-center">
              <Gift className="w-8 h-8 text-orange-600" />
            </div>
          )}
          
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {product.shareable_slug && (
              <button
                onClick={handleShare}
                className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all"
              >
                <Share2 className="w-3 h-3 text-orange-600" />
              </button>
            )}
          </div>
        </div>
        
        <div className="p-3">
          <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-700 transition-colors">
            {product.title}
          </h3>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              {product.original_price && (
                <span className="text-sm text-gray-500 line-through">
                  ৳{product.original_price}
                </span>
              )}
              {product.offer_price && (
                <span className="text-lg font-bold text-green-600">
                  ৳{product.offer_price}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs text-gray-600">অফার</span>
            </div>
          </div>

          {product.offer_items && product.offer_items.length > 0 && (
            <div className="mb-3 p-2 bg-blue-50 rounded text-center">
              <span className="text-xs text-blue-700 font-medium">
                {product.offer_items.length} টি পণ্য • {product.offer_items.reduce((sum, item) => sum + item.quantity, 0)} পিস
              </span>
            </div>
          )}
          
          <Button 
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs py-2"
            onClick={handleBuyNow}
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            এখনই কিনুন
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactOfferCard;
