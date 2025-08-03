
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
          // Find 1-month package or fallback to first package
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
    <Card className="w-full max-w-sm mx-auto bg-white border border-orange-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        {/* Header with Timer and Image */}
        <div className="relative">
          {/* Product Image */}
          <div className="aspect-video relative overflow-hidden">
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
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-mono flex items-center gap-1">
              <Clock size={12} />
              {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            
            {/* Discount Badge */}
            {product.discount_percentage && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-red-500 text-white text-xs animate-bounce">
                  {product.discount_percentage}% ছাড়
                </Badge>
              </div>
            )}
            
            {/* Combo Badge */}
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-purple-600 text-white text-xs">
                <Package2 size={10} className="mr-1" />
                কম্বো অফার
              </Badge>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-4">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
            {product.title}
          </h3>

          {/* Products List */}
          <div className="space-y-3">
            <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Package2 size={14} className="mr-2 text-purple-600" />
              কম্বো পণ্যসমূহ:
            </div>
            
            {packageDetails.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Star size={12} className="text-yellow-500 mr-2 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800 line-clamp-1">
                      {item.productName}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      ৳{item.price * item.quantity}
                    </div>
                    {item.originalPrice > item.price && (
                      <div className="text-xs text-gray-500 line-through">
                        ৳{item.originalPrice * item.quantity}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Duration Selection */}
                <Select
                  value={selectedPackages[item.productId] || item.packageId}
                  onValueChange={(value) => handlePackageChange(item.productId, value)}
                >
                  <SelectTrigger className="h-8 text-xs bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {item.packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        <div className="flex justify-between items-center w-full min-w-[120px]">
                          <span>{getDurationText(pkg.duration)}</span>
                          <div className="text-right ml-3">
                            <span className="font-medium text-green-600">৳{pkg.price}</span>
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

          {/* Pricing Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>মূল মূল্য:</span>
                <span className="line-through">৳{totalOriginalPrice}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-green-600">
                <span>কম্বো মূল্য:</span>
                <span>৳{comboPrice}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-orange-600 font-semibold bg-orange-100 rounded px-2 py-1">
                  <span>💰 সাশ্রয়:</span>
                  <span>৳{savings}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 rounded-lg p-2 text-center border border-purple-200">
              <div className="text-lg font-bold text-purple-600">{packageDetails.length}</div>
              <div className="text-xs text-purple-600 font-medium">ভিন্ন পণ্য</div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-2 text-center border border-indigo-200">
              <div className="text-lg font-bold text-indigo-600">
                {packageDetails.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
              <div className="text-xs text-indigo-600 font-medium">মোট পিস</div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button 
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:shadow-lg text-sm"
          >
            <ShoppingCart size={16} className="mr-2" />
            ৳{comboPrice} - কার্টে যোগ করুন
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactComboOfferCard;
