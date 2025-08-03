
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, ShoppingCart, Heart, Package, Gift, Package2, Clock } from 'lucide-react';
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
  const [selectedPackages, setSelectedPackages] = useState<{[key: string]: string}>({});

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
          {product.description || `${packageDetails.length} টি পণ্যের কম্বো প্যাকেজ`}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-2 sm:p-6 pt-0">
        {/* Package Selection */}
        <div className="mb-3 bg-blue-50 rounded-lg p-3 border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2 text-sm flex items-center">
            <Package2 size={14} className="mr-1" />
            প্যাকেজ নির্বাচন করুন:
          </h4>
          <div className="space-y-2">
            {packageDetails.map((item, index) => {
              const productId = product.offer_items?.[index]?.product_id;
              const actualProduct = products.find(p => p.id === productId);
              
              return (
                <div key={index} className="bg-white rounded p-2 border border-blue-100">
                  <div className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Star size={12} className="text-yellow-500 mr-1" />
                    {item.productName} ({item.quantity} টি)
                  </div>
                  <Select
                    value={selectedPackages[productId || ''] || item.packageId}
                    onValueChange={(value) => productId && handlePackageChange(productId, value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actualProduct?.packages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{getDurationText(pkg.duration)}</span>
                            <span className="ml-2 font-medium">৳{pkg.price}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-gray-600 mt-1">
                    নির্বাচিত প্যাকেজ: {getDurationText(item.duration)} - ৳{item.price}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Pricing Display */}
        <div className="mb-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="text-sm space-y-2">
            <div className="font-medium text-green-800 border-b border-green-200 pb-1">
              মূল্য বিবরণ:
            </div>
            
            {/* Individual Product Prices */}
            <div className="space-y-1">
              {packageDetails.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-white rounded px-2 py-1">
                  <span className="font-medium">{item.productName}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">{getDurationText(item.duration)}</span>
                    <span className="font-medium">৳{item.price}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-green-200 pt-2 space-y-1">
              {totalOriginalPrice > 0 && (
                <div className="flex justify-between text-gray-500 line-through text-sm">
                  <span>মোট মূল মূল্য:</span>
                  <span>৳{totalOriginalPrice}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-green-600 text-lg">
                <span>কম্বো মূল্য:</span>
                <span>৳{comboPrice}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-orange-600 font-medium">
                  <span>💰 সাশ্রয়:</span>
                  <span>৳{savings}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-purple-50 rounded-lg p-2 text-center border border-purple-200">
            <div className="text-lg font-bold text-purple-600">{packageDetails.length}</div>
            <div className="text-xs text-purple-600">ভিন্ন পণ্য</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-2 text-center border border-indigo-200">
            <div className="text-lg font-bold text-indigo-600">
              {packageDetails.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
            <div className="text-xs text-indigo-600">মোট পিস</div>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button 
          onClick={handleAddToCart}
          className="w-full mt-auto bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 hover:from-orange-600 hover:via-red-600 hover:to-yellow-600 text-white font-medium py-3 rounded-lg transition-all duration-200 hover:shadow-lg"
        >
          <ShoppingCart size={16} className="mr-2" />
          কার্টে যোগ করুন
        </Button>
      </CardContent>
    </Card>
  );
};

export default ComboOfferCard;
