
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
      <CardHeader className="pb-4">
        <div className="aspect-video relative mb-4 overflow-hidden rounded-lg">
          <img
            src={product.image || 'https://via.placeholder.com/400x300'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white">
              <Heart size={16} />
            </Button>
          </div>
          {selectedPkg?.discount && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-red-500 text-white">
                {selectedPkg.discount}% ছাড়
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-xl font-bold text-gray-800 leading-tight">
            {product.name}
          </CardTitle>
          {getCategoryBadge(product.category)}
        </div>
        
        <CardDescription className="text-gray-600 text-sm leading-relaxed">
          {product.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2 text-sm">বৈশিষ্ট্য:</h4>
            <div className="space-y-1">
              {product.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <Star size={12} className="text-yellow-500 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Package Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            প্যাকেজ নির্বাচন করুন:
          </label>
          <Select value={selectedPackage} onValueChange={setSelectedPackage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="প্যাকেজ নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              {product.packages.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id}>
                  <div className="flex justify-between items-center w-full">
                    <span>{getDurationText(pkg.duration)}</span>
                    <div className="ml-4 text-right">
                      <span className="font-bold">৳{pkg.price}</span>
                      {pkg.originalPrice && (
                        <span className="text-sm text-gray-500 line-through ml-2">
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
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">মূল্য:</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-800">৳{selectedPkg.price}</span>
                {selectedPkg.originalPrice && (
                  <div className="text-sm text-gray-500 line-through">
                    ৳{selectedPkg.originalPrice}
                  </div>
                )}
              </div>
            </div>
            {selectedPkg.discount && (
              <div className="text-sm text-green-600 font-medium mt-1">
                আপনি সাশ্রয় করছেন: ৳{(selectedPkg.originalPrice || 0) - selectedPkg.price}
              </div>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        <Button 
          onClick={handleAddToCart}
          className="w-full mt-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 hover:shadow-lg"
          disabled={!selectedPackage}
        >
          <ShoppingCart size={18} className="mr-2" />
          কার্টে যোগ করুন
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
