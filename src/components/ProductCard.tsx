
import React, { useState } from 'react';
import { Product, Package } from '../types';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [selectedPackage, setSelectedPackage] = useState<Package>(product.packages[0]);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();

  const getDurationText = (duration: Package['duration']) => {
    switch (duration) {
      case '1month': return '১ মাস';
      case '3month': return '৩ মাস';
      case '6month': return '৬ মাস';
      case 'lifetime': return 'লাইফটাইম';
    }
  };

  const handleAddToCart = () => {
    addToCart(product.id, selectedPackage.id);
    toast.success('কার্টে যোগ করা হয়েছে!');
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'প্রিয় তালিকা থেকে সরানো হয়েছে' : 'প্রিয় তালিকায় যোগ করা হয়েছে');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {selectedPackage.discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
            {selectedPackage.discount}% ছাড়
          </div>
        )}
        <button
          onClick={toggleFavorite}
          className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
        >
          <Heart 
            size={20} 
            className={isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'} 
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3">{product.description}</p>

        {/* Features */}
        <div className="flex flex-wrap gap-1 mb-4">
          {product.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Package Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">প্যাকেজ নির্বাচন করুন:</label>
          <select
            value={selectedPackage.id}
            onChange={(e) => {
              const pkg = product.packages.find(p => p.id === e.target.value);
              if (pkg) setSelectedPackage(pkg);
            }}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {product.packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {getDurationText(pkg.duration)} - ৳{pkg.price}
                {pkg.originalPrice && ` (আগে ৳${pkg.originalPrice})`}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-purple-600">৳{selectedPackage.price}</span>
            {selectedPackage.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">৳{selectedPackage.originalPrice}</span>
            )}
          </div>
          <div className="flex items-center text-yellow-500">
            <Star size={16} className="fill-current" />
            <span className="text-sm text-gray-600 ml-1">৪.৮</span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
        >
          <ShoppingCart size={20} />
          <span>কার্টে যোগ করুন</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
