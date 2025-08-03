
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

  // Initialize with 1-month packages by default
  useEffect(() => {
    if (product.offer_items && product.offer_items.length > 0) {
      const defaultSelections: {[key: string]: string} = {};
      product.offer_items.forEach(item => {
        const actualProduct = products.find(p => p.id === item.product_id);
        if (actualProduct && actualProduct.packages.length > 0) {
          const oneMonthPackage = actualProduct.packages.find(pkg => pkg.duration === '1month');
          defaultSelections[item.product_id] = oneMonthPackage?.id || actualProduct.packages[0].id;
        } else {
          defaultSelections[item.product_id] = item.package_id;
        }
      });
      setSelectedPackages(defaultSelections);
    }
  }, [product.offer_items, products]);

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
    <Card className="w-full bg-white border border-orange-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        {/* Top Section: Image and Timer */}
        <div className="relative h-40 sm:h-48">
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
              <Gift className="w-12 h-12 text-orange-400" />
            </div>
          )}
          
          {/* Timer Badge */}
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
            <Clock size={10} />
            {String(timeLeft.hours).padStart(2, '0')}:
            {String(timeLeft.minutes).padStart(2, '0')}:
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          
          {/* Discount Badge */}
          {product.discount_percentage && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-red-500 text-white text-xs animate-bounce">
                {product.discount_percentage}% ছাড়
              </Badge>
            </div>
          )}
          
          {/* Combo Badge */}
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-purple-600 text-white text-xs">
              <Package2 size={10} className="mr-1" />
              কম্বো অফার
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
            {product.title}
          </h3>

          {/* Package Selection Grid */}
          <div className="mb-4">
            <div className="flex items-center text-xs font-medium text-gray-700 mb-2">
              <Package2 size={12} className="mr-1 text-purple-600" />
              প্যাকেজ সিলেক্ট করুন:
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {packageDetails.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-2 border">
                  <div className="flex items-center mb-1">
                    <Star size={10} className="text-yellow-500 mr-1 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-800 truncate">
                      {item.productName}
                    </span>
                  </div>
                  
                  <Select
                    value={selectedPackages[item.productId] || item.packageId}
                    onValueChange={(value) => handlePackageChange(item.productId, value)}
                  >
                    <SelectTrigger className="h-7 text-xs bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {item.packages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          <div className="flex justify-between items-center w-full min-w-[100px]">
                            <span>{getDurationText(pkg.duration)}</span>
                            <div className="text-right ml-2">
                              <span className="font-medium text-green-600 text-xs">৳{pkg.price}</span>
                              {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                <span className="text-xs text-gray-500 line-through ml-1">৳{pkg.originalPrice}</span>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Section - Horizontal Layout */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200 mb-3">
            <div className="flex justify-between items-center">
              <div className="text-left">
                <div className="text-xs text-gray-600">মূল মূল্য:</div>
                <div className="text-xs text-gray-600 line-through">৳{totalOriginalPrice}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-green-600">কম্বো মূল্য:</div>
                <div className="text-lg font-bold text-green-600">৳{comboPrice}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-orange-600">সাশ্রয়:</div>
                <div className="text-sm font-bold text-orange-600">৳{savings}</div>
              </div>
            </div>
          </div>

          {/* Stats - Horizontal Layout */}
          <div className="flex justify-between mb-3">
            <div className="text-center flex-1">
              <div className="text-sm font-bold text-purple-600">{packageDetails.length}</div>
              <div className="text-xs text-purple-600">পণ্য</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-sm font-bold text-indigo-600">
                {packageDetails.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
              <div className="text-xs text-indigo-600">পিস</div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button 
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2 rounded-lg transition-all duration-200 hover:shadow-lg text-sm"
          >
            <ShoppingCart size={14} className="mr-2" />
            ৳{comboPrice} - কার্টে যোগ করুন
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactComboOfferCard;
