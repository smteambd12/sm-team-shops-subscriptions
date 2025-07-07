import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { CreditCard, Phone, Wallet, Copy } from 'lucide-react';
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
        toast.success('🥳 নাম্বার সফলভাবে কপি হয়েছে!');
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const paymentNumber = getPaymentNumber();
  const paymentName = getPaymentMethodName();

  return (
    <Card className="bg-gradient-to-br from-white via-blue-50 to-pink-50 shadow-xl rounded-2xl border">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary">
          <CreditCard className="h-5 w-5" />
          পেমেন্ট পদ্ধতি নির্বাচন করুন
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          নিচে থেকে একটি পেমেন্ট মাধ্যম নির্বাচন করুন এবং প্রদর্শিত নাম্বারে সেন্ড মানি করুন।
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bkash" id="bkash" />
            <Label htmlFor="bkash" className="flex items-center gap-2 text-pink-600 font-medium">
              <Wallet className="h-4 w-4" />
              bKash
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nagad" id="nagad" />
            <Label htmlFor="nagad" className="flex items-center gap-2 text-orange-600 font-medium">
              <Phone className="h-4 w-4" />
              Nagad
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="rocket" id="rocket" />
            <Label htmlFor="rocket" className="flex items-center gap-2 text-purple-600 font-medium">
              <CreditCard className="h-4 w-4" />
              Rocket
            </Label>
          </div>
        </RadioGroup>

        {paymentNumber && (
          <div className="bg-white p-4 rounded-lg shadow border border-dashed border-primary/30 mt-4 space-y-2">
            <p className="text-base font-semibold text-primary">
              📱 {paymentName} নাম্বার: <span className="text-black">{paymentNumber}</span>
            </p>
            <p className="text-sm text-gray-600">
              অনুগ্রহ করে এই নাম্বারে <span className="font-semibold text-primary">৳{finalTotal.toLocaleString()}</span> টাকা সেন্ড মানি করুন।
            </p>
            <Button variant="outline" size="sm" onClick={handleCopy} className="mt-2">
              <Copy className="h-4 w-4 mr-1" />
              {copied ? '✅ কপি হয়েছে' : '📋 নাম্বার কপি করুন'}
            </Button>
          </div>
        )}

        <div>
          <Label htmlFor="transactionId" className="font-semibold">
            🔁 ট্রানজেকশন ID দিন *
          </Label>
          <Input
            id="transactionId"
            value={transactionId}
            onChange={(e) => onTransactionIdChange(e.target.value)}
            placeholder="এখানে ট্রানজেকশন ID লিখুন"
            required
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            পেমেন্ট করার পর আপনি যে ID পাবেন, সেটাই এখানে লিখবেন।
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodForm;
