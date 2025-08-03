
import React from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';
import CustomerInfoForm from './checkout/CustomerInfoForm';
import PaymentMethodForm from './checkout/PaymentMethodForm';
import EmptyCart from './checkout/EmptyCart';

const CheckoutForm = () => {
  const { items } = useCart();
  const {
    loading,
    customerInfo,
    setCustomerInfo,
    paymentMethod,
    setPaymentMethod,
    transactionId,
    setTransactionId,
    subtotal,
    finalTotal,
    getPaymentNumber,
    getPaymentMethodName,
    handleSubmit,
    products
  } = useCheckoutForm();

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6">অর্ডার সারাংশ</h2>
          
          <div className="space-y-4">
            {items.map((item) => {
              const product = products.find(p => p.id === item.productId);
              const packageInfo = product?.packages.find(pkg => pkg.id === item.packageId);
              
              if (!product || !packageInfo) return null;

              const getDurationText = (duration: string) => {
                switch (duration) {
                  case '1month': return '১ মাস';
                  case '3month': return '৩ মাস';
                  case '6month': return '৬ মাস';
                  case 'lifetime': return 'লাইফটাইম';
                  default: return duration;
                }
              };

              return (
                <div key={`${item.productId}-${item.packageId}`} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">{product.name}</h3>
                      <p className="text-sm text-gray-600">
                        {getDurationText(packageInfo.duration)} • পরিমাণ: {item.quantity}
                      </p>
                      {item.isComboItem && (
                        <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full mt-1">
                          🎁 কম্বো অফার
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      ৳{(packageInfo.price * item.quantity).toLocaleString()}
                    </p>
                    {packageInfo.originalPrice && packageInfo.originalPrice > packageInfo.price && (
                      <p className="text-sm text-gray-500 line-through">
                        ৳{(packageInfo.originalPrice * item.quantity).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">মোট:</span>
              <span className="text-2xl font-bold text-purple-600">
                ৳{finalTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <CustomerInfoForm
              customerInfo={customerInfo}
              onCustomerInfoChange={setCustomerInfo}
            />

            <PaymentMethodForm
              paymentMethod={paymentMethod}
              transactionId={transactionId}
              onPaymentMethodChange={setPaymentMethod}
              onTransactionIdChange={setTransactionId}
              getPaymentNumber={getPaymentNumber}
              getPaymentMethodName={getPaymentMethodName}
              finalTotal={finalTotal}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'অর্ডার করা হচ্ছে...' : `৳${finalTotal.toLocaleString()} - অর্ডার করুন`}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
