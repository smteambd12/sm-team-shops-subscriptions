
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [selectedPackage, setSelectedPackage] = useState(product.packages[0]?.id || '');
  const { addToCart } = useCart();

  const selectedPkg = product.packages.find(pkg => pkg.id === selectedPackage);

  const handleAddToCart = () => {
    if (!selectedPackage) {
      toast.error('প্যাকেজ নির্বাচন করুন');
      return;
    }
    addToCart(product.id, selectedPackage);
    toast.success(`${product.name} কার্টে যোগ হয়েছে`);
  };

  const getDurationText = (duration: string) => {
    switch (duration) {
      case '1month': return '১ মাস';
      case '3month': return '৩ মাস';
      case '6month': return '৬ মাস';
      case 'lifetime': return 'লাইফটাইম';
      default: return duration;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      web: 'bg-blue-100 text-blue-800',
      mobile: 'bg-green-100 text-green-800',
      tutorial: 'bg-purple-100 text-purple-800'
    };
    const labels = {
      web: 'ওয়েব',
      mobile: 'মোবাইল',
      tutorial: 'টিউটোরিয়াল'
    };
    return (
      <Badge className={colors[category as keyof typeof colors]}>
        {labels[category as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2 sm:pb-4 p-2 sm:p-6">
        <div className="aspect-video relative mb-2 sm:mb-4 overflow-hidden rounded-lg">
          <img
            src={product.image || 'https://via.placeholder.com/400x300'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
            <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white p-1 sm:p-2 h-auto">
              <Heart size={12} className="sm:w-4 sm:h-4" />
            </Button>
          </div>
          {selectedPkg?.discount && (
            <div className="absolute top-1 sm:top-2 left-1 sm:left-2">
              <Badge className="bg-red-500 text-white text-xs sm:text-sm px-1 sm:px-2 py-0.5">
                {selectedPkg.discount}% ছাড়
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex items-start justify-between mb-1 sm:mb-2">
          <CardTitle className="text-sm sm:text-xl font-bold text-gray-800 leading-tight line-clamp-2">
            {product.name}
          </CardTitle>
          <div className="flex-shrink-0 ml-1">
            {getCategoryBadge(product.category)}
          </div>
        </div>
        
        <CardDescription className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2 hidden sm:block">
          {product.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-2 sm:p-6 pt-0">
        {/* Features - Hidden on mobile to save space */}
        {product.features && product.features.length > 0 && (
          <div className="mb-2 sm:mb-4 hidden sm:block">
            <h4 className="font-medium text-gray-800 mb-2 text-sm">বৈশিষ্ট্য:</h4>
            <div className="space-y-1">
              {product.features.slice(0, 2).map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <Star size={12} className="text-yellow-500 mr-2 flex-shrink-0" />
                  <span className="line-clamp-1">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Package Selection */}
        <div className="mb-2 sm:mb-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            প্যাকেজ:
          </label>
          <Select value={selectedPackage} onValueChange={setSelectedPackage}>
            <SelectTrigger className="w-full text-xs sm:text-sm">
              <SelectValue placeholder="প্যাকেজ নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              {product.packages.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id}>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs sm:text-sm">{getDurationText(pkg.duration)}</span>
                    <div className="ml-2 sm:ml-4 text-right">
                      <span className="font-bold text-xs sm:text-sm">৳{pkg.price}</span>
                      {pkg.originalPrice && (
                        <span className="text-xs text-gray-500 line-through ml-1 sm:ml-2">
                          ৳{pkg.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Display */}
        {selectedPkg && (
          <div className="mb-2 sm:mb-4 p-2 sm:p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">মূল্য:</span>
              <div className="text-right">
                <span className="text-lg sm:text-2xl font-bold text-gray-800">৳{selectedPkg.price}</span>
                {selectedPkg.originalPrice && (
                  <div className="text-xs sm:text-sm text-gray-500 line-through">
                    ৳{selectedPkg.originalPrice}
                  </div>
                )}
              </div>
            </div>
            {selectedPkg.discount && (
              <div className="text-xs sm:text-sm text-green-600 font-medium mt-1">
                সাশ্রয়: ৳{(selectedPkg.originalPrice || 0) - selectedPkg.price}
              </div>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        <Button 
          onClick={handleAddToCart}
          className="w-full mt-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 sm:py-3 rounded-lg transition-all duration-200 hover:shadow-lg text-xs sm:text-sm"
          disabled={!selectedPackage}
        >
          <ShoppingCart size={14} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">কার্টে যোগ করুন</span>
          <span className="sm:hidden">কার্ট</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
