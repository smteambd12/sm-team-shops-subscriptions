
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Gift, Clock, Package2, Star } from 'lucide-react';
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
  const [selectedPackages, setSelectedPackages] = useState<{[key: string]: string}>({});
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

  // Initialize default package selections
  useEffect(() => {
    if (product.offer_items && product.offer_items.length > 0) {
      const defaultSelections: {[key: string]: string} = {};
      product.offer_items.forEach(item => {
        defaultSelections[item.product_id] = item.package_id;
      });
      setSelectedPackages(defaultSelections);
    }
  }, [product.offer_items]);

  const handlePackageChange = (productId: string, packageId: string) => {
    setSelectedPackages(prev => ({
      ...prev,
      [productId]: packageId
    }));
  };

  const handleAddToCart = () => {
    console.log('Adding combo offer to cart:', product);
    
    if (!product.offer_items || product.offer_items.length === 0) {
      toast.error('এই অফারে কোন পণ্য নেই');
      return;
    }

    let addedItems = 0;
    
    // Add items with selected packages
    product.offer_items.forEach(item => {
      const selectedPackage = selectedPackages[item.product_id] || item.package_id;
      
      for (let i = 0; i < item.quantity; i++) {
        addToCart(item.product_id, selectedPackage);
        addedItems++;
      }
    });

    if (addedItems > 0) {
      toast.success(`${product.title} কার্টে যোগ করা হয়েছে! (${addedItems}টি আইটেম)`);
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

  // Calculate pricing with selected packages
  const calculatePricing = () => {
    let totalOriginalPrice = 0;
    let totalSelectedPrice = 0;
    
    const packageDetails = product.offer_items?.map(item => {
      const actualProduct = products.find(p => p.id === item.product_id);
      const selectedPackageId = selectedPackages[item.product_id] || item.package_id;
      const selectedPackage = actualProduct?.packages.find(pkg => pkg.id === selectedPackageId);
      
      const originalPrice = selectedPackage?.originalPrice || selectedPackage?.price || 0;
      const currentPrice = selectedPackage?.price || 0;
      
      totalOriginalPrice += originalPrice * item.quantity;
      totalSelectedPrice += currentPrice * item.quantity;
      
      return {
        productName: actualProduct?.name || 'পণ্য',
        packageId: selectedPackageId,
        duration: selectedPackage?.duration || '',
        price: currentPrice,
        originalPrice: originalPrice,
        quantity: item.quantity
      };
    }) || [];

    return {
      packageDetails,
      totalOriginalPrice,
      totalSelectedPrice,
      comboPrice: product.offer_price || 0,
      savings: Math.max(0, totalOriginalPrice - (product.offer_price || 0))
    };
  };

  const { packageDetails, totalOriginalPrice, comboPrice, savings } = calculatePricing();
  const isVideo = product.image_url?.includes('.mp4') || product.image_url?.includes('.webm');

  return (
    <Card className="min-w-[220px] max-w-[220px] h-[420px] flex flex-col hover:shadow-lg transition-all duration-300 border border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
      <CardContent className="p-3 flex flex-col h-full">
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

          {/* Package Selection */}
          <div className="mb-2">
            <div className="text-xs font-medium text-gray-700 mb-1 flex items-center">
              <Package2 size={10} className="mr-1" />
              প্যাকেজ নির্বাচন:
            </div>
            <div className="space-y-1">
              {packageDetails.slice(0, 2).map((item, index) => {
                const productId = product.offer_items?.[index]?.product_id;
                const actualProduct = products.find(p => p.id === productId);
                
                return (
                  <div key={index} className="bg-white rounded p-1">
                    <div className="text-xs text-gray-600 mb-1">{item.productName}</div>
                    <Select
                      value={selectedPackages[productId || ''] || item.packageId}
                      onValueChange={(value) => productId && handlePackageChange(productId, value)}
                    >
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {actualProduct?.packages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {getDurationText(pkg.duration)} - ৳{pkg.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
              {packageDetails.length > 2 && (
                <div className="text-xs text-blue-600 text-center">
                  +{packageDetails.length - 2} টি আরো পণ্য
                </div>
              )}
            </div>
          </div>

          {/* Pricing Display */}
          <div className="mb-2 bg-green-50 rounded p-2 border border-green-200">
            <div className="text-xs space-y-1">
              {/* Individual Product Prices */}
              <div className="text-gray-600">
                <div className="font-medium">পণ্যের মূল্য:</div>
                {packageDetails.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate">{getDurationText(item.duration)}</span>
                    <span>৳{item.price}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-1">
                {totalOriginalPrice > 0 && (
                  <div className="flex justify-between text-gray-500 line-through">
                    <span>মূল মূল্য:</span>
                    <span>৳{totalOriginalPrice}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-green-600">
                  <span>কম্বো মূল্য:</span>
                  <span>৳{comboPrice}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-orange-600 text-xs">
                    <span>সাশ্রয়:</span>
                    <span>৳{savings}</span>
                  </div>
                )}
              </div>
            </div>
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
