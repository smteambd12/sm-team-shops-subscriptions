
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useIsMobile } from '@/hooks/use-mobile';
import FavoriteButton from './FavoriteButton';
import { ShoppingCart, Package, Clock, DollarSign, Percent, Check } from 'lucide-react';

interface ProductPackage {
  id: string;
  duration: string;
  price: number;
  originalPrice?: number;
  discount?: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  image?: string;
  features: string[];
  packages: ProductPackage[];
}

interface MobileProductCardProps {
  product: Product;
}

const MobileProductCard: React.FC<MobileProductCardProps> = ({ product }) => {
  const [selectedPackage, setSelectedPackage] = useState<string>(product.packages[0]?.id || '');
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();
  const isMobile = useIsMobile();

  const getDurationLabel = (duration: string) => {
    const labels = {
      '1month': '১ মাস',
      '3month': '৩ মাস',
      '6month': '৬ মাস',
      'lifetime': 'লাইফটাইম'
    };
    return labels[duration as keyof typeof labels] || duration;
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString('bn-BD')}`;
  };

  const selectedPkg = product.packages.find(p => p.id === selectedPackage);

  const handleAddToCart = () => {
    if (selectedPkg) {
      addToCart({
        productId: product.id,
        packageId: selectedPkg.id,
        quantity: 1
      });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
      isMobile ? 'mx-2' : ''
    }`}>
      <CardHeader className="p-0">
        {/* Product Image */}
        <div className="relative">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className={`w-full object-cover ${isMobile ? 'h-48' : 'h-56'}`}
            />
          ) : (
            <div className={`w-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ${
              isMobile ? 'h-48' : 'h-56'
            }`}>
              <Package className="h-16 w-16 text-white" />
            </div>
          )}
          
          {/* Favorite Button */}
          <div className="absolute top-3 right-3">
            <FavoriteButton productId={product.id} />
          </div>
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/90 text-gray-800 text-xs">
              {product.category === 'web' ? 'ওয়েব' : 
               product.category === 'mobile' ? 'মোবাইল' : 
               product.category === 'tutorial' ? 'টিউটোরিয়াল' : product.category}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
        {/* Product Info */}
        <div className="space-y-4">
          <div>
            <h3 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'} leading-tight`}>
              {product.name}
            </h3>
            <p className={`text-gray-600 mt-2 ${isMobile ? 'text-sm' : 'text-base'} line-clamp-2`}>
              {product.description}
            </p>
          </div>

          {/* Features - Mobile Optimized */}
          {product.features.length > 0 && (
            <div className="space-y-2">
              <h4 className={`font-semibold text-gray-800 ${isMobile ? 'text-sm' : 'text-base'}`}>
                বৈশিষ্ট্যসমূহ:
              </h4>
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-1`}>
                {product.features.slice(0, isMobile ? 3 : 4).map((feature, index) => (
                  <div key={index} className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
                    <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                    <span className="truncate">{feature}</span>
                  </div>
                ))}
                {product.features.length > (isMobile ? 3 : 4) && (
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                    +{product.features.length - (isMobile ? 3 : 4)} আরও...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Package Selection - Mobile Optimized */}
          <div className="space-y-3">
            <h4 className={`font-semibold text-gray-800 ${isMobile ? 'text-sm' : 'text-base'}`}>
              প্যাকেজ নির্বাচন করুন:
            </h4>
            <RadioGroup 
              value={selectedPackage} 
              onValueChange={setSelectedPackage}
              className="space-y-2"
            >
              {product.packages.map((pkg) => (
                <div key={pkg.id} className="flex items-center space-x-3">
                  <RadioGroupItem value={pkg.id} id={pkg.id} />
                  <Label 
                    htmlFor={pkg.id} 
                    className={`flex-1 flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPackage === pkg.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className={`font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                          {getDurationLabel(pkg.duration)}
                        </div>
                        {pkg.discount && (
                          <div className="flex items-center gap-1">
                            <Percent className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">
                              {pkg.discount}% ছাড়
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-bold text-blue-600 ${isMobile ? 'text-base' : 'text-lg'}`}>
                        {formatCurrency(pkg.price)}
                      </div>
                      {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                        <div className={`text-gray-500 line-through ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          {formatCurrency(pkg.originalPrice)}
                        </div>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Price Display */}
          {selectedPkg && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`${isMobile ? 'text-sm' : 'text-base'} text-blue-800 font-medium`}>
                    নির্বাচিত প্যাকেজ
                  </div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-blue-600`}>
                    {getDurationLabel(selectedPkg.duration)} মেয়াদ
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-blue-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                    {formatCurrency(selectedPkg.price)}
                  </div>
                  {selectedPkg.originalPrice && selectedPkg.originalPrice > selectedPkg.price && (
                    <div className={`text-gray-500 line-through ${isMobile ? 'text-sm' : 'text-base'}`}>
                      {formatCurrency(selectedPkg.originalPrice)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button 
            onClick={handleAddToCart}
            className={`w-full font-medium transition-all duration-300 ${
              isMobile ? 'h-12 text-base' : 'h-14 text-lg'
            } ${
              addedToCart 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={!selectedPkg}
          >
            {addedToCart ? (
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                কার্টে যোগ হয়েছে!
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                কার্টে যোগ করুন
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileProductCard;
