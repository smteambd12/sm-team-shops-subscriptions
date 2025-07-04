
import React from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';
import CustomerInfoForm from './checkout/CustomerInfoForm';
import PaymentMethodForm from './checkout/PaymentMethodForm';
import CheckoutOrderSummary from './checkout/CheckoutOrderSummary';
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
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
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
