
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Gift, Clock } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { toast } from 'sonner';
import { OfferProduct } from '@/types/popularProducts';

interface CompactComboOfferCardProps {
  product: OfferProduct;
}

const CompactComboOfferCard = ({ product }: CompactComboOfferCardProps) => {
  const { addToCart } = useCart();
  const { products } = useProducts();
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Individual countdown timer for each product
  useEffect(() => {
    const targetTime = new Date();
    targetTime.setHours(23, 59, 59, 999); // End of day countdown
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetTime.getTime() - now;
      
      if (distance > 0) {
        setTimeLeft({
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = () => {
    console.log('Adding combo offer to cart:', product);
    
    if (!product.offer_items || product.offer_items.length === 0) {
      toast.error('এই অফারে কোন পণ্য নেই');
      return;
    }

    let addedItems = 0;
    
    product.offer_items.forEach(item => {
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

  // Calculate pricing
  const includedProducts = product.offer_items?.map(item => {
    const actualProduct = products.find(p => p.id === item.product_id);
    const actualPackage = actualProduct?.packages.find(pkg => pkg.id === item.package_id);
    return {
      name: actualProduct?.name || 'পণ্য',
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
    <Card className="min-w-[200px] max-w-[200px] h-[300px] flex flex-col hover:shadow-lg transition-all duration-300 border border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
      <CardContent className="p-2 flex flex-col h-full">
        {/* Media */}
        <div className="aspect-square relative mb-2 overflow-hidden rounded-lg">
          {product.image_url ? (
            isVideo ? (
              <video
                src={product.image_url}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
              <Gift className="w-8 h-8 text-orange-400" />
            </div>
          )}
          
          {product.discount_percentage && (
            <div className="absolute top-1 left-1">
              <Badge className="bg-red-500 text-white text-xs px-1 py-0.5">
                {product.discount_percentage}% ছাড়
              </Badge>
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="flex-1 flex flex-col">
          <h4 className="text-xs font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
            {product.title}
          </h4>
          
          {/* Individual Timer */}
          <div className="bg-red-100 rounded p-1 mb-2 text-center">
            <div className="flex items-center justify-center gap-1 text-red-600">
              <Clock size={10} />
              <span className="text-xs font-mono">
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-2">
            {totalOriginalPrice > 0 && (
              <div className="text-xs text-gray-500 line-through text-center">
                মূল মূল্য: ৳{totalOriginalPrice}
              </div>
            )}
            <div className="text-sm font-bold text-green-600 text-center">
              কম্বো মূল্য: ৳{actualOfferPrice}
            </div>
            {savings > 0 && (
              <div className="text-xs text-orange-600 text-center">
                সাশ্রয়: ৳{savings}
              </div>
            )}
          </div>

          {/* Products Count */}
          <div className="text-xs text-center text-gray-600 mb-2">
            {includedProducts.length} টি পণ্য • {includedProducts.reduce((sum, item) => sum + item.quantity, 0)} পিস
          </div>

          {/* Add to Cart Button */}
          <Button 
            onClick={handleAddToCart}
            size="sm"
            className="w-full mt-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-1 h-7 text-xs"
          >
            <ShoppingCart size={12} className="mr-1" />
            কার্টে যোগ করুন
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactComboOfferCard;
