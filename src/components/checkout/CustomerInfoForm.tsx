
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Phone, MapPin } from 'lucide-react';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onCustomerInfoChange: (info: CustomerInfo) => void;
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  customerInfo,
  onCustomerInfoChange
}) => {
  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    onCustomerInfoChange({
      ...customerInfo,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <User className="h-5 w-5 text-blue-600" />
          গ্রাহক তথ্য
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Mobile-optimized form layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4 text-gray-500" />
              পূর্ণ নাম *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="আপনার পূর্ণ নাম লিখুন"
              value={customerInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              className="h-11 text-base" // Better mobile touch targets
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4 text-gray-500" />
              ইমেইল ঠিকানা *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={customerInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="h-11 text-base"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
            <Phone className="h-4 w-4 text-gray-500" />
            মোবাইল নাম্বার *
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="০১৭xxxxxxxx"
            value={customerInfo.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            required
            className="h-11 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4 text-gray-500" />
            সম্পূর্ণ ঠিকানা *
          </Label>
          <Textarea
            id="address"
            placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন"
            value={customerInfo.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            required
            className="min-h-[80px] resize-none text-base"
            rows={3}
          />
        </div>

        {/* Mobile-specific helper text */}
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          <p>* চিহ্নিত ফিল্ডগুলো অবশ্যই পূরণ করতে হবে</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerInfoForm;
