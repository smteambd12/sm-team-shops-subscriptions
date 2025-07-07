import React, { useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Phone, Wallet, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const number = getPaymentNumber();
    if (number) {
      navigator.clipboard.writeText(number).then(() => {
        setCopied(true);
        toast.success('নাম্বার কপি হয়েছে ✅');
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const paymentNumber = getPaymentNumber();
  const paymentName = getPaymentMethodName();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-blue-700">
          <CreditCard className="h-5 w-5" />
          পেমেন্ট মাধ্যম
        </CardTitle>
        <CardDescription className="text-gray-600">
          অনুগ্রহ করে একটি পেমেন্ট মাধ্যম নির্বাচন করুন
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <RadioGroup
          value={paymentMethod}
          onValueChange={onPaymentMethodChange}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bkash" id="bkash" />
            <Label htmlFor="bkash" className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-pink-600" />
              <span className="text-pink-600 font-semibold">bKash</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nagad" id="nagad" />
            <Label htmlFor="nagad" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-orange-500" />
              <span className="text-orange-500 font-semibold">Nagad</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="rocket" id="rocket" />
            <Label htmlFor="rocket" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-purple-600" />
              <span className="text-purple-600 font-semibold">Rocket</span>
            </Label>
          </div>
        </RadioGroup>

        {/* ✅ Number + Copy Box (Mobile Friendly & Visible After Selection) */}
        {paymentNumber && (
          <div className="bg-gray-100 border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm text-gray-600">পেমেন্ট প্রাপক {paymentName} নাম্বার:</p>
              <p className="text-lg font-bold text-primary">{paymentNumber}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy} className="w-full sm:w-auto">
              <Copy className="h-4 w-4 mr-1" />
              {copied ? '✅ কপি হয়েছে' : 'কপি করুন'}
            </Button>
          </div>
        )}

        {/* ✅ Transaction ID Input */}
        <div>
          <Label htmlFor="transactionId">ট্রানজেকশন ID *</Label>
          <Input
            id="transactionId"
            value={transactionId}
            onChange={(e) => onTransactionIdChange(e.target.value)}
            placeholder="টাকা পাঠানোর পর আপনার ট্রানজেকশন ID দিন"
            required
          />
          <p className="text-sm text-gray-600 mt-1">
            {paymentNumber
              ? `এই নাম্বারে ৳${finalTotal.toLocaleString()} পাঠিয়ে ট্রানজেকশন ID দিন।`
              : 'নিচে ট্রানজেকশন ID দিন।'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodForm;
