
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Gift, Star, Package, Check } from 'lucide-react';
import { OfferProduct } from '@/types/popularProducts';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';

interface OfferProductCardProps {
  product: OfferProduct;
}

const OfferProductCard = ({ product }: OfferProductCardProps) => {
  const { addToCart } = useCart();
  const { products } = useProducts();

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Adding offer to cart:', product);
    
    // Check if offer has items
    if (!product.offer_items || product.offer_items.length === 0) {
      toast.error('এই অফারে কোন পণ্য নেই');
      return;
    }

    let addedItems = 0;
    let totalItems = 0;

    // Add all offer items to cart
    product.offer_items.forEach(item => {
      totalItems += item.quantity;
      
      for (let i = 0; i < item.quantity; i++) {
        console.log('Adding to cart:', {
          productId: item.product_id,
          packageId: item.package_id,
          quantity: 1
        });
        
        // Find the actual product to verify it exists
        const actualProduct = products.find(p => p.id === item.product_id);
        if (actualProduct) {
          const actualPackage = actualProduct.packages.find(pkg => pkg.id === item.package_id);
          if (actualPackage) {
            addToCart(item.product_id, item.package_id);
            addedItems++;
            console.log(`Added: ${actualProduct.name} - ${actualPackage.duration} - ৳${actualPackage.price}`);
          } else {
            console.error('Package not found:', item.package_id);
            toast.error(`প্যাকেজ খুঁজে পাওয়া যায়নি`);
          }
        } else {
          console.error('Product not found:', item.product_id);
          toast.error(`পণ্য খুঁজে পাওয়া যায়নি`);
        }
      }
    });

    if (addedItems > 0) {
      toast.success(`🎉 ${product.title} কার্টে যোগ করা হয়েছে! (${addedItems} টি পণ্য)`);
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

  const getDurationText = (duration: string) => {
    switch (duration) {
      case '1month': return '১ মাস';
      case '3month': return '৩ মাস';
      case '6month': return '৬ মাস';
      case 'lifetime': return 'লাইফটাইম';
      default: return duration;
    }
  };

  const totalOriginalPrice = includedProducts.reduce((sum, item) => 
    sum + (item.originalPrice * item.quantity), 0
  );

  const actualOfferPrice = product.offer_price || 0;
  const savings = totalOriginalPrice - actualOfferPrice;

  return (
    <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-orange-300 bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 backdrop-blur-sm min-w-[320px] max-w-[320px] transform hover:scale-105 relative overflow-hidden">
      <CardContent className="p-0 relative">
        {/* Header with discount badge */}
        <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 p-4">
          <div className="absolute top-2 left-2">
            <Badge className="bg-red-600 text-white shadow-lg animate-bounce border-0 text-sm px-3 py-1 font-bold">
              🔥 {product.discount_percentage}% ছাড়
            </Badge>
          </div>
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-600 text-white shadow-lg border-0 text-xs px-2 py-1">
              বিশেষ অফার
            </Badge>
          </div>
          <div className="text-center mt-6 mb-2">
            <Gift className="w-12 h-12 text-white mx-auto mb-2" />
            <h3 className="text-xl font-bold text-white drop-shadow-lg">
              বিগ বান্ডেল অফার
            </h3>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Offer Title */}
          <div className="text-center">
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              {product.title}
            </h4>
            {product.description && (
              <p className="text-sm text-gray-600">
                {product.description}
              </p>
            )}
          </div>

          {/* Included Products */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800 text-sm">
                এই অফারে যা পাবেন:
              </span>
            </div>
            <div className="space-y-2">
              {includedProducts.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-white rounded p-2 border">
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-green-600" />
                    <div>
                      <span className="text-sm font-medium text-gray-800">
                        {item.name}
                      </span>
                      <div className="text-xs text-gray-600">
                        {getDurationText(item.duration)} • {item.quantity} টি
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 line-through">
                      ৳{item.originalPrice * item.quantity}
                    </div>
                    <div className="text-sm font-bold text-green-600">
                      এখন ফ্রি!
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg text-gray-500 line-through">
                  ৳{totalOriginalPrice}
                </span>
                <Badge variant="outline" className="text-red-600 border-red-600 text-xs">
                  -{product.discount_percentage}%
                </Badge>
              </div>
              <div className="text-3xl font-bold text-green-600">
                ৳{actualOfferPrice}
              </div>
              <div className="text-sm text-gray-600">
                💰 আপনি সাশ্রয় করবেন: <span className="font-bold text-orange-600">৳{savings}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-purple-50 rounded-lg p-2 text-center border border-purple-200">
              <div className="text-lg font-bold text-purple-600">
                {includedProducts.length}
              </div>
              <div className="text-xs text-purple-600">ভিন্ন পণ্য</div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-2 text-center border border-indigo-200">
              <div className="text-lg font-bold text-indigo-600">
                {includedProducts.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
              <div className="text-xs text-indigo-600">মোট পিস</div>
            </div>
          </div>

          {/* Buy Button */}
          <Button 
            onClick={handleBuyNow}
            className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 hover:from-orange-600 hover:via-red-600 hover:to-yellow-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 py-3 text-base font-bold"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            কার্টে যোগ করুন - ৳{actualOfferPrice}
          </Button>

          {/* Features */}
          <div className="text-center bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span>তাৎক্ষণিক ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" />
                <span>১০০% নিরাপদ</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfferProductCard;
