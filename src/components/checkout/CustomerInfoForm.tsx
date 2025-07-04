
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Phone, Mail, MapPin } from 'lucide-react';

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
  const handleChange = (field: keyof CustomerInfo, value: string) => {
    onCustomerInfoChange({
      ...customerInfo,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          গ্রাহকের তথ্য
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">পূর্ণ নাম *</Label>
          <Input
            id="name"
            value={customerInfo.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            ইমেইল *
          </Label>
          <Input
            id="email"
            type="email"
            value={customerInfo.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            ফোন নম্বর *
          </Label>
          <Input
            id="phone"
            value={customerInfo.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="01XXXXXXXXX"
            required
          />
        </div>
        <div>
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            ঠিকানা *
          </Label>
          <Textarea
            id="address"
            value={customerInfo.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="সম্পূর্ণ ঠিকানা লিখুন"
            required
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerInfoForm;
