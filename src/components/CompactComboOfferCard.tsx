
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Gift, Clock, Package2 } from 'lucide-react';
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

  // Timer countdown
  useEffect(() => {
    const targetTime = new Date();
    targetTime.setHours(23, 59, 59, 999);
    
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
    if (!product.offer_items || product.offer_items.length === 0) {
      toast.error('এই অফারে কোন পণ্য নেই');
      return;
    }

    let addedItems = 0;
    
    product.offer_items.forEach(item => {
      const selectedPackage = selectedPackages[item.product_id] || item.package_id;
      
      for (let i = 0; i < item.quantity; i++) {
        addToCart(item.product_id, selectedPackage, true);
        addedItems++;
      }
    });

    if (addedItems > 0) {
      toast.success(`${product.title} কার্টে যোগ করা হয়েছে! (${addedItems}টি আইটেম)`);
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

  // Calculate pricing
  const calculatePricing = () => {
    let totalOriginalPrice = 0;
    
    const packageDetails = product.offer_items?.slice(0, 3).map(item => {
      const actualProduct = products.find(p => p.id === item.product_id);
      const selectedPackageId = selectedPackages[item.product_id] || item.package_id;
      const selectedPackage = actualProduct?.packages.find(pkg => pkg.id === selectedPackageId);
      
      const originalPrice = selectedPackage?.originalPrice || selectedPackage?.price || 0;
      totalOriginalPrice += originalPrice * item.quantity;
      
      return {
        productName: actualProduct?.name || 'পণ্য',
        packageId: selectedPackageId,
        duration: selectedPackage?.duration || '',
        price: selectedPackage?.price || 0,
        originalPrice: originalPrice,
        quantity: item.quantity,
        productId: item.product_id,
        packages: actualProduct?.packages || []
      };
    }) || [];

    return {
      packageDetails,
      totalOriginalPrice,
      comboPrice: product.offer_price || 0,
      savings: Math.max(0, totalOriginalPrice - (product.offer_price || 0))
    };
  };

  const { packageDetails, totalOriginalPrice, comboPrice, savings } = calculatePricing();
  const isVideo = product.image_url?.includes('.mp4') || product.image_url?.includes('.webm');

  return (
    <Card className="w-full max-w-2xl h-64 hover:shadow-lg transition-all duration-300 border border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
      <CardContent className="p-4 h-full">
        <div className="grid grid-cols-4 gap-4 h-full">
          {/* Left Section - Timer & Image */}
          <div className="col-span-1 flex flex-col">
            {/* Timer */}
            <div className="bg-red-100 rounded-lg p-2 mb-2 text-center">
              <div className="flex items-center justify-center gap-1 text-red-600">
                <Clock size={12} />
                <span className="text-xs font-mono font-bold">
                  {String(timeLeft.hours).padStart(2, '0')}:
                  {String(timeLeft.minutes).padStart(2, '0')}:
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
            
            {/* Image */}
            <div className="aspect-square relative overflow-hidden rounded-lg flex-1">
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
          </div>

          {/* Middle Section - Product Info & Packages */}
          <div className="col-span-2 flex flex-col">
            {/* Product Name */}
            <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-1">
              {product.title}
            </h4>
            
            {/* Products List (Max 3) */}
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                <Package2 size={12} className="mr-1" />
                কম্বো পণ্যসমূহ:
              </div>
              <div className="space-y-1">
                {packageDetails.map((item, index) => (
                  <div key={index} className="bg-white rounded p-2 border border-gray-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-medium text-gray-800 line-clamp-1">
                        {item.productName}
                      </span>
                      <span className="text-xs text-gray-600 line-through">
                        ৳{item.originalPrice}
                      </span>
                    </div>
                    
                    {/* Duration Selection */}
                    <Select
                      value={selectedPackages[item.productId] || item.packageId}
                      onValueChange={(value) => handlePackageChange(item.productId, value)}
                    >
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {item.packages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {getDurationText(pkg.duration)} - ৳{pkg.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section - Pricing */}
          <div className="col-span-1 flex flex-col justify-between">
            {/* Pricing Info */}
            <div className="bg-green-50 rounded-lg p-3 border border-green-200 mb-2">
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">মূল মূল্য:</div>
                <div className="text-sm font-bold text-gray-500 line-through mb-2">
                  ৳{totalOriginalPrice}
                </div>
                
                <div className="text-xs text-gray-600 mb-1">কম্বো মূল্য:</div>
                <div className="text-lg font-bold text-green-600 mb-2">
                  ৳{comboPrice}
                </div>
                
                {savings > 0 && (
                  <>
                    <div className="text-xs text-orange-600 mb-1">সাশ্রয়:</div>
                    <div className="text-sm font-semibold text-orange-600">
                      ৳{savings}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button 
              onClick={handleAddToCart}
              size="sm"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs h-8"
            >
              <ShoppingCart size={12} className="mr-1" />
              কার্টে যোগ করুন
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactComboOfferCard;
