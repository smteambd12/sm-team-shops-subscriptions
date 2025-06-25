
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { products, paymentMethods, promoCodes } from '../data/products';
import { toast } from 'sonner';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number} | null>(null);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0]);
  const [showPayment, setShowPayment] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const subtotal = getCartTotal();
  const promoDiscount = appliedPromo ? appliedPromo.discount : 0;
  const total = subtotal - promoDiscount;

  const handleApplyPromo = () => {
    const validPromo = promoCodes.find(p => p.code === promoCode.toUpperCase());
    if (validPromo) {
      setAppliedPromo({code: validPromo.code, discount: validPromo.discount});
      toast.success(`প্রোমো কোড প্রয়োগ হয়েছে! ${validPromo.description}`);
    } else {
      toast.error('প্রোমো কোড সঠিক নয়!');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('চেকআউট করতে প্রথমে লগইন করুন!');
      navigate('/login');
      return;
    }
    setShowPayment(true);
  };

  const handleOrderComplete = () => {
    if (!transactionId.trim()) {
      toast.error('ট্রানজেকশন আইডি দিন!');
      return;
    }

    // Mock order creation
    const orderId = 'ORD-' + Date.now();
    toast.success(`অর্ডার সফল হয়েছে! অর্ডার নম্বর: ${orderId}`);
    clearCart();
    navigate('/orders');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('কপি হয়েছে!');
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <ShoppingCart size={80} className="text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">আপনার কার্ট খালি</h2>
            <p className="text-gray-600 mb-8">কার্টে কোনো পণ্য নেই। কেনাকাটা শুরু করুন!</p>
            <Link 
              to="/"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-200 inline-flex items-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>কেনাকাটা করুন</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-8">
          <Link to="/" className="mr-4 p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">শপিং কার্ট</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6">আপনার পণ্যসমূহ ({items.length})</h2>
              
              {items.map((item) => {
                const product = products.find(p => p.id === item.productId);
                const pkg = product?.packages.find(p => p.id === item.packageId);
                
                if (!product || !pkg) return null;

                return (
                  <div key={`${item.productId}-${item.packageId}`} className="flex items-center border-b border-gray-200 py-6 last:border-b-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1 ml-4">
                      <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                      <p className="text-gray-600 text-sm">{product.description}</p>
                      <p className="text-purple-600 font-medium">প্যাকেজ: {getDurationText(pkg.duration)}</p>
                    </div>
                    
                    <div className="flex items-center mx-4">
                      <button
                        onClick={() => updateQuantity(item.productId, item.packageId, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="mx-3 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.packageId, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-lg">৳{pkg.price * item.quantity}</div>
                      {pkg.originalPrice && (
                        <div className="text-sm text-gray-500 line-through">৳{pkg.originalPrice * item.quantity}</div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.productId, item.packageId)}
                      className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-6">অর্ডার সামারি</h2>
              
              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">প্রোমো কোড</label>
                <div className="flex">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="প্রোমো কোড লিখুন"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700 transition-colors"
                  >
                    প্রয়োগ
                  </button>
                </div>
                {appliedPromo && (
                  <p className="text-green-600 text-sm mt-2">✓ {appliedPromo.code} প্রয়োগ হয়েছে</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>সাবটোটাল:</span>
                  <span>৳{subtotal}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>প্রোমো ছাড়:</span>
                    <span>-৳{promoDiscount}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>মোট:</span>
                    <span>৳{total}</span>
                  </div>
                </div>
              </div>

              {!showPayment ? (
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                >
                  চেকআউট করুন
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Payment Method Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">পেমেন্ট মেথড</label>
                    <div className="grid grid-cols-3 gap-2">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.name}
                          onClick={() => setSelectedPayment(method)}
                          className={`p-3 border rounded-lg text-center transition-colors ${
                            selectedPayment.name === method.name 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-2xl mb-1">{method.icon}</div>
                          <div className="text-sm font-medium">{method.displayName}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">{selectedPayment.displayName} এ পেমেন্ট করুন:</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span>নম্বর: {selectedPayment.number}</span>
                      <button
                        onClick={() => copyToClipboard(selectedPayment.number)}
                        className="text-purple-600 text-sm hover:underline"
                      >
                        কপি করুন
                      </button>
                    </div>
                    <div className="text-lg font-bold text-purple-600">পরিমাণ: ৳{total}</div>
                  </div>

                  {/* Transaction ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ট্রানজেকশন আইডি</label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="ট্রানজেকশন আইডি লিখুন"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <button
                    onClick={handleOrderComplete}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    অর্ডার সম্পন্ন করুন
                  </button>

                  <button
                    onClick={() => setShowPayment(false)}
                    className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ফিরে যান
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
