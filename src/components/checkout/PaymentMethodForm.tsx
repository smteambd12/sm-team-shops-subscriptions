
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Phone, Wallet } from 'lucide-react';

interface PaymentMethodFormProps {
  paymentMethod: string;
  transactionId: string;
  onPaymentMethodChange: (method: string) => void;
  onTransactionIdChange: (id: string) => void;
  getPaymentNumber: () => string;
  getPaymentMethodName: () => string;
  finalTotal: number;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  paymentMethod,
  transactionId,
  onPaymentMethodChange,
  onTransactionIdChange,
  getPaymentNumber,
  getPaymentMethodName,
  finalTotal
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          পেমেন্ট মাধ্যম
        </CardTitle>
        <CardDescription>
          {getPaymentNumber() ? (
            <span className="font-medium text-primary">
              {getPaymentMethodName()} নম্বর: {getPaymentNumber()}
            </span>
          ) : (
            'পেমেন্ট মাধ্যম নির্বাচন করুন'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bkash" id="bkash" />
            <Label htmlFor="bkash" className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-pink-600" />
              bKash
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nagad" id="nagad" />
            <Label htmlFor="nagad" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-orange-600" />
              Nagad
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="rocket" id="rocket" />
            <Label htmlFor="rocket" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-purple-600" />
              Rocket
            </Label>
          </div>
        </RadioGroup>

        <div>
          <Label htmlFor="transactionId">ট্রানজেকশন ID *</Label>
          <Input
            id="transactionId"
            value={transactionId}
            onChange={(e) => onTransactionIdChange(e.target.value)}
            placeholder="পেমেন্টের ট্রানজেকশন ID"
            required
          />
          <p className="text-sm text-gray-600 mt-1">
            {getPaymentNumber()} নম্বরে ৳{finalTotal.toLocaleString()} টাকা পাঠানোর পর ট্রানজেকশন ID দিন।
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodForm;
