
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { toast } from 'sonner';
import CartItem from '../components/CartItem';
import OrderSummary from '../components/OrderSummary';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { products, loading } = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number} | null>(null);

  const subtotal = getCartTotal();

  const handleCheckout = () => {
    if (!user) {
      toast.error('চেকআউট করতে প্রথমে লগইন করুন!');
      navigate('/auth');
      return;
    }
    // Redirect to dedicated checkout page
    navigate('/checkout');
  };

  const handlePromoApplied = (code: string, discount: number) => {
    setAppliedPromo({ code, discount });
  };

  const handlePromoRemoved = () => {
    setAppliedPromo(null);
  };

  // Calculate combo savings
  const calculateComboSavings = () => {
    let totalComboSavings = 0;
    let comboItemsCount = 0;

    items.forEach(item => {
      if (item.isComboItem) {
        const product = products.find(p => p.id === item.productId);
        const pkg = product?.packages.find(p => p.id === item.packageId);
        
        if (pkg && pkg.originalPrice && pkg.originalPrice > pkg.price) {
          const savings = (pkg.originalPrice - pkg.price) * item.quantity;
          totalComboSavings += savings;
          comboItemsCount += item.quantity;
        }
      }
    });

    return { totalComboSavings, comboItemsCount };
  };

  const { totalComboSavings, comboItemsCount } = calculateComboSavings();

  console.log('Cart items:', items);
  console.log('Available products:', products);
  console.log('Cart total:', subtotal);
  console.log('Combo savings:', { totalComboSavings, comboItemsCount });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
        <div className="container mx-auto px-2 sm:px-4 text-center">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/4 mb-4 sm:mb-6 mx-auto"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 sm:h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
        <div className="container mx-auto px-2 sm:px-4 text-center">
          <div className="max-w-md mx-auto">
            <ShoppingCart size={60} className="sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4 sm:mb-6" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4">আপনার কার্ট খালি</h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">কার্টে কোনো পণ্য নেই। কেনাকাটা শুরু করুন!</p>
            <Link 
              to="/"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:shadow-lg transition-all duration-200 inline-flex items-center space-x-2 text-sm sm:text-base"
            >
              <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
              <span>কেনাকাটা করুন</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center mb-4 sm:mb-8">
          <Link to="/" className="mr-2 sm:mr-4 p-1 sm:p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">শপিং কার্ট</h1>
        </div>

        {/* Combo Savings Banner */}
        {totalComboSavings > 0 && (
          <div className="mb-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-green-500 rounded-full p-2 mr-3">
                  <ShoppingCart className="text-white w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">🎉 কম্বো অফার সাশ্রয়!</h3>
                  <p className="text-sm text-green-700">
                    আপনি {comboItemsCount} টি কম্বো আইটেমে মোট ৳{totalComboSavings} সাশ্রয় করেছেন!
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">৳{totalComboSavings}</div>
                <div className="text-sm text-green-600">সাশ্রয়</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">আপনার পণ্যসমূহ ({items.length})</h2>
              
              <div className="space-y-4">
                {items.map((item) => {
                  const product = products.find(p => p.id === item.productId);
                  
                  console.log('Processing cart item:', { 
                    itemId: `${item.productId}-${item.packageId}`,
                    productFound: !!product,
                    productName: product?.name,
                    isComboItem: item.isComboItem
                  });
                  
                  if (!product) {
                    return (
                      <div key={`${item.productId}-${item.packageId}`} className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orange-800 mb-2">
                              {item.isComboItem ? '🎁 কম্বো অফার আইটেম' : 'অজানা পণ্য'}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">Product ID: {item.productId}</p>
                            <p className="text-sm text-gray-600 mb-2">Package ID: {item.packageId}</p>
                            <p className="text-sm text-gray-600 mb-2">পরিমাণ: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-600">এস্টিমেট মূল্য:</span>
                            <span className="font-medium block">৳{100 * item.quantity}</span>
                            <button
                              onClick={() => removeFromCart(item.productId, item.packageId)}
                              className="text-red-500 hover:text-red-700 text-sm bg-white px-3 py-1 rounded border mt-2"
                            >
                              সরান
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const packageInfo = product.packages.find(pkg => pkg.id === item.packageId);
                  
                  if (!packageInfo) {
                    return (
                      <div key={`${item.productId}-${item.packageId}`} className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                        <p className="text-yellow-700 mb-2">প্যাকেজ তথ্য পাওয়া যাচ্ছে না</p>
                        <p className="text-sm mb-2">{product.name} - Package ID: {item.packageId}</p>
                        <button
                          onClick={() => removeFromCart(item.productId, item.packageId)}
                          className="text-red-500 hover:text-red-700 text-sm bg-white px-3 py-1 rounded border"
                        >
                          কার্ট থেকে সরান
                        </button>
                      </div>
                    );
                  }

                  // Enhanced cart item display for combo items
                  if (item.isComboItem) {
                    const itemSavings = packageInfo.originalPrice && packageInfo.originalPrice > packageInfo.price 
                      ? (packageInfo.originalPrice - packageInfo.price) * item.quantity 
                      : 0;

                    return (
                      <div key={`${item.productId}-${item.packageId}`} className="relative">
                        {/* Combo Item Badge */}
                        <div className="absolute -top-2 -left-2 z-10">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                            🎁 কম্বো অফার
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4">
                          <CartItem
                            item={item}
                            product={product}
                            onUpdateQuantity={updateQuantity}
                            onRemoveFromCart={removeFromCart}
                          />
                          
                          {/* Combo Savings Display */}
                          {itemSavings > 0 && (
                            <div className="mt-3 bg-green-100 rounded-lg p-3 border border-green-200">
                              <div className="flex justify-between items-center">
                                <span className="text-green-800 font-medium">💰 কম্বো সাশ্রয়:</span>
                                <span className="text-green-600 font-bold">৳{itemSavings}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <CartItem
                      key={`${item.productId}-${item.packageId}`}
                      item={item}
                      product={product}
                      onUpdateQuantity={updateQuantity}
                      onRemoveFromCart={removeFromCart}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              subtotal={subtotal}
              appliedPromo={appliedPromo}
              onCheckout={handleCheckout}
              onPromoApplied={handlePromoApplied}
              onPromoRemoved={handlePromoRemoved}
              comboSavings={totalComboSavings}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
