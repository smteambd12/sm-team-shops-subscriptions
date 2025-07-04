
import React from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';
import { useIsMobile } from '@/hooks/use-mobile';
import CustomerInfoForm from './checkout/CustomerInfoForm';
import PaymentMethodForm from './checkout/PaymentMethodForm';
import CheckoutOrderSummary from './checkout/CheckoutOrderSummary';
import EmptyCart from './checkout/EmptyCart';

const MobileResponsiveCheckout = () => {
  const { items } = useCart();
  const isMobile = useIsMobile();
  const {
    loading,
    customerInfo,
    setCustomerInfo,
    paymentMethod,
    setPaymentMethod,
    transactionId,
    setTransactionId,
    promoDiscount,
    appliedPromoCode,
    subtotal,
    finalTotal,
    handlePromoApplied,
    handlePromoRemoved,
    getPaymentNumber,
    getPaymentMethodName,
    handleSubmit,
    products
  } = useCheckoutForm();

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Mobile-first layout */}
        <div className={`${isMobile ? 'space-y-6' : 'grid lg:grid-cols-2 gap-8'}`}>
          {/* Order Summary - On top for mobile */}
          <div className={isMobile ? 'order-first' : 'order-last'}>
            <CheckoutOrderSummary
              items={items}
              products={products}
              subtotal={subtotal}
              promoDiscount={promoDiscount}
              finalTotal={finalTotal}
              appliedPromoCode={appliedPromoCode}
              onPromoApplied={handlePromoApplied}
              onPromoRemoved={handlePromoRemoved}
            />
          </div>

          {/* Forms */}
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

              {/* Mobile-optimized submit button */}
              <div className={`${isMobile ? 'fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg' : ''}`}>
                <Button 
                  type="submit" 
                  className={`w-full h-12 text-base font-medium ${
                    isMobile ? 'rounded-lg' : ''
                  }`} 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      অর্ডার করা হচ্ছে...
                    </div>
                  ) : (
                    `৳${finalTotal.toLocaleString('bn-BD')} - অর্ডার করুন`
                  )}
                </Button>
              </div>
            </form>
            
            {/* Spacer for fixed button on mobile */}
            {isMobile && <div className="h-20"></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileResponsiveCheckout;
