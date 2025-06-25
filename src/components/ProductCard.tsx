
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import FavoriteButton from './FavoriteButton';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (packageId: string) => {
    addToCart(product.id, packageId, 1);
    toast({
      title: "কার্টে যোগ করা হয়েছে",
      description: `${product.name} কার্টে যোগ করা হয়েছে।`,
    });
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'web':
        return 'bg-blue-100 text-blue-800';
      case 'mobile':
        return 'bg-green-100 text-green-800';
      case 'tutorial':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'web':
        return 'ওয়েব সার্ভিস';
      case 'mobile':
        return 'মোবাইল অ্যাপ';
      case 'tutorial':
        return 'টিউটোরিয়াল';
      default:
        return category;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <Badge className={getCategoryBadgeColor(product.category)}>
            {getCategoryName(product.category)}
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
          <FavoriteButton productId={product.id} />
        </div>
        {product.packages[0]?.discount && (
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-red-500 text-white">
              {product.packages[0].discount}% ছাড়
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
          {product.name}
        </CardTitle>
        <CardDescription className="text-gray-600 line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Features */}
        <div className="flex flex-wrap gap-1">
          {product.features.slice(0, 3).map((feature, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {feature}
            </Badge>
          ))}
          {product.features.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{product.features.length - 3} আরো
            </Badge>
          )}
        </div>

        {/* Pricing */}
        <div className="space-y-2">
          {product.packages.slice(0, 2).map((pkg) => (
            <div key={pkg.id} className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <span className="font-medium text-sm">
                  {pkg.duration === '1month' && '১ মাস'}
                  {pkg.duration === '3month' && '৩ মাস'}
                  {pkg.duration === '6month' && '৬ মাস'}
                  {pkg.duration === 'lifetime' && 'আজীবন'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-600">৳{pkg.price.toLocaleString()}</span>
                  {pkg.originalPrice && (
                    <span className="text-xs text-gray-500 line-through">
                      ৳{pkg.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleAddToCart(pkg.id)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <ShoppingCart size={14} className="mr-1" />
                কার্ট
              </Button>
            </div>
          ))}
        </div>

        {/* View Details Link */}
        <Link 
          to={`/categories/${product.category}`}
          className="block w-full text-center py-2 text-purple-600 hover:text-purple-800 font-medium text-sm border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
        >
          বিস্তারিত দেখুন
        </Link>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
