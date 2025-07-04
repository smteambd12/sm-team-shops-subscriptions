
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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
  
  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString('bn-BD')}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const paymentOptions = [
    { value: 'bkash', label: 'বিকাশ', icon: '📱', color: 'bg-pink-100 border-pink-300' },
    { value: 'nagad', label: 'নগদ', icon: '💳', color: 'bg-orange-100 border-orange-300' },
    { value: 'rocket', label: 'রকেট', icon: '🚀', color: 'bg-purple-100 border-purple-300' }
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <CreditCard className="h-5 w-5 text-blue-600" />
          পেমেন্ট পদ্ধতি
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Payment Method Selection - Mobile Optimized */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">পেমেন্ট মাধ্যম নির্বাচন করুন *</Label>
          <RadioGroup 
            value={paymentMethod} 
            onValueChange={onPaymentMethodChange}
            className="grid grid-cols-1 gap-3"
          >
            {paymentOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label 
                  htmlFor={option.value} 
                  className={`flex-1 flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === option.value ? option.color : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <span className="text-xl">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Payment Instructions - Mobile Optimized */}
        {paymentMethod && getPaymentNumber() && (
          <Alert className="border-blue-200 bg-blue-50">
            <Smartphone className="h-4 w-4 text-blue-600" />
            <AlertDescription className="space-y-3">
              <div className="font-medium text-blue-800">
                {getPaymentMethodName()} এ পেমেন্ট করুন:
              </div>
              
              {/* Payment Amount */}
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="text-center">
                  <div className="text-sm text-gray-600">পেমেন্ট পরিমাণ</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(finalTotal)}
                  </div>
                </div>
              </div>

              {/* Payment Number */}
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">নাম্বার</div>
                    <div className="text-lg font-mono font-bold text-gray-900">
                      {getPaymentNumber()}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(getPaymentNumber())}
                    className="flex items-center gap-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'কপি হয়েছে' : 'কপি করুন'}
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2 text-sm text-blue-700">
                <p>১. উপরের নাম্বারে {formatCurrency(finalTotal)} টাকা পাঠান</p>
                <p>২. পেমেন্টের পর ট্রানজেকশন আইডি নিচের বক্সে লিখুন</p>
                <p>৩. অর্ডার কনফার্ম করুন</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Transaction ID Input - Mobile Optimized */}
        <div className="space-y-2">
          <Label htmlFor="transactionId" className="flex items-center gap-2 text-sm font-medium">
            <CreditCard className="h-4 w-4 text-gray-500" />
            ট্রানজেকশন আইডি *
          </Label>
          <div className="space-y-2">
            <Input
              id="transactionId"
              type="text"
              placeholder="যেমন: 9KA7F2X3RT"
              value={transactionId}
              onChange={(e) => onTransactionIdChange(e.target.value)}
              required
              className="h-11 text-base font-mono"
            />
            <div className="text-xs text-gray-500">
              পেমেন্ট করার পর যে ট্রানজেকশন আইডি পাবেন তা এখানে লিখুন
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="font-medium text-yellow-800 mb-1">নিরাপত্তা তথ্য:</p>
          <p>আপনার পেমেন্ট তথ্য সুরক্ষিত। আমরা কোনো কার্ড বা পিন নাম্বার সংরক্ষণ করি না।</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodForm;
