
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, Gift } from 'lucide-react';
import { OfferProduct } from '@/types/popularProducts';
import { toast } from 'sonner';

interface OfferProductCardProps {
  product: OfferProduct;
}

const OfferProductCard = ({ product }: OfferProductCardProps) => {
  const handleShare = () => {
    if (product.shareable_slug) {
      const shareUrl = `${window.location.origin}/#/offer/${product.shareable_slug}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('অফার লিঙ্ক কপি হয়েছে!');
    }
  };

  const discountAmount = product.original_price && product.offer_price 
    ? product.original_price - product.offer_price 
    : 0;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-48 object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-r from-orange-200 to-yellow-200 flex items-center justify-center">
              <Gift className="w-16 h-16 text-orange-600" />
            </div>
          )}
          
          <div className="absolute top-2 left-2">
            <Badge className="bg-red-500 text-white">
              {product.discount_percentage}% ছাড়
            </Badge>
          </div>
          
          {product.shareable_slug && (
            <button
              onClick={handleShare}
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <Share2 className="w-4 h-4 text-gray-700" />
            </button>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
          {product.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
          )}
          
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
            {discountAmount > 0 && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                ৳{discountAmount} সাশ্রয়
              </Badge>
            )}
          </div>
          
          <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white">
            এখনই কিনুন
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfferProductCard;
