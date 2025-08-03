
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, ShoppingCart, Heart, Package, Gift } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { toast } from 'sonner';
import { OfferProduct } from '@/types/popularProducts';

interface ComboOfferCardProps {
  product: OfferProduct;
}

const ComboOfferCard = ({ product }: ComboOfferCardProps) => {
  const { addToCart } = useCart();
  const { products } = useProducts();

  const handleAddToCart = () => {
    console.log('Adding combo offer to cart:', product);
    
    if (!product.offer_items || product.offer_items.length === 0) {
      toast.error('এই অফারে কোন পণ্য নেই');
      return;
    }

    let addedItems = 0;
    let totalItems = 0;

    product.offer_items.forEach(item => {
      totalItems += item.quantity;
      
      const actualProduct = products.find(p => p.id === item.product_id);
      if (actualProduct) {
        const actualPackage = actualProduct.packages.find(pkg => pkg.id === item.package_id);
        if (actualPackage) {
          for (let i = 0; i < item.quantity; i++) {
            addToCart(item.product_id, item.package_id);
            addedItems++;
          }
        }
      }
    });

    if (addedItems > 0) {
      toast.success(`${product.title} কার্টে যোগ করা হয়েছে!`);
    } else {
      toast.error('পণ্যটি কার্টে যোগ করা যায়নি');
    }
  };

  const getDurationText = (duration: string) => {
    switch (duration) {
      case '1month': return '১ মাস';
      case '2month': return '২ মাস';
      case '3month': return '৩ মাস';
      case '6month': return '৬ মাস';
      case 'lifetime': return 'লাইফটাইম';
      default: return duration;
    }
  };

  // Calculate what products are included
  const includedProducts = product.offer_items?.map(item => {
    const actualProduct = products.find(p => p.id === item.product_id);
    const actualPackage = actualProduct?.packages.find(pkg => pkg.id === item.package_id);
    return {
      name: actualProduct?.name || 'পণ্য',
      duration: actualPackage?.duration || '',
      price: actualPackage?.price || 0,
      originalPrice: actualPackage?.originalPrice || 0,
      quantity: item.quantity
    };
  }) || [];

  const totalOriginalPrice = includedProducts.reduce((sum, item) => 
    sum + (item.originalPrice * item.quantity), 0
  );

  const actualOfferPrice = product.offer_price || 0;
  const savings = totalOriginalPrice - actualOfferPrice;

  const isVideo = product.image_url?.includes('.mp4') || product.image_url?.includes('.webm');

  return (
    <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 backdrop-blur-sm">
      <CardHeader className="pb-2 sm:pb-4 p-2 sm:p-6">
        <div className="aspect-video relative mb-2 sm:mb-4 overflow-hidden rounded-lg">
          {product.image_url ? (
            isVideo ? (
              <video
                src={product.image_url}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
              <Gift className="w-12 h-12 text-orange-400" />
            </div>
          )}
          
          <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
            <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white p-1 sm:p-2 h-auto">
              <Heart size={12} className="sm:w-4 sm:h-4" />
            </Button>
          </div>
          
          {product.discount_percentage && (
            <div className="absolute top-1 sm:top-2 left-1 sm:left-2">
              <Badge className="bg-red-500 text-white text-xs sm:text-sm px-1 sm:px-2 py-0.5 animate-pulse">
                {product.discount_percentage}% ছাড়
              </Badge>
            </div>
          )}

          <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2">
            <Badge className="bg-purple-600 text-white text-xs px-2 py-1">
              <Package size={10} className="mr-1" />
              কম্বো অফার
            </Badge>
          </div>
        </div>
        
        <div className="flex items-start justify-between mb-1 sm:mb-2">
          <CardTitle className="text-sm sm:text-xl font-bold text-gray-800 leading-tight line-clamp-2">
            {product.title}
          </CardTitle>
        </div>
        
        <CardDescription className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2 hidden sm:block">
          {product.description || `${includedProducts.length} টি পণ্যের কম্বো প্যাকেজ`}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-2 sm:p-6 pt-0">
        {/* Included Products */}
        <div className="mb-2 sm:mb-4 bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2 text-xs sm:text-sm flex items-center">
            <Package size={14} className="mr-1" />
            এই প্যাকেজে যা পাবেন:
          </h4>
          <div className="space-y-1">
            {includedProducts.slice(0, 2).map((item, index) => (
              <div key={index} className="flex items-center text-xs sm:text-sm text-gray-700 bg-white rounded px-2 py-1">
                <Star size={10} className="text-yellow-500 mr-1 flex-shrink-0" />
                <span className="line-clamp-1 flex-1">
                  {item.name} - {getDurationText(item.duration)} ({item.quantity} টি)
                </span>
              </div>
            ))}
            {includedProducts.length > 2 && (
              <div className="text-xs text-blue-600 font-medium">
                +{includedProducts.length - 2} টি আরো পণ্য
              </div>
            )}
          </div>
        </div>

        {/* Price Display */}
        <div className="mb-2 sm:mb-4 p-2 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-600">কম্বো মূল্য:</span>
            <div className="text-right">
              <span className="text-lg sm:text-2xl font-bold text-green-600">৳{actualOfferPrice}</span>
              {totalOriginalPrice > 0 && (
                <div className="text-xs sm:text-sm text-gray-500 line-through">
                  ৳{totalOriginalPrice}
                </div>
              )}
            </div>
          </div>
          {savings > 0 && (
            <div className="text-xs sm:text-sm text-green-600 font-medium mt-1 text-center">
              💰 সাশ্রয়: ৳{savings}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-2 sm:mb-4">
          <div className="bg-purple-50 rounded-lg p-1 sm:p-2 text-center border border-purple-200">
            <div className="text-sm sm:text-lg font-bold text-purple-600">
              {includedProducts.length}
            </div>
            <div className="text-xs text-purple-600">ভিন্ন পণ্য</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-1 sm:p-2 text-center border border-indigo-200">
            <div className="text-sm sm:text-lg font-bold text-indigo-600">
              {includedProducts.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
            <div className="text-xs text-indigo-600">মোট পিস</div>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button 
          onClick={handleAddToCart}
          className="w-full mt-auto bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 hover:from-orange-600 hover:via-red-600 hover:to-yellow-600 text-white font-medium py-2 sm:py-3 rounded-lg transition-all duration-200 hover:shadow-lg text-xs sm:text-sm"
        >
          <ShoppingCart size={14} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">কার্টে যোগ করুন</span>
          <span className="sm:hidden">কার্ট</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ComboOfferCard;
