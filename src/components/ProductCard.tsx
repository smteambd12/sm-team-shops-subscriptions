
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import FavoriteButton from './FavoriteButton';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (packageId: string, price: number) => {
    addToCart(product.id, packageId, 1);
    toast.success(`${product.name} কার্টে যোগ করা হয়েছে!`);
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap = {
      web: 'ওয়েব সাবস্ক্রিপশন',
      mobile: 'মোবাইল অ্যাপস',
      tutorial: 'টিউটোরিয়াল'
    };
    return categoryMap[category as keyof typeof categoryMap] || category;
  };

  const getDurationText = (duration: string) => {
    const durationMap = {
      '1month': '১ মাস',
      '3month': '৩ মাস',
      '6month': '৬ মাস',
      'lifetime': 'আজীবন'
    };
    return durationMap[duration as keyof typeof durationMap] || duration;
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 left-2">
          <Badge variant="secondary">{getCategoryBadge(product.category)}</Badge>
        </div>
        <div className="absolute top-2 right-2">
          <FavoriteButton productId={product.id} />
        </div>
      </div>
      
      <CardHeader className="flex-grow">
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <CardDescription className="text-sm">{product.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Features */}
          <div>
            <h4 className="font-semibold text-sm mb-2">বৈশিষ্ট্য:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {product.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Packages */}
          <div>
            <h4 className="font-semibold text-sm mb-2">প্যাকেজ সমূহ:</h4>
            <div className="space-y-2">
              {product.packages.map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium text-sm">{getDurationText(pkg.duration)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-purple-600">
                        ৳{pkg.price.toLocaleString()}
                      </span>
                      {pkg.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ৳{pkg.originalPrice.toLocaleString()}
                        </span>
                      )}
                      {pkg.discount && (
                        <Badge variant="destructive" className="text-xs">
                          {pkg.discount}% ছাড়
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(pkg.id, pkg.price)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <ShoppingCart size={14} className="mr-1" />
                    কার্ট
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
